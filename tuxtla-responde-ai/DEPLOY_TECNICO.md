# 📘 Documentación Técnica — Despliegue en la nube de TuxtlaResponde AI

Versión: 1.0 · Fecha: 2026-11-12 · Autor: Despliegue asistido por IA

---

## 1. Resumen ejecutivo

El proyecto **TuxtlaResponde AI** (monorepo de 8 microservicios Node.js + gateway + bot de Telegram + frontend React) se desplegó en la nube usando **5 proveedores gratuitos**:

| Proveedor | Rol | Plan |
|---|---|---|
| **Render** | Backend (8 microservicios + gateway + bot en 1 contenedor) | Free |
| **Vercel** | Frontend estático (React/Vite) + APK descargable | Hobby |
| **Aiven** | MySQL 8.4 administrado (7 bases) | Free |
| **CloudAMQP** | RabbitMQ administrado (bus de eventos) | Little Lemur (free) |
| **Docker Hub** | Registro de la imagen del backend | Free |

**Resultado:**
- Backend: https://tuxtla-backend.onrender.com
- Frontend: https://dist-nine-indol-210fize2vf.vercel.app
- APK: https://dist-nine-indol-210fize2vf.vercel.app/TuxtlaResponde.apk

---

## 2. Arquitectura de despliegue

```
                 ┌──────────────────────────────┐
                 │   Celular (APK Android)       │
                 │   Navegador (web Vercel)      │
                 └──────────────┬───────────────┘
                                │ HTTPS
                 ┌──────────────▼───────────────┐
                 │  VERCEL (frontend estático)   │
                 │  React + Vite + Leaflet       │
                 │  VITE_API_URL → Render        │
                 └──────────────┬───────────────┘
                                │ HTTPS /api
        ┌───────────────────────▼────────────────────────┐
        │              RENDER — 1 contenedor              │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 08 API Gateway (escucha en $PORT Render)  │  │
        │  └───┬────┬────┬────┬────┬────┬────┬────────┘  │
        │      ▼    ▼    ▼    ▼    ▼    ▼    ▼            │
        │   :3000 :3001 :3002 :3003 :3004 :3005 :3006    │
        │   01    02    03    04    05    06    07         │
        │  ┌──────────────────────────────────────────┐  │
        │  │ 09 Telegram Bot (polling getUpdates)      │  │
        │  └──────────────────────────────────────────┘  │
        └───────┬───────────────────────────────┬─────────┘
                │ TCP 18522 (SSL)               │ AMQP/TLS
        ┌───────▼────────┐              ┌───────▼─────────┐
        │ AIVEN MySQL 8.4│              │ CloudAMQP       │
        │ 7 bases        │              │ RabbitMQ        │
        └────────────────┘              └─────────────────┘
```

**Flujo de una petición:** App → Vercel → Render (Gateway `$PORT`) → microservicio → MySQL (Aiven). Los eventos de incidencias viajan por RabbitMQ (CloudAMQP) hacia Notifications.

---

## 3. Instancias y especificaciones

### 3.1 Aiven MySQL
- **Motor:** MySQL 8.4.11
- **Host:** `mysql-1c4c8319-kh03768-251b.h.aivencloud.com`
- **Puerto:** `18522` (puerto no estándar de Aiven)
- **Usuario:** `avnadmin`
- **SSL:** **REQUIRED** (obligatorio)
- **Base inicial:** `defaultdb`
- **Bases creadas:** `tuxtla_responde`, `tuxtla_dispatch`, `tuxtla_transparency`, `tuxtla_users`, `tuxtla_notifications`, `tuxtla_media`, `tuxtla_ai_triage`

### 3.2 CloudAMQP (RabbitMQ)
- **Host:** `capybara.lmq.cloudamqp.com`
- **Puerto AMQP:** `5672` (TLS: `5671`); la URL usa `amqps://…` (TLS)
- **Usuario / Vhost:** `wzfucqzn` / `wzfucqzn`
- **Cola:** `incident_events` (durable)
- **Panel:** https://capybara.lmq.cloudamqp.com/

### 3.3 Render (Backend)
- **Tipo:** Web Service (runtime `image`)
- **Plan:** Free · **Región:** Oregon
- **Imagen:** `docker.io/sebaaxx/tuxtla-backend:latest`
- **Puerto:** asignado por Render en `$PORT` (≈10000) — el gateway escucha ahí
- **Health check:** `/health`
- **URL:** https://tuxtla-backend.onrender.com

### 3.4 Vercel (Frontend)
- **Tipo:** Proyecto estático (build de Vite)
- **Plan:** Hobby
- **URL:** https://dist-nine-indol-210fize2vf.vercel.app
- **Variable de build:** `VITE_API_URL=https://tuxtla-backend.onrender.com/api`

