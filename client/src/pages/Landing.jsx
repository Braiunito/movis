import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import Mascot from '../components/Mascot.jsx';
import { api } from '../lib/api.js';
import { saveProfile, loadProfile } from '../lib/storage.js';

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

  return (
    <div className="shell">
      <Brand />
      <div className="scene"><Mascot size={260} /></div>
      <p className="subtitle">
        Dejad de discutir qué ver.<br />
        Encontrad la peli sin levantaros del sofá.
      </p>

      <div className="card stack">
        <label className="label">¿Cómo te llamas?</label>
        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={30}
        />

        <label className="label">¿Cuántos sois?</label>
        <div className="row">
          {[
            { key: 'solo', label: 'Yo solo' },
            { key: 'duo', label: 'En pareja' },
            { key: 'group', label: 'En grupo' },
          ].map(m => (
            <button
              key={m.key}
              className={mode === m.key ? '' : 'ghost'}
              onClick={() => setMode(m.key)}
              type="button"
            >
              {m.label}
            </button>
          ))}
        </div>

        {error && <div className="error-banner">{error}</div>}

        <button
          disabled={!name.trim() || !mode || busy}
          onClick={go}
          style={{ marginTop: 8 }}
        >
          {busy ? 'Creando...' : '¡Movis!'}
        </button>
      </div>
    </div>
  );
}
