const KEY = 'movis:profile';

export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

export function saveProfile(partial) {
  const cur = loadProfile();
  localStorage.setItem(KEY, JSON.stringify({ ...cur, ...partial }));
}