### 3.5 Docker Hub
- **Repositorio:** `sebaaxx/tuxtla-backend:latest`

---

## 4. Paso 1 — Base de datos (Aiven)

### 4.1 Crear el servicio
En Aiven → **Create service → MySQL → Free**. Copiar host/puerto/usuario/contraseña.

### 4.2 Ejecutar los scripts SQL
El cliente `mysql` daba problemas de TLS (schannel/OpenSSL en Windows), así que se ejecutó vía **Node.js + mysql2 con SSL**:

```js
const conn = await mysql.createConnection({
  host: 'mysql-….h.aivencloud.com', port: 18522,
  user: 'avnadmin', password: '<DB_PASSWORD>',
  ssl: { rejectUnauthorized: false },   // Aiven exige SSL
  multipleStatements: true, charset: 'utf8mb4',
});
for (const f of ['init-mysql.sql','migrate-v2.sql','seed.sql'])
  await conn.query(fs.readFileSync(`database/${f}`, 'utf8'));
```

Orden de scripts:
1. `init-mysql.sql` → crea las 7 bases + tablas base.
2. `migrate-v2.sql` → columnas `password_hash`, `citizen_name`, `moderation`, tabla `comments` y **admin** `admin@tuxtla.mx / admin123`.
3. `seed.sql` → 8 reportes demo + usuarios.
4. `UPDATE … SET moderation='APROBADO' WHERE id LIKE 'seed-%'` → publicar la semilla.

### 4.3 Soporte SSL en el código
Se añadió a **los 8 repositorios MySQL** (pools `mysql2`):
```js
...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
```
En Render se activa con `DB_SSL=true`; en local queda desactivado.

---

## 5. Paso 2 — RabbitMQ (CloudAMQP)

1. Crear instancia **Little Lemur** en CloudAMQP.
2. Copiar la **AMQP URL** (`amqps://usuario:pass@host/vhost`).
3. La cola `incident_events` se crea sola al arrancar el publisher/consumer.

**Integración en el código:**
- Servicio 01 → `RabbitPublisher` publica `incident.created|aprobado|rechazado`.
- Servicio 05 → `RabbitConsumer` consume esos eventos y crea notificaciones.

---

## 6. Paso 3 — Imagen “todo en uno” del backend

Render no construye desde tu PC; por eso se empaquetó **todo el backend en 1 imagen**:

### `deploy/Dockerfile.render`
```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY services ./services
COPY deploy/start-all.sh ./start-all.sh
RUN chmod +x ./start-all.sh
RUN for d in services/*/; do (cd "$d" && npm install --omit=dev --no-audit --no-fund); done
EXPOSE 4000
CMD ["sh", "./start-all.sh"]
```

### `deploy/start-all.sh` (resumen)
```sh
GW_PORT="${PORT:-4000}"
# microservicios en 3000..3006
(cd services/01-… && PORT=3000 node src/infrastructure/web/server.js) &
…
# gateway escucha en el puerto de Render
(cd services/08-api-gateway && PORT="$GW_PORT" \
  INCIDENTS_URL=http://127.0.0.1:3000 … AI_URL=http://127.0.0.1:3006 \
  node src/server.js) &
# bot de Telegram (mismo puerto del gateway)
(cd services/09-telegram-bot && GATEWAY_URL="http://127.0.0.1:$GW_PORT" node src/server.js) &
wait
```

### Build y push
```bash
docker build -f deploy/Dockerfile.render -t sebaaxx/tuxtla-backend:latest .
docker login -u sebaaxx        # token con permiso Read & Write
docker push sebaaxx/tuxtla-backend:latest
```

---

## 7. Paso 4 — Desplegar en Render (vía API)

### 7.1 Obtener el owner
```bash
GET https://api.render.com/v1/owners
# ownerId: tea-dbr1lv2fngtc7383ueh0
```

### 7.2 Crear el Web Service
```bash
POST https://api.render.com/v1/services
Authorization: Bearer <RENDER_API_KEY>

{
  "type": "web_service",
  "name": "tuxtla-backend",
  "ownerId": "tea-dbr1lv2fngtc7383ueh0",
  "image": { "imagePath": "docker.io/sebaaxx/tuxtla-backend:latest" },
  "serviceDetails": {
    "env": "image",
    "plan": "free",
    "region": "oregon",
    "healthCheckPath": "/health"
  },
  "envVars": [
    { "key": "DB_HOST", "value": "mysql-….h.aivencloud.com" },
    { "key": "DB_PORT", "value": "18522" },
    { "key": "DB_USER", "value": "avnadmin" },
    { "key": "DB_PASSWORD", "value": "<DB_PASSWORD>" },
    { "key": "DB_SSL", "value": "true" },
    { "key": "JWT_SECRET", "value": "tuxtla-responde-secret-2026" },
    { "key": "OPENAI_API_KEY", "value": "<OPENAI_KEY>" },
    { "key": "RABBITMQ_URL", "value": "amqps://…@capybara.lmq.cloudamqp.com/wzfucqzn" },
    { "key": "TELEGRAM_TOKEN", "value": "<TELEGRAM_TOKEN>" }
  ]
}
```

