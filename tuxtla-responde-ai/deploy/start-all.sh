#!/bin/sh
# Arranque "todo en uno" del backend para Render (un solo contenedor).
cd /app

# Puerto público que Render asigna (por defecto 4000 en local)
GW_PORT="${PORT:-4000}"
export GW_PORT
echo "Gateway escuchará en el puerto $GW_PORT"

# Microservicios (puertos internos fijos)
# Interruptor de pruebas: DISABLE_INCIDENTS=true apaga el servicio de reportes (01)
if [ "$DISABLE_INCIDENTS" = "true" ]; then
  echo "⚠️  Microservicio de incidentes DESACTIVADO (modo prueba)"
else
  (cd services/01-citizen-incident-service && PORT=3000 JWT_SECRET="$JWT_SECRET" node src/infrastructure/web/server.js) &
fi
(cd services/02-dispatch-service && PORT=3001 node src/infrastructure/web/server.js) &
(cd services/03-transparency-service && PORT=3002 node src/infrastructure/web/server.js) &
(cd services/04-users-service && PORT=3003 JWT_SECRET="$JWT_SECRET" node src/infrastructure/web/server.js) &
(cd services/05-notifications-service && PORT=3004 node src/infrastructure/web/server.js) &
(cd services/06-media-evidence-service && PORT=3005 node src/infrastructure/web/server.js) &
(cd services/07-ai-vision-service && PORT=3006 node src/infrastructure/web/server.js) &

sleep 3

# API Gateway (escucha en el puerto de Render)
(cd services/08-api-gateway && \
  PORT="$GW_PORT" \
  INCIDENTS_URL=http://127.0.0.1:3000 \
  DISPATCH_URL=http://127.0.0.1:3001 \
  TRANSPARENCY_URL=http://127.0.0.1:3002 \
  USERS_URL=http://127.0.0.1:3003 \
  NOTIFICATIONS_URL=http://127.0.0.1:3004 \
  MEDIA_URL=http://127.0.0.1:3005 \
  AI_URL=http://127.0.0.1:3006 \
  node src/server.js) &

# Bot de Telegram (debe llamar al MISMO puerto del gateway)
if [ -n "$TELEGRAM_TOKEN" ]; then
  (cd services/09-telegram-bot && \
    GATEWAY_URL="http://127.0.0.1:$GW_PORT" \
    node src/server.js) &
fi

wait
