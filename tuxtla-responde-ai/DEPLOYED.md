# ✅ TuxtlaResponde AI — Desplegado en la nube

## 🌐 URLs en vivo

| Componente | URL |
|---|---|
| **Frontend (Vercel)** | https://dist-nine-indol-210fize2vf.vercel.app |
| **APK Android** | https://dist-nine-indol-210fize2vf.vercel.app/TuxtlaResponde.apk |
| **Backend (Render)** | https://tuxtla-backend.onrender.com |
| Health del backend | https://tuxtla-backend.onrender.com/health |
| API reportes | https://tuxtla-backend.onrender.com/api/incidents |
| Dashboard Render | https://dashboard.render.com/web/srv-dbr254s9v7es73egdmsg |
| Dashboard Vercel | https://vercel.com/sebastiancarlos101-9172/dist |

## 🗄️ Servicios en la nube

| Servicio | Proveedor | Detalle |
|---|---|---|
| MySQL | **Aiven** | MySQL 8.4 · 7 bases + admin + 8 reportes demo |
| RabbitMQ | **CloudAMQP** | vhost `wzfucqzn` · cola `incident_events` |
| Backend | **Render** | Imagen `sebaaxx/tuxtla-backend` · plan Free |
| Frontend | **Vercel** | Build estático con `VITE_API_URL` → Render |

## 🤖 Bot de Telegram (activo en Render)

Bot: **@tuxtlaa_bot**

| Comando | Qué hace |
|---|---|
| `/start` o `/ayuda` | Lista de comandos |
| `/stats` | Métricas (total, pendientes, en proceso, resueltos, %) |
| `/reportes` | Últimos reportes aprobados |
| `/resumen` | Resumen de la ciudad con IA |
| `/baches` | Reportes de baches |
| `/luminarias` | Reportes de luminarias |
| `/basura` | Reportes de basura |
| `/fugas` | Reportes de fugas de agua |

## 🔑 Cuenta admin

- `admin@tuxtla.mx` / `admin123`

## ⚠️ Notas

- **Plan Free de Render:** el backend se "duerme" tras 15 min sin tráfico; la primera petición tarda ~30 s en despertar.
- **Fotos:** el disco de Render es efímero (se pierden al redesplegar). Para producción usar S3/Cloudinary.
- **APK:** se compila con `tools` (ver `frontend/android`), apuntando a `https://tuxtla-backend.onrender.com`.