### 7.3 Esperar a `live`
```bash
GET /v1/services/{id}/deploys/{deployId}   # status: update_in_progress → live
```
Resultado: `https://tuxtla-backend.onrender.com` · `/health` → 200.

---

## 8. Paso 5 — Frontend en Vercel

### 8.1 Build con la URL de Render
```bash
VITE_API_URL=https://tuxtla-backend.onrender.com/api \
VITE_UPLOADS_URL=https://tuxtla-backend.onrender.com/uploads \
npm run build          # genera dist/
```
> El build se ejecutó **dentro de un contenedor** porque el sandbox de Windows bloquea `esbuild` (`spawn EPERM`) en el host.

### 8.2 Deploy
```bash
vercel deploy dist --prod --yes --token <VERCEL_TOKEN>
```
- `frontend/vercel.json` define el rewrite SPA.
- URL pública (alias): `https://dist-nine-indol-210fize2vf.vercel.app`.

---

## 9. Paso 6 — APK de Android

Se usó **Capacitor 8** + **Android SDK** + **Gradle**:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android          # copia dist/ a los assets nativos
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Requisitos encontrados:
- **JDK 21** (Capacitor 8 usa `sourceCompatibility 21`; con JDK 17 fallaba).
- `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`.
- El APK apunta a `https://tuxtla-backend.onrender.com`.

El APK se publicó copiándolo a `dist/TuxtlaResponde.apk` y redesplegando a Vercel.

---

## 10. Incidencias y soluciones (troubleshooting)

| Problema | Causa | Solución |
|---|---|---|
| `Access denied` en Aiven con el cliente mysql | El cliente CLI fallaba TLS | Usar **Node mysql2** con `ssl.rejectUnauthorized=false` |
| `ER_ACCESS_DENIED` | OCR del screenshot confundía `0/O` | El usuario pasó la contraseña **como texto** |
| `ACCESS-REFUSED` en CloudAMQP | contraseña `E0…` (cero) leída como `EO…` | URL corregida con `E0` |
| `repo is required when using runtime: docker` | `serviceDetails.env` incorrecto | `serviceDetails.env = "image"` |
| Bot: “Error al consultar el backend” | El bot llamaba a `127.0.0.1:4000`; Render asigna otro `$PORT` | Usar `$PORT` + fallback a la URL pública |
| `spawn EPERM` al hacer build/deploy en host | sandbox de Windows bloquea procesos | Ejecutar build/Vercel **dentro de Docker** |
| `invalid source release: 21` | Capacitor 8 exige JDK 21 | Usar JBR 21 |

---

## 11. Operación y mantenimiento

- **Dormido en Free:** Render suspende tras 15 min sin tráfico → primera petición ~30 s.
- **Redesplegar tras cambios:**
  ```bash
  docker build -f deploy/Dockerfile.render -t sebaaxx/tuxtla-backend:latest .
  docker push sebaaxx/tuxtla-backend:latest
  # luego: POST /v1/services/{id}/deploys { "clearCache": "clear" }
  ```
- **Logs:** Dashboard de Render → Logs. CloudAMQP → Queues (cola `incident_events`).
- **Fotos:** el disco de Render es efímero → migrar a S3/Cloudinary para producción.
- **Dominio:** se puede añadir un custom domain en Render y Vercel.

---

## 12. Variables de entorno (Render)

| Variable | Valor |
|---|---|
| `DB_HOST` | host de Aiven |
| `DB_PORT` | `18522` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | (secreto) |
| `DB_SSL` | `true` |
| `JWT_SECRET` | secreto compartido |
| `OPENAI_API_KEY` | (secreto) |
| `RABBITMQ_URL` | `amqps://…@capybara.lmq.cloudamqp.com/wzfucqzn` |
| `TELEGRAM_TOKEN` | (secreto) |

---

## 13. Checklist de verificación

- [x] Aiven: 7 bases + admin + 8 reportes
- [x] CloudAMQP: cola `incident_events` creada
- [x] Imagen Docker publicada (`sebaaxx/tuxtla-backend:latest`)
- [x] Render: `/health` 200 · `/api/incidents` 200
- [x] Vercel: app carga y apunta a Render
- [x] Bot de Telegram: polling activo y comandos OK
- [x] APK: generado (4.28 MB) y descargable
