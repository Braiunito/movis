import { useEffect, useState } from 'react';

/**
 * Celebración del match — confeti autónomo en CSS/DOM puro (sin dependencias).
 * Genera una ráfaga de piezas con color, posición, deriva y giro aleatorios
 * que caen desde arriba. Respeta prefers-reduced-motion: si está activo no
 * renderiza nada.
 *
 * Prop `fire`: cuando cambia de valor, vuelve a disparar la ráfaga.
 */
const COLORS = ['#FF3D9A', '#8B5CF6', '#FF6B5C', '#2DD4A7', '#FFC83D'];
const COUNT = 90;

function makePieces() {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,                 // %
    bg: COLORS[i % COLORS.length],
    size: 7 + Math.random() * 9,               // px
    round: Math.random() > 0.55,               // círculo o cuadradito
    delay: Math.random() * 0.5,                // s
    dur: 1.4 + Math.random() * 1.2,            // s
    drift: (Math.random() * 2 - 1) * 90,       // px horizontal
    spin: (Math.random() > 0.5 ? 1 : -1) * (540 + Math.random() * 540), // deg
  }));
}

export default function Confetti({ fire = true }) {
  const [burst, setBurst] = useState(0);
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!fire) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    setPieces(makePieces());
    setBurst(b => b + 1); // remonta la capa para reiniciar las animaciones
  }, [fire]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-layer" key={burst} aria-hidden="true">
      {pieces.map(p => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.bg,
            borderRadius: p.round ? '50%' : '2px',
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
