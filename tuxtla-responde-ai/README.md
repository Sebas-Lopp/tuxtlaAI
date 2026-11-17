# 🏙️ TuxtlaResponde AI

Sistema municipal de **gestión urbana e incidencias ciudadanas** construido con una arquitectura de
**microservicios (hexagonal)** en Node.js/Express, una base de datos **MySQL** y un **frontend web** con
mapa interactivo, gráficas de transparencia y formulario de reporte con análisis de **IA (OpenAI Vision)**.

> **Regla de Oro:** todo el tráfico (web, móvil, n8n e IA) entra ÚNICAMENTE por el **API Gateway en el
> puerto 4000** → `http://localhost:4000/api/...`. Nunca se atacan los puertos de los microservicios
> directamente.

---

## 1. Arquitectura

| # | Microservicio | Puerto interno | Ruta (Gateway) | Base de datos |
|---|---|---|---|---|
| 01 | Citizen Incidents | 3000 | `/api/incidents` | `tuxtla_responde` |
| 02 | Dispatch | 3001 | `/api/dispatches` | `tuxtla_dispatch` |
| 03 | Transparency | 3002 | `/api/transparency` | `tuxtla_transparency` |
| 04 | Users | 3003 | `/api/users` | `tuxtla_users` |
| 05 | Notifications | 3004 | `/api/notifications` | `tuxtla_notifications` |
| 06 | Media Evidence | 3005 | `/api/media` | `tuxtla_media` |
| 07 | AI Vision | 3006 | `/api/ai` | `tuxtla_ai_triage` |
| 08 | API Gateway | **4000** | Todas (proxy) | — (sin BD) |
| — | Frontend Web | 8080 (nginx) | — | — |

Cada microservicio es independiente (hexagonal: `domain` → `application` → `infrastructure`) y se
conecta a su **propia base lógica** dentro del mismo servidor MySQL.

---

## 2. Requisitos

- **Docker Desktop** (con el motor de Linux corriendo).
- **MySQL 8** corriendo en el host, con un usuario con permisos de administrador
  (`adminSebas` / `megadethxd` por defecto, ver sección 4).
- (Opcional) Node.js 20+ si quieres correr los servicios sin Docker.

---

## 3. Lo que se completó / corrigió respecto al ZIP original

1. **Base de datos:** se migró de PostgreSQL/PostGIS a **MySQL 8** (según lo pedido), conservando
   coordenadas espaciales reales con `POINT` y `SRID 4326`.
2. **Tablas físicas:** se creó `database/init-mysql.sql` con los 7 esquemas y sus tablas, y
   `database/seed.sql` con datos de demostración.
3. **API Gateway:** antes solo enrutaba `/api/ai`. Ahora hace **proxy de las 7 rutas + `/uploads`**,
   incluyendo streaming de `multipart/form-data`.
4. **IA (Microservicio 07):** se conectó el análisis real a **OpenAI Vision** (`gpt-4o-mini`) con un
   *fallback determinístico* (no aleatorio) para que el sistema nunca se caiga si no hay key/red.
5. **Frontend:** se reemplazó el borrador de React Native por un **frontend web completo** (React + Vite +
   Leaflet): mapa interactivo, tarjetas de métricas, gráficas de severidad/tipo y formulario de reporte
   con subida de foto y triage de IA.
6. **Dockerización:** se agregó un `Dockerfile` por microservicio, `docker-compose.yml` completo y el
   build multi-etapa del frontend (Node → nginx).
7. **Bugs corregidos:** rutas de `require` erróneas en los controladores 04/05/06, controlador de
   incidentes sin `create`/`updateStatus`, `GetUsersUseCase` faltante, y orden de ejes de MySQL para
   `POINT` (latitud/longitud).

---

## 4. Configuración de la base de datos (MySQL Workbench)

La conexión por defecto en el código es:

```
Host:     127.0.0.1 (o host.docker.internal desde contenedores)
Puerto:   3306
Usuario:  adminSebas
Password: megadethxd
```

Crea las 7 bases y tablas una sola vez (desde `PowerShell` o `cmd`, con el cliente `mysql`):

```powershell
mysql -u adminSebas -pmegadethxd < database\init-mysql.sql
```

Y opcionalmente los datos de demostración:

```powershell
mysql -u adminSebas -pmegadethxd < database\seed.sql
```

> Si tu usuario/contraseña son distintos, cámbialos en el `environment` de `docker-compose.yml`
> (`DB_USER` / `DB_PASSWORD`).

---

## 5. Levantar todo con Docker (recomendado)

Desde la raíz del proyecto:

```powershell
docker compose up --build -d
```

Esto construye y levanta: los 8 microservicios + el frontend. Después de un momento:

| Recurso | URL |
|---|---|
| **Frontend (Dashboard + App ciudadana)** | http://localhost:8080 |
| **API Gateway (única entrada)** | http://localhost:4000 |
| Health del gateway | http://localhost:4000/health |

Para ver logs / detener:

