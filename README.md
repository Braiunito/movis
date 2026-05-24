# Movis — Movie Matcher

Crea una sala, comparte un link, todos rellenáis vuestras preferencias y la app
recomienda una peli para ver juntos. Si ya la habéis visto o no convence,
pedís otra y listo.

## Cómo funciona

1. **Crea sala** eligiendo modo (solo / pareja / grupo).
2. **Comparte el link** (`https://movis.lndo.site/r/<id>`) con quien quieras.
3. Cada participante:
   - Elige 3 géneros que **NO** le apetecen.
   - Elige 3 géneros que **SÍ** (los del paso anterior no aparecen).
   - Busca opcionalmente sus últimas pelis favoritas para dar pistas.
   - Configura extras (idioma, región, año mín., duración máx., nota mín., plataformas).
4. Cuando todos han terminado, un loader divertido y aparece **la recomendación**.
5. Botones: **otra recomendación** / **ya la vi** → genera la siguiente.

El servidor agrega las preferencias así:
- **NO géneros**: si UNO dice no, fuera (unión estricta).
- **SÍ géneros**: unión ponderada por nº de votos, ordenada por popularidad.
- **Favoritas**: extraen géneros + keywords como bonus en TMDB.
- **Filtros numéricos**: el más restrictivo gana (año máx., duración mín., nota máx.).
- **Plataformas**: intersección si todos eligieron alguna; si no, unión.

## Arranque con Lando (recomendado, con SSL)

```bash
cd /home/dev/projects/movis
lando start
```

Abre: **https://movis.lndo.site**

Servicios:
- `nginx` (SSL): termina HTTPS y enruta `/api` y `/socket.io` al server, el
  resto al Vite dev.
- `client` (Node 20): Vite dev en `:3000`.
- `server` (Node 20): Express + Socket.io en `:3001`.

Comandos útiles:
```bash
lando logs -s server -f       # logs en vivo del backend
lando logs -s client -f       # logs en vivo del frontend
lando npm-server install foo  # instalar dep en el server
lando npm-client install foo  # instalar dep en el client
lando restart
lando stop / lando destroy
```

## Arranque local sin Lando

```bash
npm run install:all   # instala raíz + server + client
# server/.env ya viene poblado con la API key proporcionada
npm run dev           # arranca server (:4000) y client (:5173) en paralelo
```

Abre: http://localhost:5173

## Variables de entorno (`server/.env`)

```
TMDB_API_KEY=...      # v3 api key de TMDB
TMDB_BEARER=...       # opcional, v4 read access token
PORT=3001             # 4000 en local sin lando
CLIENT_ORIGIN=https://movis.lndo.site   # http://localhost:5173 en local
```

Consigue las credenciales en https://www.themoviedb.org/settings/api.

## Estructura

```
movis/
├── .lando.yml              # nginx + client + server
├── nginx.lando.conf        # proxy SSL → vite + socket.io + api
├── client/                 # Vite + React
│   ├── src/
│   │   ├── pages/          # Landing, Room, Wizard
│   │   ├── components/     # Brand, Mascot, Toast
│   │   ├── lib/            # api.js, socket.js, storage.js
│   │   └── styles/global.css
│   └── vite.config.js      # auto-detecta lando vs local
└── server/                 # Express + Socket.io
    └── src/
        ├── index.js        # REST + sockets
        ├── rooms.js        # estado de salas en memoria
        ├── tmdb.js         # wrapper TMDB
        └── recommend.js    # agregación + /discover
```

## Stack

- **Frontend**: React 18, React Router 6, Vite 6, socket.io-client
- **Backend**: Express 4, Socket.io 4, TMDB v3/v4
- **Infra dev**: Lando (Docker) con nginx SSL → Vite + Node
- **Persistencia**: en memoria. Las salas viven 6h sin actividad.

## Paleta y branding (propio)

- Lavanda `#B89CE0` (fondo), Coral `#FF6B6B` (primario), Menta `#4ECDC4`
  (secundario), Dorado `#FFD166` (acento), Morado oscuro `#2A1B3D` (tinta).
- Mascotas: dos cubos de palomitas con cara, diseño propio.
- Tipografías: Lilita One (display) + Nunito (texto).
