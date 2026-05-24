import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import Mascot from '../components/Mascot.jsx';
import Toast from '../components/Toast.jsx';
import Icon from '../components/Icon.jsx';
import Confetti from '../components/Confetti.jsx';
import Wizard from './Wizard.jsx';
import { api } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import { loadProfile, saveProfile } from '../lib/storage.js';

// fases: join -> wizard -> waiting -> result
export default function Room() {
  const { id } = useParams();
  const [phase, setPhase] = useState('join');
  const [name, setName] = useState(loadProfile().name || '');
  const [room, setRoom] = useState(null);
  const [me, setMe] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('room:update', setRoom);
    socket.on('room:all_ready', () => setPhase('waiting'));
    socket.on('room:suggestion', m => {
      setSuggestion(m);
      setPhase('result');
    });
    socket.on('room:notice', ({ message }) => setToast(message));
    socket.on('room:error', ({ message }) => setError(message));

    return () => {
      socket.off('room:update');
      socket.off('room:all_ready');
      socket.off('room:suggestion');
      socket.off('room:notice');
      socket.off('room:error');
    };
  }, []);

  // Pre-cargar estado de sala (por si está cerrada o no existe)
  useEffect(() => {
    api.room(id).catch(() => setError('Esta sala no existe.'));
  }, [id]);

  function doJoin() {
    if (!name.trim()) return;
    saveProfile({ name: name.trim() });
    socketRef.current.emit('room:join', { roomId: id, name }, res => {
      if (res?.error) return setError(res.error);
      setMe(res.me);
      setRoom(res.room);
      setPhase('wizard');
    });
  }

  function submitPrefs(prefs) {
    socketRef.current.emit('room:ready', { preferences: prefs }, res => {
      if (res?.error) return setError(res.error);
      setPhase('waiting');
    });
  }

  function next() {
    setPhase('waiting');
    socketRef.current.emit('room:next', {}, res => {
      if (res?.error) setError(res.error);
    });
  }

  function seen() {
    setPhase('waiting');
    socketRef.current.emit('room:seen', {}, res => {
      if (res?.error) setError(res.error);
    });
  }

  if (phase === 'join') return (
    <div className="shell">
      <Brand />
      <div className="scene">
        <div className="glow-halo" />
        <Mascot size={220} mood="happy" />
      </div>
      <p className="subtitle">Te invitaron a una sala. Poné tu nombre y entrá.</p>
      <div className="card stack full">
        <div className="field">
          <label className="label" htmlFor="join-name">Tu nombre</label>
          <input id="join-name" value={name} maxLength={30} onChange={e => setName(e.target.value)} />
        </div>
        {error && (
          <div className="error-banner" role="alert">
            <Icon name="alert" size={20} />
            <span>{error}</span>
          </div>
        )}
        <button disabled={!name.trim()} onClick={doJoin} className={name.trim() ? 'cta-attention' : ''}>
          <Icon name="arrow-right" size={20} /> Unirme
        </button>
      </div>
    </div>
  );

  if (phase === 'wizard') return (
    <div className="shell">
      <Brand small />
      <Wizard room={room} me={me} onSubmit={submitPrefs} />
      <Toast message={toast} variant="info" onDone={() => setToast('')} />
      {error && (
        <div className="error-banner" role="alert">
          <Icon name="alert" size={20} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  if (phase === 'waiting') return (
    <Waiting room={room} me={me} />
  );

  if (phase === 'result') return (
    <Result room={room} movie={suggestion} onNext={next} onSeen={seen} />
  );

  return null;
}

function Waiting({ room, me }) {
  const participants = room?.participants || [];
  const ready = participants.filter(p => p.ready).length;
  const total = participants.length;
  const pct = total ? Math.round((ready / total) * 100) : 0;
  const complete = total > 0 && ready === total;

  const phrases = useMemo(() => [
    'Buscando pochoclos…',
    'Discutiendo en privado…',
    'Revisando abajo del sillón…',
    'Llamando a Coppola…',
    'Sobornando al algoritmo…',
    'Sacando los créditos…',
    'Eligiendo el mejor asiento…',
    'Bajando la luz del living…',
  ], []);
  const [phrase, setPhrase] = useState(phrases[0]);
  useEffect(() => {
    const id = setInterval(() => {
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 1800);
    return () => clearInterval(id);
  }, [phrases]);

  return (
    <div className="shell">
      <Brand small />
      <div className="scene">
        <div className="glow-halo" />
        <Mascot size={200} mood="searching" dancing />
      </div>

      <h2 key={phrase} className="grad-text loader-phrase">{phrase}</h2>
      <div className="dance"><span /><span /><span /><span /><span /></div>

      <div className="stack full" style={{ alignItems: 'center', gap: 8 }}>
        <p className="subtitle">{ready} de {total} listos</p>
        <div className={`progress-bar ${complete ? 'complete' : ''}`}>
          <div className="fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Participants participants={participants} meId={me?.id} />
    </div>
  );
}

function Participants({ participants, meId, allReady = false }) {
  return (
    <div className="participants">
      {participants.map(p => {
        const isReady = allReady || p.ready;
        const initial = (p.name || '?').trim().charAt(0).toUpperCase();
        return (
          <span key={p.id} className={`pill ${isReady ? 'ready' : ''}`}>
            <span className="avatar">{initial}</span>
            <span>
              {p.name}
              {p.id === meId ? <span className="pill-suffix"> (vos)</span> : ''}
            </span>
            <span className="pill-end">
              {isReady ? <Icon name="check" size={16} /> : <span className="mini-spinner" />}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function Result({ room, movie, onNext, onSeen }) {
  const [leaving, setLeaving] = useState(false);

  function leave(fn) {
    setLeaving(true);
    setTimeout(fn, 320);
  }

  if (!movie) {
    return (
      <div className="shell">
        <Brand small />
        <h2 className="grad-text">Sin coincidencias</h2>
        <div className="scene">
          <div className="glow-halo" style={{ opacity: .4 }} />
          <Mascot size={180} mood="sad" />
        </div>
        <div className="card center stack full">
          <p>No quedan más opciones con esos filtros. Prueben aflojando alguno.</p>
          <button onClick={() => leave(onNext)} disabled={leaving}>
            <Icon name="refresh" size={20} /> Otra vuelta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell wide">
      <Confetti fire={movie.id || true} />
      <Brand small />
      <Mascot size={96} mood="excited" />
      <h2 className="grad-text">¡Les toca ver!</h2>

      <div className="card glow full">
        <div className={`result ${leaving ? 'leaving' : ''}`}>
          <div className="poster-wrap">
            {movie.poster
              ? <img className="poster" src={movie.poster} alt={movie.title} />
              : <div className="poster placeholder"><Icon name="popcorn" size={48} /></div>}
          </div>

          <div className="meta">
            <h2>
              {movie.title} <span className="year">({movie.year})</span>
            </h2>

            {movie.rating && (
              <span className="rating">
                <span className="star"><Icon name="star" size={18} /></span>
                {movie.rating}
                <small>({movie.voteCount})</small>
              </span>
            )}

            <p className="overview">{movie.overview || 'Sin sinopsis.'}</p>

            <div className="row start">
              <button onClick={() => leave(onNext)} className="secondary" disabled={leaving}>
                <Icon name="refresh" size={18} /> Otra recomendación
              </button>
              <button onClick={() => leave(onSeen)} className="ghost" disabled={leaving}>
                <Icon name="eye" size={18} /> Ya la vi
              </button>
            </div>

            <a href={movie.tmdbUrl} target="_blank" rel="noreferrer">
              Más info en TMDB <Icon name="arrow-right" size={16} style={{ verticalAlign: 'middle' }} />
            </a>
          </div>
        </div>
      </div>

      <Participants participants={room?.participants || []} allReady />
    </div>
  );
}
