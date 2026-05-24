import Icon from './Icon.jsx';

/**
 * Wordmark "Movis" en Fredoka 700 con relleno de gradiente firma.
 * Acompañado de un mini icono play con glow. Sublínea "movie matcher".
 * Prop `small` para la versión compacta del header del resultado.
 */
export default function Brand({ small = false }) {
  return (
    <div className={`brand ${small ? 'small' : ''}`}>
      <span className="brand-word">
        <span className="brand-mark"><Icon name="play" size={small ? 22 : 34} /></span>
        <span className="grad-text">Movis</span>
      </span>
      <small>movie matcher</small>
    </div>
  );
}
