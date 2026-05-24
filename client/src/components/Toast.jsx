import { useEffect } from 'react';

export default function Toast({ message, onDone, ttl = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDone, ttl);
    return () => clearTimeout(id);
  }, [message, ttl, onDone]);
  if (!message) return null;
  return <div className="toast">{message}</div>;
}
