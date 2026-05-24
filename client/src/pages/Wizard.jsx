import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const STEPS = ['nope', 'yass', 'faves', 'extras'];

export default function Wizard({ room, me, onSubmit }) {
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState([]);
  const [providers, setProviders] = useState([]);

  const [disliked, setDisliked] = useState([]);
  const [liked, setLiked] = useState([]);
  const [favorites, setFavorites] = useState([]); // {id,title,year,poster}
  const [extras, setExtras] = useState({
    region: 'ES',
    language: 'es-ES',
    minYear: '',
    maxRuntime: '',
    minRating: '',
    providers: [],
  });

  useEffect(() => {
    api.genres().then(setGenres).catch(() => {});
    api.providers('ES').then(setProviders).catch(() => {});
  }, []);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/r/${room?.id || ''}`;
  }, [room?.id]);

  function toggleDislike(id) {
    setDisliked(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      // si pasa a NO y estaba en SÍ, sácalo del SÍ
      setLiked(l => l.filter(x => x !== id));
      return [...prev, id];
    });
  }

  function toggleLike(id) {
    if (disliked.includes(id)) return;
    setLiked(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function toggleProvider(id) {
    setExtras(e => ({
      ...e,
      providers: e.providers.includes(id)
        ? e.providers.filter(x => x !== id)
        : [...e.providers, id],
    }));
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  }
  function back() { if (step > 0) setStep(step - 1); }

  function submit() {
    onSubmit({
      dislikedGenres: disliked,
      likedGenres: liked,
      favoriteMovies: favorites,
      region: extras.region,
      language: extras.language,
      minYear: extras.minYear ? Number(extras.minYear) : null,
      maxRuntime: extras.maxRuntime ? Number(extras.maxRuntime) : null,
      minRating: extras.minRating ? Number(extras.minRating) : null,
      providers: extras.providers,
    });
  }

  const canAdvance =
    (step === 0 && disliked.length === 3) ||
    (step === 1 && liked.length === 3) ||
    step === 2 ||
    step === 3;

  return (
    <div className="shell">
      <ShareBox room={room} url={shareUrl} />

      <div className="progress">
        {STEPS.map((s, i) => (
          <span key={s} className={i < step ? 'done' : i === step ? 'on' : ''} />
        ))}
      </div>

      {step === 0 && (
        <StepGenres
          title="¿Qué NO te apetece?"
          subtitle="Elige 3 géneros que NO quieres ver hoy."
          colorClass="no"
          genres={genres}
          selected={disliked}
          toggle={toggleDislike}
          counter={`${disliked.length}/3`}
        />
      )}

      {step === 1 && (
        <StepGenres
          title="¿Qué SÍ te apetece?"
          subtitle="Elige 3 géneros que te apetecerían. (los que pusiste en NO no aparecen)"
          colorClass="yes"
          genres={genres.filter(g => !disliked.includes(g.id))}
          selected={liked}
          toggle={toggleLike}
          counter={`${liked.length}/3`}
        />
      )}

      {step === 2 && (
        <StepFavorites favorites={favorites} setFavorites={setFavorites} />
      )}

      {step === 3 && (
        <StepExtras extras={extras} setExtras={setExtras} providers={providers} toggleProvider={toggleProvider} />
      )}

      <div className="row">
        {step > 0 && <button onClick={back} className="ghost">Atrás</button>}
        <button onClick={next} disabled={!canAdvance}>
          {step === STEPS.length - 1 ? '¡Listo!' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}

function ShareBox({ room, url }) {
  const [copied, setCopied] = useState(false);
  if (!room || room.mode === 'solo') return null;
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="card stack">
      <div className="label">Comparte este link con {room.mode === 'duo' ? 'tu pareja' : 'el grupo'}:</div>
      <div className="share-box">
        <input value={url} readOnly />
        <button onClick={copy}>{copied ? '¡Copiado!' : 'Copiar'}</button>
      </div>
      <div className="participants">
        {(room.participants || []).map(p => (
          <span key={p.id} className={`pill ${p.ready ? 'ready' : ''}`}>
            {p.name} {p.ready ? '✓' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepGenres({ title, subtitle, colorClass, genres, selected, toggle, counter }) {
  return (
    <div className="card stack">
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
      <div className="row">
        {genres.map(g => {
          const isOn = selected.includes(g.id);
          const max = selected.length >= 3 && !isOn;
          return (
            <span
              key={g.id}
              className={`chip ${isOn ? colorClass : ''} ${max ? 'disabled' : ''}`}
              onClick={() => !max && toggle(g.id)}
            >
              {g.name}
            </span>
          );
        })}
      </div>
      <div className="label" style={{ textAlign: 'right' }}>{counter}</div>
    </div>
  );
}

function StepFavorites({ favorites, setFavorites }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      api.search(q).then(setResults).catch(() => setResults([]));
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  function add(m) {
    if (favorites.find(f => f.id === m.id)) return;
    if (favorites.length >= 5) return;
    setFavorites([...favorites, m]);
    setQ('');
    setResults([]);
  }
  function remove(id) {
    setFavorites(favorites.filter(f => f.id !== id));
  }

  return (
    <div className="card stack">
      <h2>Última peli que te gustó</h2>
      <p className="muted">Añade hasta 5. Las usamos como pista de tu rollo. (Opcional, puedes saltar)</p>
      <input
        placeholder="Busca una peli..."
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="search-list">
          {results.map(m => (
            <li key={m.id} onClick={() => add(m)}>
              {m.poster
                ? <img src={m.poster} alt="" />
                : <div style={{ width: 44, height: 66, background: '#ddd', borderRadius: 6 }} />}
              <div>
                <div style={{ fontWeight: 800 }}>{m.title}</div>
                <div className="muted">{m.year}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {favorites.length > 0 && (
        <div className="fav-list">
          {favorites.map(f => (
            <span key={f.id} className="fav">
              {f.title} <span className="x" onClick={() => remove(f.id)}>×</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StepExtras({ extras, setExtras, providers, toggleProvider }) {
  return (
    <div className="card stack">
      <h2>Últimos detalles</h2>
      <p className="muted">Todo opcional. Cuanto menos pongas, más opciones tendremos.</p>

      <div className="row" style={{ justifyContent: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <div className="label">Idioma</div>
          <select value={extras.language} onChange={e => setExtras({ ...extras, language: e.target.value })}>
            <option value="es-ES">Español (ES)</option>
            <option value="es-MX">Español (LATAM)</option>
            <option value="en-US">English</option>
            <option value="fr-FR">Français</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 100 }}>
          <div className="label">Región</div>
          <select value={extras.region} onChange={e => setExtras({ ...extras, region: e.target.value })}>
            <option>ES</option><option>MX</option><option>AR</option>
            <option>US</option><option>FR</option><option>DE</option>
          </select>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div className="label">Desde el año</div>
          <input
            type="number" min="1900" max="2030" placeholder="cualquiera"
            value={extras.minYear}
            onChange={e => setExtras({ ...extras, minYear: e.target.value })}
          />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div className="label">Duración máx (min)</div>
          <input
            type="number" min="40" max="400" placeholder="sin límite"
            value={extras.maxRuntime}
            onChange={e => setExtras({ ...extras, maxRuntime: e.target.value })}
          />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div className="label">Nota mínima</div>
          <input
            type="number" min="0" max="10" step="0.5" placeholder="cualquiera"
            value={extras.minRating}
            onChange={e => setExtras({ ...extras, minRating: e.target.value })}
          />
        </div>
      </div>

      {providers.length > 0 && (
        <>
          <div className="label">Plataformas (donde tienes cuenta)</div>
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            {providers.map(p => {
              const on = extras.providers.includes(p.id);
              return (
                <span
                  key={p.id}
                  className={`chip ${on ? 'yes' : ''}`}
                  onClick={() => toggleProvider(p.id)}
                  title={p.name}
                >
                  <img src={p.logo} alt="" style={{ width: 22, height: 22, borderRadius: 4 }} />
                  {p.name}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
