/**
 * Mascota Movis: dos cubos de palomitas con cara, en un sofá.
 * Recoloreada a la paleta "Pop Juguetón (Glow)": sin bordes negros gruesos,
 * cubos rosa/violeta, sofá lavanda, palomitas blanco cálido con borde fino morado,
 * sparkles que titilan y variantes de cara por estado.
 *
 * API: <Mascot size={240} mood="happy" dancing={false} />
 * moods: 'happy' | 'excited' | 'searching' | 'sad'
 */

const INK = '#2A1B3D';
const POP = '#FFF7EF';        // palomita blanco cálido
const POP_STROKE = 'rgba(42,27,61,.5)';

export default function Mascot({ size = 240, mood = 'happy', dancing = false }) {
  const cls = `mascot${dancing ? ' dancing' : ''}`;
  return (
    <svg
      className={cls}
      viewBox="0 0 320 240"
      width={size}
      style={{ height: 'auto', display: 'block' }}
      role="img"
      aria-label="Mascotas de Movis: palomitas animadas"
    >
      {/* SOFÁ (tonos morados claros / lavanda) */}
      <g>
        <rect x="40" y="160" width="240" height="52" rx="16" fill="#A98BE6" />
        <rect x="46" y="138" width="228" height="44" rx="14" fill="#C9B6F0" />
        <rect x="46" y="172" width="228" height="40" rx="14" fill="#A98BE6" />
        <rect x="32" y="150" width="22" height="56" rx="10" fill="#C9B6F0" />
        <rect x="266" y="150" width="22" height="56" rx="10" fill="#C9B6F0" />
        <rect x="56" y="208" width="12" height="16" rx="4" fill="#8E6FC2" />
        <rect x="252" y="208" width="12" height="16" rx="4" fill="#8E6FC2" />
      </g>

      {/* CUBO IZQUIERDO (rosa) */}
      <g className="mascot-bucket-left">
        <Popcorn x={102} y={70} mood={mood} bucket="#FF3D9A" side="left" />
      </g>

      {/* CUBO DERECHO (violeta) */}
      <g className="mascot-bucket-right">
        <Popcorn x={210} y={76} mood={mood} bucket="#8B5CF6" side="right" />
      </g>

      {/* SPARKLES decorativos */}
      <g fill="#FFC83D">
        <path className="mascot-spark" d="M50 60l2.4 6.2 6.2 2.4-6.2 2.4L50 77l-2.4-6L41.4 68.6l6.2-2.4L50 60Z" />
      </g>
      <g fill="#FF7AC0">
        <path className="mascot-spark s2" d="M276 56l1.8 4.8 4.8 1.8-4.8 1.8L276 70l-1.8-4.8-4.8-1.8 4.8-1.8L276 56Z" />
      </g>
      <g fill="#FFC83D">
        <path className="mascot-spark s3" d="M160 28l1.6 4.4 4.4 1.6-4.4 1.6L160 41.6l-1.6-4.4-4.4-1.6 4.4-1.6L160 28Z" />
      </g>
    </svg>
  );
}

