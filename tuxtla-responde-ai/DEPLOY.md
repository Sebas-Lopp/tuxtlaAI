# 🚀 Despliegue en la nube (Render + Vercel)

Guía para publicar **TuxtlaResponde AI** en la nube.

## Arquitectura

```
Celular (APK)  ─┐
Navegador      ─┼─►  Vercel (frontend web)  ──►  Render (backend)  ──►  MySQL cloud
                │        (React estático)          (microservicios)       RabbitMQ cloud
                └─►  Render API  (https://tuxtla-backend.onrender.com)
```

- **Render** → backend completo (los 8 microservicios + gateway) en **un solo contenedor**.
- **Vercel** → frontend web (build estático de Vite).
- **APK** → binario Android que apunta al backend de Render (se compila aparte).

## ⚠️ Requisitos (el backend NO puede usar tu MySQL/RabbitMQ locales)

El backend necesita servicios en la nube porque Render no puede ver tu PC:

| Servicio | Opción recomendada (gratis) | Qué necesitas |
|---|---|---|
| **MySQL** | [PlanetScale](https://planetscale.com) o [Aiven](https://aiven.io) o [Railway](https://railway.app) | Host, usuario, contraseña y puerto `3306` |
| **RabbitMQ** | [CloudAMQP](https://cloudamqp.com) (plan Little Lemur) | URL `amqps://...` |
| **Render** | [render.com](https://render.com) | Cuenta + API key o repo GitHub |
| **Vercel** | [vercel.com](https://vercel.com) | Cuenta + token o repo GitHub |

---

## Paso 1 — Base de datos MySQL en la nube

1. Crea una instancia MySQL (PlanetScale/Aiven/Railway) y copia sus credenciales.
2. Ejecuta los scripts del proyecto contra esa base:
   ```bash
   mysql -h <HOST> -P 3306 -u <USER> -p < database/init-mysql.sql
   mysql -h <HOST> -P 3306 -u <USER> -p < database/migrate-v2.sql
   mysql -h <HOST> -P 3306 -u <USER> -p < database/seed.sql
   ```
   (Si tu proveedor no permite `mysql` CLI, usa su consola SQL y pega el contenido.)

> ℹ️ `init-mysql.sql` crea las 7 bases (`tuxtla_responde`, `tuxtla_dispatch`, etc.).
> `migrate-v2.sql` agrega auth/moderación/comentarios y el admin `admin@tuxtla.mx / admin123`.

## Paso 2 — RabbitMQ en la nube

1. Crea una instancia en [CloudAMQP](https://cloudamqp.com) (plan gratuito).
2. Copia la **AMQP URL** (ej. `amqps://user:pass@host/vhost`).

## Paso 3 — Backend en Render

1. Sube el proyecto a un repo de GitHub (o usa la API de Render).
2. En Render: **New → Blueprint** → conecta el repo → Render lee `render.yaml`.
3. Configura las variables de entorno (marcadas `sync: false`):
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
   - `OPENAI_API_KEY`
   - `RABBITMQ_URL`
   - `TELEGRAM_TOKEN` (opcional)
4. Deploy. Cuando termine, tendrás una URL tipo `https://tuxtla-backend.onrender.com`.
5. Verifica: `https://tuxtla-backend.onrender.com/health` → `{"status":"API Gateway funcionando correctamente"}`.

> El `render.yaml` usa `deploy/Dockerfile.render` (backend todo-en-uno) y `deploy/start-all.sh`.

## Paso 4 — Frontend en Vercel

1. En Vercel: **Add New → Project** → importa el repo.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite (Vercel lo detecta con `vercel.json`).
4. **Environment Variables:**
   - `VITE_API_URL` = `https://tuxtla-backend.onrender.com/api`
   - `VITE_UPLOADS_URL` = `https://tuxtla-backend.onrender.com/uploads`
5. Deploy. Tu app quedará en `https://tuxtla-xxx.vercel.app`.

> `frontend/vercel.json` ya configura el rewrite SPA.

## Paso 5 — APK de Android

El APK es un binario aparte (no se "sube" a Vercel). Debe apuntar al backend de Render:

```bash
cd frontend
# 1) Compilar los assets apuntando a Render
VITE_API_URL=https://tuxtla-backend.onrender.com/api \
VITE_UPLOADS_URL=https://tuxtla-backend.onrender.com/uploads \
npm run build
# 2) Copiar a Android y compilar el APK
npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

**Publicar el APK:** puedes copiarlo a `frontend/public/TuxtlaResponde.apk` para que Vercel lo
sirva en `https://tuxtla-xxx.vercel.app/TuxtlaResponde.apk` (descarga directa), o subirlo a Google Play.

## Notas importantes

- **Fotos:** el microservicio de media guarda los archivos en el contenedor. En Render el
  filesystem es efímero: al reiniciar se pierden. Para producción usa un disco persistente
  o un bucket S3/Cloudinary.
- **CORS:** el gateway ya tiene `cors()` abierto.
- **n8n:** no se despliega en Render (es opcional; puedes usar n8n.cloud).
- **Plan gratis de Render:** el servicio se "duerme" tras 15 min sin tráfico; la primera
  petición tarda ~30 s en despertar.
