import { discover, getMovieDetails } from './tmdb.js';

/**
 * Agrega las preferencias del grupo:
 *  - NO géneros: unión estricta (si UNO dice no, fuera)
 *  - SÍ géneros: unión, ponderado por nº de votos (se usa orden, no exclusión)
 *  - favoritas: se toman sus géneros + keywords como bonus
 *  - región/idioma: la primera no vacía (TODO: votación)
 *  - año mínimo: el más restrictivo (el mayor)
 *  - duración max: el más restrictivo (el menor)
 *  - rating mínimo: el más restrictivo (el mayor)
 *  - providers (plataformas): intersección si todos eligieron alguna, si no unión
 */
export function aggregatePreferences(participants) {
  const prefs = participants.map(p => p.preferences).filter(Boolean);
  if (prefs.length === 0) return null;

  const noGenres = new Set();
  const yesGenreCount = new Map();
  const favoriteMovieIds = new Set();

  let region = 'ES';
  let language = 'es-ES';
  let minYear = 0;
  let maxRuntime = 999;
  let minRating = 0;

  const providerSets = [];

  for (const p of prefs) {
    (p.dislikedGenres || []).forEach(g => noGenres.add(g));
    (p.likedGenres || []).forEach(g => {
      yesGenreCount.set(g, (yesGenreCount.get(g) || 0) + 1);
    });
    (p.favoriteMovies || []).forEach(m => favoriteMovieIds.add(m.id));

    if (p.region) region = p.region;
    if (p.language) language = p.language;
    if (p.minYear) minYear = Math.max(minYear, Number(p.minYear));
    if (p.maxRuntime) maxRuntime = Math.min(maxRuntime, Number(p.maxRuntime));
    if (p.minRating) minRating = Math.max(minRating, Number(p.minRating));
    if (p.providers?.length) providerSets.push(new Set(p.providers));
  }

  // SÍ géneros menos los descartados por alguien
  const yesGenres = [...yesGenreCount.entries()]
    .filter(([g]) => !noGenres.has(g))
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);

  // providers: intersección si todos aportaron; si no, unión
  let providers = [];
  if (providerSets.length === prefs.length && providerSets.length > 0) {
    providers = [...providerSets[0]].filter(id =>
      providerSets.every(s => s.has(id))
    );
    if (providers.length === 0) {
      providers = [...new Set(providerSets.flatMap(s => [...s]))];
    }
  } else {
    providers = [...new Set(providerSets.flatMap(s => [...s]))];
  }

  return {
    noGenres: [...noGenres],
    yesGenres,
    favoriteMovieIds: [...favoriteMovieIds],
    region,
    language,
    minYear,
    maxRuntime: maxRuntime < 999 ? maxRuntime : null,
    minRating,
    providers,
  };
}

/**
 * Devuelve la siguiente recomendación para la sala.
 * Excluye `excludeIds`. Va paginando si hace falta.
 */
export async function nextRecommendation(agg, excludeIds = []) {
  if (!agg) return null;

  // Enriquecer con géneros y keywords de las favoritas
  const favoriteData = await Promise.all(
    agg.favoriteMovieIds.slice(0, 5).map(id =>
      getMovieDetails(id).catch(() => null)
    )
  );

  const bonusGenres = new Set();
  const bonusKeywords = new Set();
  for (const m of favoriteData) {
    if (!m) continue;
    (m.genres || []).forEach(g => {
      if (!agg.noGenres.includes(g.id)) bonusGenres.add(g.id);
    });
    (m.keywords?.keywords || []).slice(0, 4).forEach(k => bonusKeywords.add(k.id));
  }

  const combinedYes = [...new Set([...agg.yesGenres, ...bonusGenres])];

  const baseParams = {
    language: agg.language,
    watch_region: agg.region,
    with_genres: combinedYes.length ? combinedYes.slice(0, 4).join(',') : undefined,
    without_genres: agg.noGenres.length ? agg.noGenres.join(',') : undefined,
    with_keywords: bonusKeywords.size ? [...bonusKeywords].slice(0, 6).join('|') : undefined,
    'primary_release_date.gte': agg.minYear ? `${agg.minYear}-01-01` : undefined,
    'with_runtime.lte': agg.maxRuntime || undefined,
    'vote_average.gte': agg.minRating || undefined,
    with_watch_providers: agg.providers?.length ? agg.providers.join('|') : undefined,
  };

  const exclude = new Set([...excludeIds, ...agg.favoriteMovieIds]);

  // Probamos hasta 4 páginas, e ir relajando filtros si nada cuadra
  const attempts = [
    baseParams,
    { ...baseParams, with_keywords: undefined },
    { ...baseParams, with_keywords: undefined, with_watch_providers: undefined },
    { ...baseParams, with_keywords: undefined, with_watch_providers: undefined, 'with_runtime.lte': undefined, 'vote_average.gte': undefined },
  ];

  for (const params of attempts) {
    for (let page = 1; page <= 3; page++) {
      const results = await discover({ ...params, page }).catch(() => []);
      const candidate = results.find(m => !exclude.has(m.id) && m.poster_path);
      if (candidate) {
        return shape(candidate, params.language);
      }
    }
  }
  return null;
}

function shape(m, language) {
  return {
    id: m.id,
    title: m.title,
    originalTitle: m.original_title,
    year: m.release_date ? m.release_date.slice(0, 4) : '',
    overview: m.overview,
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
    rating: m.vote_average?.toFixed(1),
    voteCount: m.vote_count,
    language,
    tmdbUrl: `https://www.themoviedb.org/movie/${m.id}`,
  };
}
