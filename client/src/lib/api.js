async function j(res) {
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export const api = {
  genres: () => fetch('/api/genres').then(j),
  providers: (region = 'ES') => fetch(`/api/providers?region=${region}`).then(j),
  search: q => fetch(`/api/search?q=${encodeURIComponent(q)}`).then(j),
  createRoom: mode => fetch('/api/rooms', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode }),
  }).then(j),
  room: id => fetch(`/api/rooms/${id}`).then(j),
};
