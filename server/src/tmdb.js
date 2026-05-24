import 'dotenv/config';

const BASE = 'https://api.themoviedb.org/3';
const KEY = process.env.TMDB_API_KEY;
const BEARER = process.env.TMDB_BEARER;

if (!KEY && !BEARER) {
  console.warn('[tmdb] Falta TMDB_API_KEY o TMDB_BEARER en .env');
}

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);
  if (!BEARER && KEY) url.searchParams.set('api_key', KEY);
  url.searchParams.set('language', params.language || 'es-ES');
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (k === 'language') continue;
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: BEARER ? { Authorization: `Bearer ${BEARER}` } : {},
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB ${res.status}: ${body}`);
  }
  return res.json();
}

let genreCache = null;
export async function getGenres() {
  if (genreCache) return genreCache;
  const data = await tmdb('/genre/movie/list');
  genreCache = data.genres;
  return genreCache;
}

export async function searchMovie(query) {
  if (!query?.trim()) return [];
  const data = await tmdb('/search/movie', { query, include_adult: false, page: 1 });
  return data.results.slice(0, 8).map(m => ({
    id: m.id,
    title: m.title,
    year: m.release_date ? m.release_date.slice(0, 4) : '',
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w154${m.poster_path}` : null,
    overview: m.overview,
    genre_ids: m.genre_ids,
  }));
}

export async function getMovieDetails(id) {
  const data = await tmdb(`/movie/${id}`, { append_to_response: 'keywords,credits,watch/providers,videos' });
  return data;
}

export async function discover(params) {
  const data = await tmdb('/discover/movie', {
    include_adult: false,
    sort_by: 'popularity.desc',
    'vote_count.gte': 50,
    page: params.page || 1,
    ...params,
  });
  return data.results;
}

export async function getWatchProviders(region = 'ES') {
  const data = await tmdb('/watch/providers/movie', { watch_region: region });
  return data.results
    .filter(p => p.display_priority < 30)
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, 12)
    .map(p => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`,
    }));
}
