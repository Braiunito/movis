import { useEffect } from 'react';
import Icon from './Icon.jsx';

/**
 * Toast pill con icono contextual. role="status" / aria-live="polite".
 * variant: 'info' | 'success' | 'error'
 */
export default function Toast({ message, onDone, ttl = 2500, variant = 'success' }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDone, ttl);
    return () => clearTimeout(id);
  }, [message, ttl, onDone]);

  if (!message) return null;

  const iconName = variant === 'error' ? 'alert' : variant === 'info' ? 'info' : 'check';

  return (
    <div className={`toast ${variant}`} role="status" aria-live="polite">
      <Icon name={iconName} size={20} />
      <span>{message}</span>
    </div>
  );
}
