/**
 * Dos cubos de palomitas con cara en el sofá. Diseño propio,
 * sin parecido con la mascota del referente original.
 */
export default function Mascot({ size = 240 }) {
  return (
    <svg viewBox="0 0 320 220" width={size} height="auto" aria-label="Movis mascots">
      {/* SOFÁ */}
      <g>
        <rect x="40" y="150" width="240" height="55" rx="14" fill="#2A1B3D" />
        <rect x="46" y="125" width="228" height="45" rx="12" fill="#8E6FC2" />
        <rect x="46" y="165" width="228" height="40" rx="12" fill="#6B4FA0" />
        <rect x="32" y="140" width="22" height="55" rx="8" fill="#8E6FC2" />
        <rect x="266" y="140" width="22" height="55" rx="8" fill="#8E6FC2" />
        <rect x="56" y="200" width="14" height="14" fill="#2A1B3D" />
        <rect x="250" y="200" width="14" height="14" fill="#2A1B3D" />
      </g>

      {/* CUBO IZQUIERDO */}
      <Popcorn x={100} y={62} eyes="happy" />

      {/* CUBO DERECHO */}
      <Popcorn x={210} y={68} eyes="excited" />
    </svg>
  );
}

function Popcorn({ x, y, eyes }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* sombra suave en sofá */}
      <ellipse cx="0" cy="98" rx="42" ry="6" fill="rgba(0,0,0,0.15)" />

      {/* bucket trapezoidal */}
      <path
        d="M -32 30 L 32 30 L 26 95 L -26 95 Z"
        fill="#FF6B6B"
        stroke="#2A1B3D"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* rayas blancas verticales del cubo */}
      <path d="M -16 30 L -18 95 L -10 95 L -8 30 Z" fill="#FFF8F0" />
      <path d="M  8 30 L  10 95 L  18 95 L  16 30 Z" fill="#FFF8F0" />
      {/* borde superior plano del cubo */}
      <rect x="-34" y="26" width="68" height="8" rx="4" fill="#FF6B6B" stroke="#2A1B3D" strokeWidth="3" />

      {/* PALOMITAS desbordando arriba */}
      <g>
        <circle cx="-22" cy="20" r="14" fill="#FFF8F0" stroke="#2A1B3D" strokeWidth="3" />
        <circle cx="0"   cy="8"  r="18" fill="#FFF8F0" stroke="#2A1B3D" strokeWidth="3" />
        <circle cx="22"  cy="18" r="14" fill="#FFF8F0" stroke="#2A1B3D" strokeWidth="3" />
        <circle cx="-10" cy="14" r="10" fill="#FFF8F0" stroke="#2A1B3D" strokeWidth="2" />
        <circle cx="12"  cy="12" r="10" fill="#FFF8F0" stroke="#2A1B3D" strokeWidth="2" />
        {/* pintitas amarillas (mantequilla / detalle) */}
        <circle cx="-18" cy="22" r="2" fill="#FFD166" />
        <circle cx="6"   cy="2"  r="2" fill="#FFD166" />
        <circle cx="18"  cy="20" r="2" fill="#FFD166" />
      </g>

      {/* CARA — ojos */}
      {eyes === 'happy' ? (
        <g>
          <circle cx="-8" cy="14" r="3.2" fill="#2A1B3D" />
          <circle cx="10" cy="14" r="3.2" fill="#2A1B3D" />
          <circle cx="-7" cy="13" r="1"   fill="white" />
          <circle cx="11" cy="13" r="1"   fill="white" />
          {/* boca sonriente */}
          <path d="M -7 22 Q 1 28 9 22" stroke="#2A1B3D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          {/* ojos más abiertos */}
          <circle cx="-9" cy="14" r="4.5" fill="white" stroke="#2A1B3D" strokeWidth="2" />
          <circle cx="11" cy="14" r="4.5" fill="white" stroke="#2A1B3D" strokeWidth="2" />
          <circle cx="-8" cy="14" r="2"   fill="#2A1B3D" />
          <circle cx="12" cy="14" r="2"   fill="#2A1B3D" />
          {/* boca "wow" */}
          <ellipse cx="2" cy="24" rx="3" ry="4" fill="#2A1B3D" />
        </g>
      )}

      {/* brazos del bucket */}
      <path d="M -32 55 Q -48 60 -44 75" stroke="#2A1B3D" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M  32 55 Q  48 60  44 75" stroke="#2A1B3D" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="-44" cy="75" r="4" fill="#FFF8F0" stroke="#2A1B3D" strokeWidth="2" />
      <circle cx="44"  cy="75" r="4" fill="#FFF8F0" stroke="#2A1B3D" strokeWidth="2" />
    </g>
  );
}
