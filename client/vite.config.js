import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Lando: el proxy nginx termina SSL en movis.lndo.site y enruta
// /api y /socket.io al server, todo lo demás aquí.
// Local sin lando: arranca server en :4000 y este Vite hace de proxy.
const inLando = process.env.LANDO === 'ON' || process.env.npm_config_lando;

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: ['movis.lndo.site', '.lndo.site', 'localhost'],
    hmr: inLando
      ? { clientPort: 443, protocol: 'wss', host: 'movis.lndo.site' }
      : undefined,
    proxy: inLando
      ? undefined
      : {
          '/api': 'http://localhost:4000',
          '/socket.io': { target: 'http://localhost:4000', ws: true },
        },
  },
});
