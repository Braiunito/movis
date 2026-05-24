const PROFILE_KEY = 'movis:profile';
const SESSION_KEY = 'movis:sessions';

export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; }
  catch { return {}; }
}

export function saveProfile(partial) {
  const cur = loadProfile();
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...cur, ...partial }));
}

/** Devuelve el participantId guardado para una room, si existe. */
export function loadSession(roomId) {
  try {
    const all = JSON.parse(localStorage.getItem(SESSION_KEY)) || {};
    return all[roomId] || null;
  } catch { return null; }
}

export function saveSession(roomId, participantId) {
  try {
    const all = JSON.parse(localStorage.getItem(SESSION_KEY)) || {};
    all[roomId] = participantId;
    localStorage.setItem(SESSION_KEY, JSON.stringify(all));
  } catch {}
}

export function clearSession(roomId) {
  try {
    const all = JSON.parse(localStorage.getItem(SESSION_KEY)) || {};
    delete all[roomId];
    localStorage.setItem(SESSION_KEY, JSON.stringify(all));
  } catch {}
}
