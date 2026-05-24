import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server as SocketServer } from 'socket.io';

import {
  createRoom, getRoom, roomPublic,
  addParticipant, removeParticipant,
  setReady, allReady,
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
});

io.on('connection', socket => {
  let joinedRoomId = null;

  socket.on('room:join', ({ roomId, name }, ack) => {
    const room = getRoom(roomId);
    if (!room) return ack?.({ error: 'No existe la sala' });
    if (room.locked) return ack?.({ error: 'La sala ya está cerrada' });

    const participant = addParticipant(room, { socketId: socket.id, name });
    socket.join(roomId);
    joinedRoomId = roomId;

    ack?.({ ok: true, me: participant, room: roomPublic(room) });
    io.to(roomId).emit('room:update', roomPublic(room));
  });

  socket.on('room:ready', async ({ preferences }, ack) => {
    if (!joinedRoomId) return ack?.({ error: 'No estás en una sala' });
    const room = getRoom(joinedRoomId);
    if (!room) return ack?.({ error: 'Sala no encontrada' });

    setReady(room, socket.id, preferences);
    io.to(joinedRoomId).emit('room:update', roomPublic(room));
    ack?.({ ok: true });

    if (allReady(room) && !room.locked) {
      room.locked = true;
      io.to(joinedRoomId).emit('room:all_ready');
      try {
        const agg = aggregatePreferences([...room.participants.values()]);
        const movie = await nextRecommendation(agg, room.suggestionHistory);
        room.currentSuggestion = movie;
        if (movie) room.suggestionHistory.push(movie.id);
        io.to(joinedRoomId).emit('room:suggestion', movie);
      } catch (e) {
        io.to(joinedRoomId).emit('room:error', { message: e.message });
      }
    }
  });

  socket.on('room:next', async (_payload, ack) => {
    if (!joinedRoomId) return ack?.({ error: 'No estás en una sala' });
    const room = getRoom(joinedRoomId);
    if (!room) return ack?.({ error: 'Sala no encontrada' });
    try {
      const agg = aggregatePreferences([...room.participants.values()]);
      const movie = await nextRecommendation(agg, room.suggestionHistory);
      room.currentSuggestion = movie;
      if (movie) room.suggestionHistory.push(movie.id);
      io.to(joinedRoomId).emit('room:suggestion', movie);
      ack?.({ ok: true });
    } catch (e) {
      ack?.({ error: e.message });
    }
  });

  socket.on('room:seen', async (_payload, ack) => {
    if (!joinedRoomId) return ack?.({ error: 'No estás en una sala' });
    const room = getRoom(joinedRoomId);
    if (!room?.currentSuggestion) return ack?.({ error: 'Nada que marcar' });
    room.discardedByVoters.add(room.currentSuggestion.id);
    socket.emit('room:notice', { message: 'Marcada como vista. Buscando otra...' });
    try {
      const agg = aggregatePreferences([...room.participants.values()]);
      const movie = await nextRecommendation(agg, room.suggestionHistory);
      room.currentSuggestion = movie;
      if (movie) room.suggestionHistory.push(movie.id);
      io.to(joinedRoomId).emit('room:suggestion', movie);
      ack?.({ ok: true });
    } catch (e) {
      ack?.({ error: e.message });
    }
  });

  socket.on('disconnect', () => {
    if (!joinedRoomId) return;
    const room = getRoom(joinedRoomId);
    if (!room) return;
    removeParticipant(room, socket.id);
    io.to(joinedRoomId).emit('room:update', roomPublic(room));
  });
});

server.listen(PORT, () => {
  console.log(`[movis] server on http://localhost:${PORT} (origin: ${ORIGIN})`);
});
