import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import Mascot from '../components/Mascot.jsx';
import Icon from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { saveProfile, loadProfile } from '../lib/storage.js';

const MODES = [
  { key: 'solo', label: 'Yo solo', icon: 'user' },
  { key: 'duo', label: 'En pareja', icon: 'duo' },
  { key: 'group', label: 'En grupo', icon: 'users' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadProfile().name || '');
  const [mode, setMode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function go() {
    if (!name.trim() || !mode) return;
    setBusy(true);
    setError('');
    saveProfile({ name: name.trim() });
    try {
      const room = await api.createRoom(mode);
      navigate(`/r/${room.id}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const ready = !!name.trim() && !!mode && !busy;

  return (
    <div className="shell">
      <Brand />

      <div className="scene">
        <div className="glow-halo" />
        <Mascot size={260} mood="happy" />
      </div>

      <p className="subtitle">
        Encontrá la peli que les guste a todos. Sin pelear más por el control.
      </p>

      <div className="card stack full">
        <div className="field">
          <label className="label" htmlFor="name">¿Cómo te llamás?</label>
          <input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="field">
          <span className="label">¿Cuántos son?</span>
          <div className="row start">
            {MODES.map(m => {
              const on = mode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  className={`chip ${on ? 'yes' : ''}`}
                  aria-pressed={on}
                  onClick={() => setMode(m.key)}
                >
                  <Icon name={m.icon} size={18} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            <Icon name="alert" size={20} />
            <span>{error}</span>
          </div>
        )}

        <button
          className={ready ? 'cta-attention' : ''}
          disabled={!ready}
          onClick={go}
          style={{ marginTop: 4 }}
        >
          {busy ? (
            <>
              <span className="spinner" /> Creando…
            </>
          ) : (
            <>
              <Icon name="play" size={20} /> ¡Movis!
            </>
          )}
        </button>
      </div>
    </div>
  );
}
