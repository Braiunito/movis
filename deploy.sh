#!/usr/bin/env bash
# deploy.sh — despliega movis.bevrim.com
#
# Uso:
#   bash deploy.sh              # redeploy normal (tras git pull)
#   bash deploy.sh --full       # primer despliegue: instala pm2, copia nginx, arranca todo
#
# Asume:
#   - El repo está clonado en /var/www/movis.bevrim.com (o donde esté este script).
#   - Hay un server/.env válido con TMDB_API_KEY, PORT=3010 y CLIENT_ORIGIN=https://movis.bevrim.com
#   - El dominio movis.bevrim.com ya resuelve y tiene SSL configurado con certbot.
#   - Usuario con sudo para reload de nginx (en --full).

set -euo pipefail

# ───── Config ─────
APP_NAME="movis-server"
BACKEND_PORT=3010
DOMAIN="movis.bevrim.com"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONF_SRC="$ROOT/deploy/nginx.conf"
NGINX_CONF_DST="/etc/nginx/sites-available/$DOMAIN"
NGINX_LINK="/etc/nginx/sites-enabled/$DOMAIN"

# ───── Colores ─────
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; BLU='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLU}▶${NC} $*"; }
ok()   { echo -e "${GRN}✔${NC} $*"; }
warn() { echo -e "${YLW}⚠${NC} $*"; }
die()  { echo -e "${RED}✖${NC} $*" >&2; exit 1; }

# ───── Flags ─────
FULL=false
case "${1:-}" in
  --full) FULL=true ;;
  ""    ) ;;
  *     ) die "Flag desconocido: $1 (usa --full o nada)" ;;
esac

# ───── Pre-checks ─────
cd "$ROOT"
log "Desplegando $DOMAIN desde $ROOT"

for cmd in node npm git curl; do
  command -v "$cmd" >/dev/null || die "falta '$cmd' en el sistema"
done

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
[ "$NODE_MAJOR" -ge 18 ] || die "Node $NODE_MAJOR es muy viejo, hace falta >=18"

[ -f "$ROOT/server/.env" ] || die "falta $ROOT/server/.env (TMDB_API_KEY, PORT=$BACKEND_PORT, CLIENT_ORIGIN=https://$DOMAIN)"

# pm2 — instalar solo en --full
if ! command -v pm2 >/dev/null; then
  if $FULL; then
    log "Instalando pm2 globalmente..."
    sudo npm install -g pm2
  else
    die "pm2 no instalado. Ejecuta con --full para hacerlo o instala manualmente"
  fi
fi

# ───── Backend deps ─────
log "Instalando deps de server (prod-only)..."
( cd "$ROOT/server" && npm ci --omit=dev --no-audit --no-fund )
ok "server deps listas"

# ───── Frontend deps + build ─────
log "Instalando deps de client..."
( cd "$ROOT/client" && npm ci --no-audit --no-fund )

log "Build del client..."
( cd "$ROOT/client" && npm run build )
[ -d "$ROOT/client/dist" ] || die "build falló: no existe client/dist"
ok "client/dist generado"

# Permisos de lectura para nginx
chmod -R a+rX "$ROOT/client/dist"

# logs dir para pm2
mkdir -p "$ROOT/logs"

# ───── nginx (solo --full) ─────
if $FULL; then
  if [ -f "$NGINX_CONF_SRC" ]; then
    log "Instalando vhost de nginx..."
    sudo cp "$NGINX_CONF_SRC" "$NGINX_CONF_DST"
    sudo ln -sf "$NGINX_CONF_DST" "$NGINX_LINK"
    sudo nginx -t
    sudo systemctl reload nginx
    ok "nginx recargado"
    warn "SSL: el bloque 443 lo gestiona certbot. Si aún no corriste:"
    warn "  sudo certbot --nginx -d $DOMAIN"
  else
    warn "no encontré $NGINX_CONF_SRC, salto la copia"
  fi
fi

# ───── pm2 ─────
if $FULL || ! pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  log "Arrancando $APP_NAME en pm2..."
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 start "$ROOT/server/src/index.js" \
    --name "$APP_NAME" \
    --cwd "$ROOT/server" \
    --time \
    --max-memory-restart 500M \
    --output "$ROOT/logs/server.out.log" \
    --error  "$ROOT/logs/server.err.log"
  pm2 save
  if $FULL && ! systemctl list-unit-files | grep -q '^pm2-'; then
    warn "Para que pm2 sobreviva a reinicios, ejecuta UNA vez:"
    warn "  pm2 startup     # te imprime un comando con sudo, cópialo y ejecútalo"
    warn "  pm2 save"
  fi
else
  log "Reload de $APP_NAME (con --update-env)..."
  pm2 reload "$APP_NAME" --update-env
fi
ok "backend corriendo"

# ───── Smoke tests ─────
log "Smoke tests..."
sleep 2

if curl -fsS "http://127.0.0.1:$BACKEND_PORT/api/health" >/dev/null; then
  ok "backend responde en 127.0.0.1:$BACKEND_PORT"
else
  pm2 logs "$APP_NAME" --lines 30 --nostream
  die "backend no responde — revisa los logs arriba"
fi

if curl -fsS -o /dev/null -w '%{http_code}' "https://$DOMAIN/" | grep -qE '^(200|301|302)$'; then
  ok "https://$DOMAIN responde"
else
  warn "https://$DOMAIN no respondió 200/30x — revisa DNS/SSL/nginx"
fi

if curl -fsS "https://$DOMAIN/api/health" | grep -q '"ok":true'; then
  ok "https://$DOMAIN/api/health → {\"ok\":true}"
else
  warn "API pública no respondió ok — revisa nginx → backend"
fi

echo
ok "deploy completo en $(date '+%Y-%m-%d %H:%M:%S')"
echo
echo "Comandos útiles:"
echo "  pm2 status                       # estado"
echo "  pm2 logs $APP_NAME --lines 100   # logs en vivo"
echo "  pm2 reload $APP_NAME             # reload sin downtime"
echo "  sudo tail -f /var/log/nginx/movis_*.log"