function Popcorn({ x, y, mood, bucket, side }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* sombra suave en el sofá (morada, no negra) */}
      <ellipse cx="0" cy="100" rx="40" ry="6" fill="rgba(42,27,61,0.12)" />

      {/* cubo trapezoidal con rayas */}
      <path
        d="M -32 30 L 32 30 L 26 96 L -26 96 Z"
        fill={bucket}
        stroke="rgba(42,27,61,.25)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M -16 30 L -18 96 L -10 96 L -8 30 Z" fill="#FDFBFF" opacity=".85" />
      <path d="M  8 30 L  10 96 L  18 96 L  16 30 Z" fill="#FDFBFF" opacity=".85" />
      {/* borde superior del cubo */}
      <rect x="-34" y="25" width="68" height="9" rx="4.5" fill={bucket} stroke="rgba(42,27,61,.2)" strokeWidth="1.5" />

      {/* PALOMITAS desbordando */}
      <g className="mascot-kernel">
        <circle cx="-22" cy="18" r="14" fill={POP} stroke={POP_STROKE} strokeWidth="1.5" />
        <circle cx="0"   cy="6"  r="18" fill={POP} stroke={POP_STROKE} strokeWidth="1.5" />
        <circle cx="22"  cy="16" r="14" fill={POP} stroke={POP_STROKE} strokeWidth="1.5" />
        <circle cx="-10" cy="12" r="10" fill={POP} stroke={POP_STROKE} strokeWidth="1.5" />
        <circle cx="12"  cy="10" r="10" fill={POP} stroke={POP_STROKE} strokeWidth="1.5" />
        {/* pintitas de mantequilla doradas */}
        <circle cx="-18" cy="20" r="2" fill="#FFC83D" />
        <circle cx="6"   cy="0"  r="2" fill="#FFC83D" />
        <circle cx="18"  cy="18" r="2" fill="#FFC83D" />
      </g>

      {/* CARA */}
      <Face mood={mood} side={side} />

      {/* brazos del cubo */}
      <path d="M -32 56 Q -48 60 -44 76" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".85" />
      <path d="M  32 56 Q  48 60  44 76" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".85" />
      <circle cx="-44" cy="76" r="4" fill={POP} stroke={POP_STROKE} strokeWidth="1.5" />
      <circle cx="44"  cy="76" r="4" fill={POP} stroke={POP_STROKE} strokeWidth="1.5" />
    </g>
  );
}

function Face({ mood, side }) {
  // ojos miran a un lado en "searching" (cada cubo a un lado distinto)
  const lookX = side === 'left' ? -1.5 : 1.5;

  if (mood === 'excited') {
    return (
      <g>
        {/* ojos bien abiertos, brillantes */}
        <circle className="mascot-eye" cx="-9" cy="14" r="4.5" fill="#fff" stroke={INK} strokeWidth="1.8" />
        <circle className="mascot-eye" cx="11" cy="14" r="4.5" fill="#fff" stroke={INK} strokeWidth="1.8" />
        <circle cx="-8.5" cy="14.5" r="2.2" fill={INK} />
        <circle cx="11.5" cy="14.5" r="2.2" fill={INK} />
        {/* boca "wow" feliz */}
        <ellipse cx="1" cy="24" rx="3.4" ry="4.4" fill={INK} />
        {/* mejillas */}
        <circle cx="-16" cy="22" r="3" fill="#FF7AC0" opacity=".55" />
        <circle cx="18"  cy="22" r="3" fill="#FF7AC0" opacity=".55" />
      </g>
    );
  }

  if (mood === 'searching') {
    return (
      <g>
        <circle cx="-9" cy="14" r="4.5" fill="#fff" stroke={INK} strokeWidth="1.8" />
        <circle cx="11" cy="14" r="4.5" fill="#fff" stroke={INK} strokeWidth="1.8" />
        {/* pupilas desplazadas (mirando hacia un lado) */}
        <circle cx={-9 + lookX} cy="15" r="2" fill={INK} />
        <circle cx={11 + lookX} cy="15" r="2" fill={INK} />
        {/* boca pequeña concentrada */}
        <path d="M -5 23 Q 1 25 7 23" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  if (mood === 'sad') {
    return (
      <g>
        {/* ojos caídos */}
        <path d="M -13 13 Q -9 11 -5 13" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M 7 13 Q 11 11 15 13" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <circle cx="-9" cy="15" r="2.4" fill={INK} />
        <circle cx="11" cy="15" r="2.4" fill={INK} />
        {/* boca invertida */}
        <path d="M -7 26 Q 1 20 9 26" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  // happy (por defecto)
  return (
    <g>
      <circle className="mascot-eye" cx="-8" cy="14" r="3.2" fill={INK} />
      <circle className="mascot-eye" cx="10" cy="14" r="3.2" fill={INK} />
      <circle cx="-7" cy="13" r="1" fill="#fff" />
      <circle cx="11" cy="13" r="1" fill="#fff" />
      <path d="M -7 22 Q 1 28 9 22" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="-15" cy="21" r="2.6" fill="#FF7AC0" opacity=".5" />
      <circle cx="17"  cy="21" r="2.6" fill="#FF7AC0" opacity=".5" />
    </g>
  );
}
