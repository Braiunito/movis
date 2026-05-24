import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server as SocketServer } from 'socket.io';

import {
  createRoom, getRoom, roomPublic,
  addParticipant, rejoinParticipant,
  detachSocket, scheduleRemoval,
  setReady, allReady, findById,
} from './rooms.js';
import { getGenres, searchMovie, getWatchProviders } from './tmdb.js';
import { aggregatePreferences, nextRecommendation } from './recommend.js';

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/genres', async (_req, res) => {
  try { res.json(await getGenres()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/providers', async (req, res) => {
  try { res.json(await getWatchProviders(req.query.region || 'ES')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/search', async (req, res) => {
  try { res.json(await searchMovie(req.query.q)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/rooms', (req, res) => {
  const { mode } = req.body || {};
  if (!['solo', 'duo', 'group'].includes(mode)) {
    return res.status(400).json({ error: 'mode debe ser solo|duo|group' });
  }
  const room = createRoom({ mode });
  res.json({ id: room.id, mode: room.mode });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: 'No existe la sala' });
  res.json(roomPublic(room));
});

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: ORIGIN, credentials: true },
  // ping más agresivo para detectar desconexiones reales antes
  pingInterval: 20_000,
  pingTimeout: 25_000,
});

async function generateAndBroadcast(room, roomId) {
  try {
    const agg = aggregatePreferences([...room.participants.values()]);
    const movie = await nextRecommendation(agg, room.suggestionHistory);
    room.currentSuggestion = movie;
    if (movie) room.suggestionHistory.push(movie.id);
    io.to(roomId).emit('room:suggestion', movie);
    return movie;
  } catch (e) {
    io.to(roomId).emit('room:error', { message: e.message });
    return null;
  }
}

io.on('connection', socket => {
  let joinedRoomId = null;
  let myParticipantId = null;

  function bind(roomId, participantId) {
    joinedRoomId = roomId;
    myParticipantId = participantId;
  }

  socket.on('room:join', ({ roomId, name }, ack) => {
    const room = getRoom(roomId);
    if (!room) return ack?.({ error: 'No existe la sala' });
    if (room.locked) return ack?.({ error: 'La sala ya está cerrada' });

    const participant = addParticipant(room, { socketId: socket.id, name });
    socket.join(roomId);
    bind(roomId, participant.id);

    ack?.({ ok: true, me: participant, room: roomPublic(room) });
    io.to(roomId).emit('room:update', roomPublic(room));
  });

  socket.on('room:rejoin', ({ roomId, participantId }, ack) => {
    const room = getRoom(roomId);
    if (!room) return ack?.({ error: 'No existe la sala' });

    const p = rejoinParticipant(room, { participantId, socketId: socket.id });
    if (!p) return ack?.({ error: 'Tu sesión ya no está en la sala' });

    socket.join(roomId);
    bind(roomId, p.id);

    ack?.({
      ok: true,
      me: p,
      room: roomPublic(room),
      suggestion: room.currentSuggestion,
      phase: room.currentSuggestion ? 'result' : (room.locked ? 'waiting' : (p.ready ? 'waiting' : 'wizard')),
    });
    io.to(roomId).emit('room:update', roomPublic(room));
  });

  socket.on('room:ready', async ({ preferences }, ack) => {
    if (!joinedRoomId || !myParticipantId) return ack?.({ error: 'No estás en una sala' });
    const room = getRoom(joinedRoomId);
    if (!room) return ack?.({ error: 'Sala no encontrada' });

    setReady(room, myParticipantId, preferences);
    io.to(joinedRoomId).emit('room:update', roomPublic(room));
    ack?.({ ok: true });

    if (allReady(room) && !room.locked) {
      room.locked = true;
      io.to(joinedRoomId).emit('room:all_ready');
      await generateAndBroadcast(room, joinedRoomId);
    }
  });

  socket.on('room:next', async (_payload, ack) => {
    if (!joinedRoomId || !myParticipantId) return ack?.({ error: 'No estás en una sala' });
    const room = getRoom(joinedRoomId);
    if (!room) return ack?.({ error: 'Sala no encontrada' });
    const movie = await generateAndBroadcast(room, joinedRoomId);
    ack?.({ ok: !!movie });
  });

  socket.on('room:seen', async (_payload, ack) => {
    if (!joinedRoomId || !myParticipantId) return ack?.({ error: 'No estás en una sala' });
    const room = getRoom(joinedRoomId);
    if (!room?.currentSuggestion) return ack?.({ error: 'Nada que marcar' });
    room.discardedByVoters.add(room.currentSuggestion.id);
    socket.emit('room:notice', { message: 'Marcada como vista. Buscando otra...' });
    const movie = await generateAndBroadcast(room, joinedRoomId);
    ack?.({ ok: !!movie });
  });

  socket.on('disconnect', () => {
    if (!joinedRoomId) return;
    const room = getRoom(joinedRoomId);
    if (!room) return;
    const p = detachSocket(room, socket.id);
    if (!p) return;
    // Avisamos "offline" inmediatamente para feedback visual,
    // pero NO lo removemos: damos GRACE_MS para que reconecte vía room:rejoin.
    io.to(joinedRoomId).emit('room:update', roomPublic(room));
    scheduleRemoval(room, p.id, () => {
      const r = getRoom(joinedRoomId);
      if (r) io.to(joinedRoomId).emit('room:update', roomPublic(r));
    });
  });
});

server.listen(PORT, () => {
  console.log(`[movis] server on http://localhost:${PORT} (origin: ${ORIGIN})`);
});
