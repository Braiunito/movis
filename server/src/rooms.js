import { nanoid } from 'nanoid';

const rooms = new Map();

const ROOM_TTL_MS = 1000 * 60 * 60 * 6; // 6h

export function createRoom({ mode = 'duo' } = {}) {
  const id = nanoid(8);
  const room = {
    id,
    mode, // solo | duo | group
    createdAt: Date.now(),
    participants: new Map(), // socketId -> { id, name, ready, preferences }
    suggestionHistory: [], // movie ids already recommended
    discardedByVoters: new Set(), // movies someone marked as "already seen"
    currentSuggestion: null,
    locked: false,
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id) {
  return rooms.get(id);
}

export function roomPublic(room) {
  if (!room) return null;
  return {
    id: room.id,
    mode: room.mode,
    participants: [...room.participants.values()].map(p => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
    })),
    locked: room.locked,
    currentSuggestion: room.currentSuggestion,
  };
}

export function addParticipant(room, { socketId, name }) {
  const id = nanoid(6);
  const participant = {
    id,
    socketId,
    name: (name || 'Anónimo').trim().slice(0, 30),
    ready: false,
    preferences: null,
  };
  room.participants.set(socketId, participant);
  return participant;
}

export function removeParticipant(room, socketId) {
  room.participants.delete(socketId);
}

export function setReady(room, socketId, preferences) {
  const p = room.participants.get(socketId);
  if (!p) return null;
  p.preferences = preferences;
  p.ready = true;
  return p;
}

export function allReady(room) {
  if (room.participants.size === 0) return false;
  return [...room.participants.values()].every(p => p.ready);
}

export function expectedCount(room) {
  if (room.mode === 'solo') return 1;
  if (room.mode === 'duo') return 2;
  return Math.max(2, room.participants.size); // group: lo que haya
}

// limpieza periódica
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL_MS && room.participants.size === 0) {
      rooms.delete(id);
    }
  }
}, 1000 * 60 * 15);