```powershell
docker compose logs -f
docker compose down
```

> Los microservicios **no** publican puertos al host (solo el gateway 4000 y el frontend 8080); se
> comunican por la red interna de Docker. El gateway llega a tu MySQL del host vía `host.docker.internal`.

---

## 6. Levantar sin Docker (desarrollo)

Con Node 20+ y MySQL corriendo, instala y arranca cada servicio (los puertos internos 3000-3006 y 4000):

```powershell
cd services\01-citizen-incident-service ; npm install ; npm start
# ... repetir para 02..07 y el gateway (08)
```

Y el frontend en modo desarrollo:

```powershell
cd frontend ; npm install ; npm run dev
```

---

## 7. Flujo de un reporte ciudadano (end-to-end)

1. `POST /api/users/register` + `POST /api/users/login` → obtiene un **JWT**.
2. `POST /api/incidents` (con header `Authorization: Bearer <token>`) → crea el reporte en
   **moderación PENDIENTE**.
3. `POST /api/media` (form-data, campo `image`) → guarda la foto localmente y devuelve `fileUrl`.
4. `PUT /api/incidents/:id/photo` → asocia la foto.
5. `POST /api/ai` (`{ incidentId, imageUrl }`) → OpenAI Vision devuelve severidad `ALTA/MEDIA/BAJA`.
6. `PUT /api/incidents/:id/severity` → actualiza la severidad.
7. El **admin** aprueba con `PUT /api/incidents/:id/moderation` (`{ "moderation": "APROBADO" }`).

### Cuentas por defecto

| Rol | Correo | Contraseña |
|---|---|---|
| 👑 Administrador | `admin@tuxtla.mx` | `admin123` |

### Nuevos endpoints (v2)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/users/register` | Registro de ciudadano (requiere name/email/password) |
| POST | `/api/users/login` | Login → devuelve JWT + usuario |
| GET | `/api/incidents/moderation/pending` | Reportes pendientes (admin) |
| PUT | `/api/incidents/:id/moderation` | Aprobar/rechazar (admin) |
| GET | `/api/incidents/:id/comments` | Comentarios de un reporte |
| POST | `/api/incidents/:id/comments` | Comentar (requiere sesión) |
| POST | `/api/ai/chat` | Chatbot: resumen de la ciudad con OpenAI |

El feed consume `GET /api/incidents` (solo aprobados) y `GET /api/transparency/stats` (métricas de
los reportes aprobados).

---

## 8. Variables de entorno relevantes

| Variable | Por defecto | Uso |
|---|---|---|
| `DB_HOST` | `127.0.0.1` (local) / `host.docker.internal` (Docker) | Host de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_USER` / `DB_PASSWORD` | `adminSebas` / `megadethxd` | Credenciales |
| `DB_NAME` | (según servicio) | Esquema del microservicio |
| `OPENAI_API_KEY` | en `.env` raíz | Clave de OpenAI para la IA |
| `OPENAI_MODEL` | `gpt-4o-mini` | Modelo de visión |
| `PUBLIC_BASE_URL` | `http://localhost:4000` | URL pública de las fotos |

> 🔒 **Importante:** el archivo `.env` contiene una `OPENAI_API_KEY`. Reemplázala por la tuya y no la
> subas a un repositorio público.

---

## 9. Estructura del proyecto

```
tuxtla-responde-ai/
├── docker-compose.yml
├── .env                       # OPENAI_API_KEY
├── database/
│   ├── init-mysql.sql         # 7 bases + tablas
│   └── seed.sql               # datos demo
├── services/
│   ├── 01-citizen-incident-service/   (Dockerfile incluido)
│   ├── 02-dispatch-service/
│   ├── 03-transparency-service/
│   ├── 04-users-service/
│   ├── 05-notifications-service/
│   ├── 06-media-evidence-service/
│   ├── 07-ai-vision-service/
│   └── 08-api-gateway/
└── frontend/                  # React + Vite + Leaflet (Dockerfile multi-etapa)
```

---

## 10. Bot de Telegram 🤖 (+ n8n)

El bot **@tuxtlaa_bot** está **activo** mediante el microservicio `09-telegram-bot`, que hace *polling*
directo de Telegram y consulta el API Gateway. Escribe en Telegram a tu bot:

- `/stats` → métricas (total, pendientes, en proceso, resueltos, % resuelto).
- `/reportes` → últimos reportes aprobados.
- `/resumen` → resumen generado por la IA (OpenAI).
- `/start` o `/help` → lista de comandos.

> 💡 `n8n` sigue corriendo en **http://localhost:5678** (usuario `admin@tuxtla.mx`, contraseña
> `TuxtlaN8n123!`) por si quieres automatizar otros flujos. Nota: el nodo *Telegram Trigger* de n8n 2.x
> presentó un fallo de activación, por eso la respuesta del bot la atiende directamente el servicio
> `09-telegram-bot` (más confiable). El workflow de referencia está en `n8n/telegram-workflow.json`.
