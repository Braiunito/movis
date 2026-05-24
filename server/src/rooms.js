import { nanoid } from 'nanoid';

const rooms = new Map();

const ROOM_TTL_MS = 1000 * 60 * 60 * 6; // 6h
const GRACE_MS = 30_000; // tras un disconnect, esperamos esto antes de remover

export function createRoom({ mode = 'duo' } = {}) {
  const id = nanoid(8);
  const room = {
    id,
    mode, // solo | duo | group
    createdAt: Date.now(),
    participants: new Map(),     // participantId -> Participant
    socketIndex: new Map(),       // socketId -> participantId (solo conectados)
    suggestionHistory: [],
    discardedByVoters: new Set(),
    currentSuggestion: null,
    locked: false,
    _pendingRemovals: new Map(), // participantId -> timeoutId
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
      online: !!p.socketId,
    })),
    locked: room.locked,
    currentSuggestion: room.currentSuggestion,
  };
}

export function addParticipant(room, { socketId, name }) {
  const id = nanoid(10);
  const participant = {
    id,
    socketId,
    name: (name || 'Anónimo').trim().slice(0, 30),
    ready: false,
    preferences: null,
  };
  room.participants.set(id, participant);
  room.socketIndex.set(socketId, id);
  return participant;
}

/**
 * Vuelve a asociar a un participante existente con un nuevo socketId.
 * Cancela cualquier removal pendiente. Devuelve el participante o null si no existe.
 */
export function rejoinParticipant(room, { participantId, socketId }) {
  const p = room.participants.get(participantId);
  if (!p) return null;

  const pending = room._pendingRemovals.get(participantId);
  if (pending) {
    clearTimeout(pending);
    room._pendingRemovals.delete(participantId);
  }

  if (p.socketId && room.socketIndex.get(p.socketId) === participantId) {
    room.socketIndex.delete(p.socketId);
  }
  p.socketId = socketId;
  room.socketIndex.set(socketId, participantId);
  return p;
}

export function findBySocket(room, socketId) {
  const pid = room.socketIndex.get(socketId);
  return pid ? room.participants.get(pid) : null;
}

export function findById(room, participantId) {
  return room.participants.get(participantId) || null;
}

/**
 * Desliga un socket del participante (pero NO lo remueve).
 * Devuelve el participante afectado.
 */
export function detachSocket(room, socketId) {
  const pid = room.socketIndex.get(socketId);
  if (!pid) return null;
  room.socketIndex.delete(socketId);
  const p = room.participants.get(pid);
  if (p && p.socketId === socketId) p.socketId = null;
  return p;
}

/**
 * Programa la remoción definitiva del participante tras GRACE_MS.
 * Si vuelve antes (rejoin), la programación se cancela.
 * `onRemove(participant)` se invoca con el participante removido.
 */
export function scheduleRemoval(room, participantId, onRemove) {
  if (room._pendingRemovals.has(participantId)) return;
  const t = setTimeout(() => {
    room._pendingRemovals.delete(participantId);
    const p = room.participants.get(participantId);
    if (p && !p.socketId) {
      room.participants.delete(participantId);
      try { onRemove?.(p); } catch {}
    }
  }, GRACE_MS);
  room._pendingRemovals.set(participantId, t);
}

export function setReady(room, participantId, preferences) {
  const p = room.participants.get(participantId);
  if (!p) return null;
  p.preferences = preferences;
  p.ready = true;
  return p;
}

export function expectedCount(room) {
  if (room.mode === 'solo') return 1;
  if (room.mode === 'duo') return 2;
  return Math.max(2, room.participants.size); // group: lo que haya, mínimo 2
}

/**
 * Sólo está "todo listo" si:
 *  - hay al menos `expectedCount` participantes en la sala, y
 *  - todos están ready.
 * Así evitamos que en duo arranque con uno solo si el otro se desconecta.
 */
export function allReady(room) {
  const expected = expectedCount(room);
  if (room.participants.size < expected) return false;
  return [...room.participants.values()].every(p => p.ready);
}

// limpieza periódica
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL_MS && room.participants.size === 0) {
      for (const t of room._pendingRemovals.values()) clearTimeout(t);
      rooms.delete(id);
    }
  }
}, 1000 * 60 * 15);
