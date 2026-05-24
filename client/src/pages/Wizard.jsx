import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import Icon from '../components/Icon.jsx';
import Toast from '../components/Toast.jsx';

const STEPS = ['nope', 'yass', 'faves', 'extras'];
const STEP_NAMES = ['Lo que NO', 'Lo que SÍ', 'Favoritas', 'Detalles'];

export default function Wizard({ room, me, onSubmit }) {
  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState([]);
  const [providers, setProviders] = useState([]);

  const [disliked, setDisliked] = useState([]);
  const [liked, setLiked] = useState([]);
  const [favorites, setFavorites] = useState([]); // {id,title,year,poster}
  const [extras, setExtras] = useState({
    region: 'AR',
    language: 'es-MX',
    minYear: '',
    maxRuntime: '',
    minRating: '',
    providers: [],
  });

  useEffect(() => {
    api.genres().then(setGenres).catch(() => {});
    api.providers('AR').then(setProviders).catch(() => {});
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

  const isLast = step === STEPS.length - 1;

  return (
    <div className="shell">
      <ShareBox room={room} url={shareUrl} />

      <div className="stack full" style={{ gap: 6, alignItems: 'center' }}>
        <span className="label step-label">Paso {step + 1} de 4 · {STEP_NAMES[step]}</span>
        <div className="progress">
          {STEPS.map((s, i) => (
            <span key={s} className={i < step ? 'done' : i === step ? 'on' : ''} />
          ))}
        </div>
      </div>

      {/* key fuerza el remontaje -> animación de transición step-in en cada cambio */}
      <div key={step} className="step-in full">
        {step === 0 && (
          <StepGenres
            title="¿Qué NO tenés ganas de ver?"
            subtitle="Elegí 3 géneros que NO querés ver hoy."
            colorClass="no"
            genres={genres}
            selected={disliked}
            toggle={toggleDislike}
          />
        )}

        {step === 1 && (
          <StepGenres
            title="¿Qué SÍ tenés ganas de ver?"
            subtitle="Elegí 3 géneros que te tienten. (los que descartaste no aparecen)"
            colorClass="yes"
            genres={genres.filter(g => !disliked.includes(g.id))}
            selected={liked}
            toggle={toggleLike}
          />
        )}

        {step === 2 && (
          <StepFavorites favorites={favorites} setFavorites={setFavorites} />
        )}

        {step === 3 && (
          <StepExtras extras={extras} setExtras={setExtras} providers={providers} toggleProvider={toggleProvider} />
        )}
      </div>

      <div className="nav-footer">
        {step > 0 && (
          <button onClick={back} className="ghost">
            <Icon name="arrow-left" size={18} /> Atrás
          </button>
        )}
        <button
          onClick={next}
          disabled={!canAdvance}
          className={`primary-nav ${canAdvance ? 'cta-attention' : ''}`}
        >
          {isLast ? (
            <><Icon name="check" size={20} /> ¡Dale!</>
          ) : (
            <>Siguiente <Icon name="arrow-right" size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function ShareBox({ room, url }) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  if (!room || room.mode === 'solo') return null;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setToast('Link copiado');
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="card stack full">
      <div className="label">
        Compartí este link con {room.mode === 'duo' ? 'tu pareja' : 'el grupo'}
      </div>
      <div className="share-box">
        <input value={url} readOnly aria-label="Link de la sala" />
        <button onClick={copy} className={`small ${copied ? 'copied' : ''}`}>
          <Icon name={copied ? 'check' : 'copy'} size={16} />
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <Participants participants={room.participants || []} />
      <Toast message={toast} variant="success" onDone={() => setToast('')} />
    </div>
  );
}

function Participants({ participants }) {
  return (
    <div className="participants">
      {participants.map(p => {
        const initial = (p.name || '?').trim().charAt(0).toUpperCase();
        return (
          <span key={p.id} className={`pill ${p.ready ? 'ready' : ''}`}>
            <span className="avatar">{initial}</span>
            <span>{p.name}</span>
            <span className="pill-end">
              {p.ready ? <Icon name="check" size={16} /> : <span className="mini-spinner" />}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function StepGenres({ title, subtitle, colorClass, genres, selected, toggle }) {
  const counter = `${selected.length}/3`;
  const full = selected.length >= 3;
  return (
    <div className="card stack">
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
      <div className="row">
        {genres.map(g => {
          const isOn = selected.includes(g.id);
          const max = full && !isOn;
          return (
            <button
              key={g.id}
              type="button"
              className={`chip ${isOn ? colorClass : ''} ${max ? 'disabled' : ''}`}
              aria-pressed={isOn}
              disabled={max}
              onClick={() => !max && toggle(g.id)}
            >
              {isOn && <Icon name={colorClass === 'yes' ? 'check' : 'x'} size={16} />}
              {g.name}
            </button>
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
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    const t = setTimeout(() => {
      api.search(q)
        .then(r => { setResults(r); setSearched(true); })
        .catch(() => { setResults([]); setSearched(true); });
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  function add(m) {
    if (favorites.find(f => f.id === m.id)) return;
    if (favorites.length >= 5) return;
    setFavorites([...favorites, m]);
    setQ('');
    setResults([]);
    setSearched(false);
  }
  function remove(id) {
    setFavorites(favorites.filter(f => f.id !== id));
  }

  return (
    <div className="card stack">
      <h2>Última peli que te gustó</h2>
      <p className="muted">Agregá hasta 5. Las usamos como pista de tu onda. Opcional, podés saltar.</p>

      <div className="field">
        <div className="share-box" style={{ paddingLeft: 14 }}>
          <Icon name="search" size={20} style={{ color: 'var(--ink-55)', flex: 'none' }} />
          <input
            placeholder="Buscá una peli…"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Buscar película favorita"
          />
        </div>
      </div>

      {results.length > 0 && (
        <ul className="search-list">
          {results.map(m => (
            <li key={m.id} role="button" aria-label={`Añadir ${m.title}`}
                onClick={() => add(m)} tabIndex={0}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), add(m))}>
              {m.poster
                ? <img src={m.poster} alt="" />
                : <div className="thumb" />}
              <div>
                <div className="item-title">{m.title}</div>
                <div className="item-year">{m.year}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {searched && results.length === 0 && q.trim() && (
        <div className="search-empty">Nada por acá… probá con otro título</div>
      )}

      {favorites.length > 0 && (
        <div className="fav-list">
          {favorites.map(f => (
            <span key={f.id} className="fav">
              <Icon name="heart" size={14} />
              {f.title}
              <button
                type="button"
                className="x"
                aria-label={`Sacar ${f.title}`}
                onClick={() => remove(f.id)}
              >
                <Icon name="x" size={12} />
              </button>
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
      <p className="muted">Todo opcional. Mientras menos pongas, más opciones tenemos.</p>

      <div className="fields-grid two">
        <div className="field">
          <label className="label" htmlFor="ex-lang">Idioma</label>
          <select id="ex-lang" value={extras.language} onChange={e => setExtras({ ...extras, language: e.target.value })}>
            <option value="es-MX">Español (LATAM)</option>
            <option value="es-ES">Español (España)</option>
            <option value="en-US">English</option>
            <option value="fr-FR">Français</option>
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="ex-region">Región</label>
          <select id="ex-region" value={extras.region} onChange={e => setExtras({ ...extras, region: e.target.value })}>
            <option>AR</option><option>MX</option><option>CL</option>
            <option>CO</option><option>UY</option><option>ES</option>
            <option>US</option>
          </select>
        </div>
      </div>

      <div className="fields-grid three">
        <div className="field">
          <label className="label" htmlFor="ex-year">Desde el año</label>
          <input
            id="ex-year"
            type="number" min="1900" max="2030" placeholder="cualquiera"
            value={extras.minYear}
            onChange={e => setExtras({ ...extras, minYear: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="ex-runtime">Duración máx (min)</label>
          <input
            id="ex-runtime"
            type="number" min="40" max="400" placeholder="sin límite"
            value={extras.maxRuntime}
            onChange={e => setExtras({ ...extras, maxRuntime: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="ex-rating">Nota mínima</label>
          <input
            id="ex-rating"
            type="number" min="0" max="10" step="0.5" placeholder="cualquiera"
            value={extras.minRating}
            onChange={e => setExtras({ ...extras, minRating: e.target.value })}
          />
        </div>
      </div>

      {providers.length > 0 && (
        <div className="field">
          <span className="label">Plataformas (donde tenés cuenta)</span>
          <div className="row start">
            {providers.map(p => {
              const on = extras.providers.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`chip ${on ? 'yes' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggleProvider(p.id)}
                  title={p.name}
                >
                  <img src={p.logo} alt="" style={{ width: 22, height: 22, borderRadius: 4 }} />
                  {p.name}
                  {on && <Icon name="check" size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
