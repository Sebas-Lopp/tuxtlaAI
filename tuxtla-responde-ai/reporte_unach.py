# -*- coding: utf-8 -*-
"""Genera el reporte académico TuxtlaResponde AI (UNACH - Taller de Desarrollo 4)."""
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = "Reporte_TuxtlaRespondeAI_UNACH.docx"

doc = Document()

# ---------- Márgenes y fuente ----------
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3.0)
    section.right_margin = Cm(2.5)

normal = doc.styles["Normal"]
normal.font.name = "Arial"
normal.font.size = Pt(11)

# ---------- Helpers ----------
def h(text, level=1):
    return doc.add_heading(text, level=level)

def p(text="", bold=False, italic=False, size=None, align=None, space_after=None):
    par = doc.add_paragraph()
    run = par.add_run(text)
    run.bold = bold
    run.italic = italic
    if size:
        run.font.size = Pt(size)
    if align is not None:
        par.alignment = align
    if space_after is not None:
        par.paragraph_format.space_after = Pt(space_after)
    return par

def bullet(text):
    return doc.add_paragraph(text, style="List Bullet")

def code(text):
    par = doc.add_paragraph()
    par.paragraph_format.space_after = Pt(4)
    run = par.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(8)
    return par

def table(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    for i, htext in enumerate(headers):
        hdr[i].text = ""
        run = hdr[i].paragraphs[0].add_run(htext)
        run.bold = True
        run.font.size = Pt(9.5)
        hdr[i].paragraphs[0].paragraph_format.space_after = Pt(2)
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            run = cells[i].paragraphs[0].add_run(str(val))
            run.font.size = Pt(9.5)
            cells[i].paragraphs[0].paragraph_format.space_after = Pt(2)
    if widths:
        for i, w in enumerate(widths):
            for row in t.rows:
                row.cells[i].width = Cm(w)
    doc.add_paragraph()
    return t

def page_break():
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

def add_page_number(par):
    run = par.add_run()
    fld1 = OxmlElement("w:fldChar"); fld1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve"); instr.text = "PAGE"
    fld2 = OxmlElement("w:fldChar"); fld2.set(qn("w:fldCharType"), "end")
    run._r.append(fld1); run._r.append(instr); run._r.append(fld2)

# ============================================================
# PORTADA
# ============================================================
p("UNIVERSIDAD AUTÓNOMA DE CHIAPAS", bold=True, size=20, align=WD_ALIGN_PARAGRAPH.CENTER)
p("Facultad de Contaduría y Administración", size=14, align=WD_ALIGN_PARAGRAPH.CENTER)
p("Materia: Taller de Desarrollo 4", bold=True, size=13, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_paragraph()
doc.add_paragraph()
p("TuxtlaResponde AI", bold=True, size=26, align=WD_ALIGN_PARAGRAPH.CENTER)
p(
    "Plataforma de reportes ciudadanos con microservicios, inteligencia artificial "
    "y despliegue en la nube",
    italic=True, size=13, align=WD_ALIGN_PARAGRAPH.CENTER,
)
doc.add_paragraph()
doc.add_paragraph()
p("Integrantes:", bold=True, size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
p("Carlos Sebastián López Díaz  —  Matrícula 100025253", size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
p("Rubén de la Cruz Gómez  —  Matrícula 100023809", size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_paragraph()
p("Docente: Luis Alfaro Gutiérrez", size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
p("Tuxtla Gutiérrez, Chiapas — 13 de noviembre de 2026", size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
page_break()

# ============================================================
# ÍNDICE
# ============================================================
h("Índice", 0)
indice = [
    "1. Introducción",
    "2. Objetivos",
    "3. Tecnologías utilizadas",
    "4. Arquitectura del sistema",
    "5. Microservicios",
    "6. Comunicación: API Gateway y RabbitMQ",
    "7. Dockerización",
    "8. Base de datos MySQL",
    "9. Frontend y aplicación móvil",
    "10. Inteligencia artificial",
    "11. Bot de Telegram",
    "12. Despliegue en la nube",
    "13. Pruebas y resultados",
    "14. Conclusiones",
    "15. Referencias",
]
for item in indice:
    par = doc.add_paragraph(item)
    par.paragraph_format.space_after = Pt(2)
page_break()

# ============================================================
# 1. INTRODUCCIÓN
# ============================================================
h("1. Introducción", 1)
p(
    "Tuxtla Gutiérrez enfrenta problemáticas urbanas cotidianas —baches, luminarias dañadas, "
    "basura acumulada y fugas de agua— que suelen reportarse por canales dispersos (redes "
    "sociales, llamadas, oficinas) y sin seguimiento verificable. Esta dispersión provoca "
    "duplicidad de reportes, pérdida de evidencia y poca transparencia para la ciudadanía."
)
p(
    "TuxtlaResponde AI nace como una plataforma que centraliza los reportes ciudadanos, los "
    "valida mediante un proceso de moderación, los enriquece con inteligencia artificial "
    "(clasificación de severidad y resumen de la ciudad) y los expone en un tablero público "
    "de transparencia. El sistema se construyó con una arquitectura de microservicios "
    "contenedorizada, comunicación asíncrona mediante un bus de eventos y un único punto de "
    "entrada (API Gateway)."
)
p(
    "El presente documento describe el proceso de construcción del proyecto: las decisiones de "
    "arquitectura, la implementación de cada microservicio, la dockerización, el uso de "
    "RabbitMQ como bus de eventos y el despliegue final en la nube con proveedores gratuitos."
)

# ============================================================
# 2. OBJETIVOS
# ============================================================
h("2. Objetivos", 1)
h("2.1 Objetivo general", 2)
p(
    "Desarrollar y desplegar una plataforma de microservicios que permita a la ciudadanía "
    "reportar incidencias urbanas, con moderación, análisis de inteligencia artificial, "
    "notificaciones automáticas y transparencia de indicadores."
)
h("2.2 Objetivos específicos", 2)
bullet("Implementar ocho microservicios independientes con arquitectura hexagonal.")
bullet("Centralizar el acceso mediante un API Gateway como único punto de entrada.")
bullet("Integrar RabbitMQ como bus de eventos para desacoplar la creación de reportes de las notificaciones.")
bullet("Incorporar inteligencia artificial para clasificar la severidad y resumir la ciudad.")
bullet("Construir un frontend web responsivo estilo revista y una aplicación móvil (APK).")
bullet("Desplegar la solución en la nube (Render, Vercel, Aiven y CloudAMQP) con planes gratuitos.")

# ============================================================
# 3. TECNOLOGÍAS
# ============================================================
h("3. Tecnologías utilizadas", 1)
p(
    "El proyecto combina tecnologías de backend, frontend, mensajería, inteligencia artificial "
    "y servicios en la nube. La tabla siguiente resume las principales."
)
table(
    ["Capa", "Tecnología", "Uso en el proyecto"],
    [
        ["Backend", "Node.js 20 + Express", "Microservicios y API Gateway"],
        ["Arquitectura", "Hexagonal (dominio / aplicación / infraestructura)", "Organización del código de cada servicio"],
        ["Base de datos", "MySQL 8 (mysql2)", "Siete bases de datos lógicas"],
        ["Seguridad", "JWT + bcryptjs", "Autenticación y contraseñas cifradas"],
        ["Mensajería", "RabbitMQ (amqplib)", "Bus de eventos (cola incident_events)"],
        ["IA", "OpenAI GPT-4o mini", "Severidad de reportes y chatbot"],
        ["Frontend", "React 18 + Vite", "Interfaz web estilo revista"],
        ["Mapas", "Leaflet + OpenStreetMap", "Geolocalización de reportes"],
        ["Móvil", "Capacitor 8 + Android SDK", "Generación del APK"],
        ["Contenedores", "Docker + Docker Compose", "Orquestación local de 12 servicios"],
        ["Automatización", "n8n", "Flujos de trabajo y webhooks"],
        ["Bot", "API de Telegram", "Consultas ciudadanas por chat"],
        ["Nube", "Render, Vercel, Aiven, CloudAMQP, Docker Hub", "Despliegue de producción"],
    ],
    widths=[3.2, 6.0, 6.5],
)

# ============================================================
# 4. ARQUITECTURA
# ============================================================
h("4. Arquitectura del sistema", 1)
p(
    "La arquitectura sigue el patrón de microservicios con un API Gateway como único punto de "
    "entrada (la “Regla de Oro” del proyecto: todo entra por el gateway). Los microservicios "
    "no se publican directamente al exterior; el gateway enruta las peticiones y los servicios "
    "se comunican entre sí mediante eventos en RabbitMQ."
)
code(
    "                 FRONTEND (React / APK)\n"
    "                         |  HTTPS\n"
    "                 API GATEWAY (puerto 4000)\n"
    "   +------+------+-------+-------+------+------+\n"
    "   |      |      |       |       |      |      |\n"
    "  3000   3001   3002    3003    3004   3005   3006\n"
    "   01     02     03      04      05     06     07\n"
    "   |      |      |       |       |      |      |\n"
    "   +------+------+-------+-------+------+------+\n"
    "                         |\n"
    "                 MySQL (7 bases)\n"
    "                         |\n"
    "              RabbitMQ (incident_events)\n"
    "                         |\n"
    "             Notifications / Telegram Bot"
)
p(
    "Cada microservicio se organiza en tres capas: dominio (entidades y reglas de negocio), "
    "aplicación (casos de uso) e infraestructura (controladores HTTP, repositorios MySQL y "
    "mensajería). Esta separación facilita las pruebas y el mantenimiento."
)

# ============================================================
# 5. MICROSERVICIOS
# ============================================================
h("5. Microservicios", 1)
p("El sistema está compuesto por ocho microservicios y un bot, cada uno con su propia base de datos y responsabilidad.")
table(
    ["#", "Microservicio", "Puerto", "Base de datos", "Responsabilidad"],
    [
        ["01", "Citizen Incidents", "3000", "tuxtla_responde", "Crear, listar, moderar y comentar reportes"],
        ["02", "Dispatch", "3001", "tuxtla_dispatch", "Asignación de cuadrillas y órdenes de trabajo"],
        ["03", "Transparency", "3002", "tuxtla_transparency", "Estadísticas e indicadores públicos"],
        ["04", "Users", "3003", "tuxtla_users", "Registro, login (JWT) y roles"],
        ["05", "Notifications", "3004", "tuxtla_notifications", "Avisos al ciudadano (consume RabbitMQ)"],
        ["06", "Media Evidence", "3005", "tuxtla_media", "Subida de fotos de evidencia"],
        ["07", "AI Vision", "3006", "tuxtla_ai_triage", "Severidad con IA y chatbot de resumen"],
        ["08", "API Gateway", "4000", "—", "Punto único de entrada / proxy"],
        ["09", "Telegram Bot", "—", "—", "Consultas por Telegram"],
    ],
    widths=[1.0, 3.4, 1.6, 3.8, 5.5],
)

h("5.1 Citizen Incidents (01)", 2)
p(
    "Es el corazón del sistema. Gestiona el ciclo de vida del reporte y las coordenadas "
    "geográficas (tipo POINT SRID 4326). Endpoints principales:"
)
table(
    ["Método y ruta", "Función"],
    [
        ["POST /api/incidents", "Crear un reporte (requiere JWT); nace en moderación PENDIENTE"],
        ["GET /api/incidents", "Listar reportes aprobados (feed público y mapa)"],
        ["GET /api/incidents/:id", "Detalle de un reporte"],
        ["GET /api/incidents/moderation/pending", "Reportes pendientes (solo ADMIN)"],
        ["PUT /api/incidents/:id/moderation", "Aprobar o rechazar (solo ADMIN)"],
        ["PUT /api/incidents/:id/status", "Cambiar estado (PENDIENTE / EN_PROCESO / RESUELTO)"],
        ["PUT /api/incidents/:id/photo", "Asociar la foto subida"],
        ["PUT /api/incidents/:id/severity", "Guardar la severidad calculada por IA"],
        ["GET/POST /api/incidents/:id/comments", "Listar y publicar comentarios"],
    ],
    widths=[7.0, 8.5],
)

h("5.2 Dispatch (02)", 2)
p("Gestiona la asignación de cuadrillas a los reportes: POST /api/dispatches y GET /api/dispatches.")

h("5.3 Transparency (03)", 2)
p(
    "Calcula las métricas públicas a partir de los reportes aprobados: total, pendientes, en "
    "proceso, resueltos, porcentaje de resolución y desglose por severidad y por tipo "
    "(GET /api/transparency/stats)."
)

h("5.4 Users (04)", 2)
p(
    "Registro (POST /api/users/register, con bcrypt), inicio de sesión (POST /api/users/login, "
    "devuelve JWT) y listado de usuarios. Roles: CIUDADANO, OPERADOR y ADMIN."
)

h("5.5 Notifications (05)", 2)
p(
    "Registra y lista notificaciones (POST/GET /api/notifications). Además, es el consumidor de "
    "RabbitMQ: al recibir los eventos de incidencias genera automáticamente los avisos."
)

h("5.6 Media Evidence (06)", 2)
p(
    "Almacena las fotografías de evidencia (POST /api/media con multipart) y sirve los archivos "
    "estáticos en /uploads."
)

h("5.7 AI Vision (07)", 2)
p(
    "Analiza la fotografía y determina la severidad del reporte (ALTA / MEDIA / BAJA) con "
    "OpenAI, además de ofrecer un chatbot que resume el estado de la ciudad "
    "(POST /api/ai y POST /api/ai/chat)."
)

h("5.8 API Gateway (08)", 2)
p(
    "Único punto de entrada. Redirige las rutas /api/incidents, /api/dispatches, "
    "/api/transparency, /api/users, /api/notifications, /api/media, /api/ai y /uploads hacia los "
    "servicios internos. Ningún cliente accede directamente a los puertos 3000-3006."
)

h("5.9 Telegram Bot (09)", 2)
p(
    "Bot que consulta el gateway mediante polling. Comandos: /start, /ayuda, /stats, /reportes, "
    "/resumen, /baches, /luminarias, /basura y /fugas."
)

# ============================================================
# 6. COMUNICACIÓN
# ============================================================
h("6. Comunicación: API Gateway y RabbitMQ", 1)
p(
    "El sistema usa dos mecanismos de comunicación complementarios:"
)
bullet(
    "Sincrónica (HTTP): el frontend y la app llaman al gateway, que reenvía a los microservicios."
)
bullet(
    "Asíncrona (eventos): el microservicio 01 publica eventos en la cola incident_events "
    "(incident.created, incident.aprobado, incident.rechazado) y el servicio 05 los consume para "
    "crear notificaciones, sin acoplar ambos servicios."
)
p(
    "Este diseño permite que, si el servicio de notificaciones se detiene, los reportes se sigan "
    "creando; los eventos quedan encolados y se procesan cuando el consumidor vuelve."
)

# ============================================================
# 7. DOCKER
# ============================================================
h("7. Dockerización", 1)
p(
    "Todo el sistema se orquestó con Docker Compose. Se definieron doce servicios, una red "
    "interna y tres volúmenes persistentes. Solo el gateway (4000) y el frontend (8080) se "
    "publican al host; los microservicios permanecen en la red interna."
)
table(
    ["Contenedor", "Imagen / Build", "Puerto", "Función"],
    [
        ["tuxtla_incidents", "build 01", "3000", "Reportes"],
        ["tuxtla_dispatch", "build 02", "3001", "Despacho"],
        ["tuxtla_transparency", "build 03", "3002", "Métricas"],
        ["tuxtla_users_service", "build 04", "3003", "Usuarios"],
        ["tuxtla_notifications", "build 05", "3004", "Notificaciones"],
        ["tuxtla_media", "build 06", "3005", "Evidencias"],
        ["tuxtla_ai_vision", "build 07", "3006", "IA"],
        ["tuxtla_api_gateway", "build 08", "4000", "Gateway"],
        ["tuxtla_frontend", "build frontend", "8080", "Web"],
        ["tuxtla_n8n", "n8nio/n8n", "5678", "Automatización"],
        ["tuxtla_telegram_bot", "build 09", "—", "Bot"],
        ["tuxtla_rabbitmq", "rabbitmq:3-management", "5672/15672", "Bus de eventos"],
    ],
    widths=[4.2, 4.2, 2.4, 4.7],
)
p(
    "Los volúmenes uploads_data, n8n_data y rabbitmq_data conservan las fotos, los flujos de n8n "
    "y la configuración de RabbitMQ entre reinicios. Cada servicio se construye con su propio "
    "Dockerfile y la variable restart: unless-stopped garantiza su recuperación."
)

# ============================================================
# 8. BASE DE DATOS
# ============================================================
h("8. Base de datos MySQL", 1)
p(
    "Se utilizan siete bases de datos lógicas, una por microservicio, con las siguientes tablas:"
)
table(
    ["Base de datos", "Tablas principales"],
    [
        ["tuxtla_responde", "incidents, comments"],
        ["tuxtla_dispatch", "dispatches"],
        ["tuxtla_transparency", "transparency_logs"],
        ["tuxtla_users", "users"],
        ["tuxtla_notifications", "notifications"],
        ["tuxtla_media", "media_evidence"],
        ["tuxtla_ai_triage", "ai_analyses"],
    ],
    widths=[6.0, 9.5],
)
p(
    "La tabla incidents almacena las coordenadas con el tipo espacial POINT SRID 4326, lo que "
    "permite ubicar cada reporte en el mapa. El esquema se creó con tres scripts: "
    "init-mysql.sql (bases y tablas), migrate-v2.sql (autenticación, moderación, comentarios y "
    "usuario administrador) y seed.sql (datos de demostración)."
)
p(
    "El proceso de moderación es clave: todo reporte nace en estado PENDIENTE y solo aparece en "
    "el feed público cuando un administrador lo aprueba (moderation = APROBADO)."
)

# ============================================================
# 9. FRONTEND Y APP
# ============================================================
h("9. Frontend y aplicación móvil", 1)
p(
    "El frontend se desarrolló con React 18 y Vite, con un diseño editorial tipo revista: "
    "portada con reportes destacados, barra de tendencias, estadísticas en tarjetas, categorías, "
    "mapa interactivo (Leaflet) y un chatbot flotante. Incluye autenticación, comentarios, "
    "moderación para administradores y un botón de ubicación por reporte que abre el mapa en las "
    "coordenadas exactas."
)
p(
    "Se configuró como PWA (manifest y service worker) para instalarse en el celular. Además, se "
    "generó un APK nativo con Capacitor 8 y el SDK de Android, compilado con Gradle y JDK 21, "
    "apuntando al backend en la nube."
)

# ============================================================
# 10. IA
# ============================================================
h("10. Inteligencia artificial", 1)
p(
    "El microservicio 07 integra la API de OpenAI (modelo GPT-4o mini) en dos funciones:"
)
bullet(
    "Clasificación de severidad: analiza la fotografía del reporte y devuelve ALTA, MEDIA o "
    "BAJA con un nivel de confianza. Si la IA no está disponible, se aplica un respaldo "
    "determinístico para no bloquear el registro."
)
bullet(
    "Chatbot de resumen: responde preguntas sobre lo que ocurre en la ciudad a partir de los "
    "reportes aprobados, ofreciendo un resumen conversacional."
)

# ============================================================
# 11. TELEGRAM
# ============================================================
h("11. Bot de Telegram", 1)
p(
    "El bot permite a la ciudadanía consultar el estado de la ciudad sin abrir la aplicación. "
    "Consulta al gateway por HTTP y responde a los comandos /stats (métricas), /reportes "
    "(últimos reportes), /resumen (resumen con IA), /baches, /luminarias, /basura y /fugas. "
    "En producción se ejecuta dentro del backend en Render y cuenta con un respaldo para "
    "conectarse a la URL pública si el gateway interno no responde."
)

# ============================================================
# 12. NUBE
# ============================================================
h("12. Despliegue en la nube", 1)
p(
    "Para publicar el proyecto se utilizaron cinco proveedores gratuitos. El backend se "
    "empaquetó en una sola imagen Docker (“todo en uno”) que arranca los ocho microservicios, "
    "el gateway y el bot; el frontend se compiló como sitio estático."
)
table(
    ["Proveedor", "Rol", "Plan"],
    [
        ["Render", "Backend (contenedor Docker)", "Free"],
        ["Vercel", "Frontend estático + APK", "Hobby"],
        ["Aiven", "MySQL 8.4 administrado", "Free"],
        ["CloudAMQP", "RabbitMQ administrado", "Little Lemur"],
        ["Docker Hub", "Registro de la imagen", "Free"],
    ],
    widths=[4.0, 8.5, 3.0],
)
h("12.1 Pasos del despliegue", 2)
p("El proceso se ejecutó en seis etapas:")
bullet("Base de datos: se creó una instancia MySQL en Aiven y se ejecutaron los scripts SQL.")
bullet("Bus de eventos: se creó una instancia RabbitMQ en CloudAMQP y la cola incident_events.")
bullet("Imagen: se construyó y publicó la imagen del backend en Docker Hub.")
bullet("Backend: se creó un Web Service en Render a partir de la imagen, con las variables de entorno.")
bullet("Frontend: se compiló con VITE_API_URL apuntando a Render y se desplegó en Vercel.")
bullet("APK: se compiló con Capacitor y se publicó para descarga desde Vercel.")
h("12.2 Variables de entorno en Render", 2)
table(
    ["Variable", "Valor / función"],
    [
        ["DB_HOST, DB_PORT", "Host y puerto de Aiven (18522)"],
        ["DB_USER, DB_PASSWORD", "Credenciales de MySQL"],
        ["DB_SSL", "true (Aiven exige SSL)"],
        ["JWT_SECRET", "Secreto para firmar tokens"],
        ["OPENAI_API_KEY", "Clave de OpenAI"],
        ["RABBITMQ_URL", "URL AMQP de CloudAMQP"],
        ["TELEGRAM_TOKEN", "Token del bot"],
    ],
    widths=[5.0, 10.5],
)
h("12.3 Retos técnicos resueltos", 2)
bullet(
    "SSL en MySQL: se añadió soporte DB_SSL a los ocho repositorios para conectar con Aiven."
)
bullet(
    "Puerto dinámico: Render asigna $PORT; el gateway y el bot ahora usan ese mismo puerto, con "
    "respaldo a la URL pública."
)
bullet(
    "Construcción en contenedor: el build del frontend se ejecutó dentro de Docker para evitar "
    "restricciones del sistema operativo."
)

# ============================================================
# 13. PRUEBAS
# ============================================================
h("13. Pruebas y resultados", 1)
p(
    "Se verificaron los endpoints principales del backend desplegado y el flujo completo de un "
    "reporte (creación, foto, IA, moderación y notificación). La tabla resume los resultados."
)
table(
    ["Prueba", "Resultado esperado", "Resultado obtenido"],
    [
        ["GET /health", "200", "200 — Gateway operativo"],
        ["GET /api/incidents", "200 con reportes", "200 — 8 a 11 reportes"],
        ["GET /api/transparency/stats", "200 con métricas", "200 — total, severidad y tipos"],
        ["POST /api/users/login", "JWT del administrador", "200 — token válido"],
        ["Evento RabbitMQ", "Notificación creada", "Notificación generada correctamente"],
        ["APK", "Archivo instalable", "app-debug.apk (4.28 MB)"],
    ],
    widths=[5.5, 5.0, 5.0],
)
p(
    "Además se realizó una prueba de degradación controlada: se apagó el microservicio de "
    "reportes con la variable DISABLE_INCIDENTS=true. El resultado fue el esperado: "
    "/api/incidents respondió 504, mientras /health, /api/transparency/stats, /api/users y "
    "/api/media siguieron respondiendo 200, y el frontend continuó cargando gracias al manejo "
    "tolerante a fallos (Promise.allSettled)."
)

# ============================================================
# 14. CONCLUSIONES
# ============================================================
h("14. Conclusiones", 1)
p(
    "El proyecto permitió aplicar de forma integral los conceptos de la materia: se construyó "
    "una arquitectura de microservicios desacoplada, con un API Gateway como punto único de "
    "entrada, un bus de eventos para la comunicación asíncrona y una base de datos por servicio."
)
p(
    "La dockerización facilitó la reproducibilidad del entorno, mientras que el despliegue en la "
    "nube demostró que es posible llevar un sistema completo a producción con herramientas "
    "gratuitas. Finalmente, las pruebas de degradación evidenciaron la importancia de diseñar "
    "servicios tolerantes a fallos: la caída de un microservicio no derriba toda la plataforma."
)
p(
    "Como trabajo futuro se propone migrar el almacenamiento de fotografías a un servicio como "
    "S3 o Cloudinary, implementar un dominio personalizado y añadir pruebas automatizadas de "
    "integración."
)

# ============================================================
# 15. REFERENCIAS
# ============================================================
h("15. Referencias", 1)
refs = [
    "Node.js. (2026). Node.js Documentation. https://nodejs.org/docs",
    "Docker Inc. (2026). Docker Documentation. https://docs.docker.com",
    "RabbitMQ. (2026). RabbitMQ Documentation. https://www.rabbitmq.com/docs",
    "OpenAI. (2026). API Reference. https://platform.openai.com/docs",
    "Aiven. (2026). Aiven for MySQL — Get started. https://aiven.io/docs/products/mysql/get-started",
    "Render. (2026). Render Documentation. https://render.com/docs",
    "Vercel. (2026). Vercel Documentation. https://vercel.com/docs",
    "CloudAMQP. (2026). CloudAMQP Documentation. https://www.cloudamqp.com/docs",
    "Ionic. (2026). Capacitor Documentation. https://capacitorjs.com/docs",
    "Universidad Autónoma de Chiapas. (2026). https://www.unach.mx",
]
for r in refs:
    par = doc.add_paragraph(r)
    par.paragraph_format.space_after = Pt(2)

# ============================================================
# Pie de página con número
# ============================================================
footer = doc.sections[0].footer
fp = footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
fp.add_run("TuxtlaResponde AI — Taller de Desarrollo 4  |  ")
add_page_number(fp)

doc.save(OUT)
print("DOCX generado:", OUT)
