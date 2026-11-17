const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
app.use(cors());

// Mapa de rutas -> microservicios (Regla de Oro: todo entra por el puerto 4000)
const routes = [
    { path: '/api/incidents',    target: process.env.INCIDENTS_URL    || 'http://localhost:3000' },
    { path: '/api/dispatches',   target: process.env.DISPATCH_URL     || 'http://localhost:3001' },
    { path: '/api/transparency', target: process.env.TRANSPARENCY_URL || 'http://localhost:3002' },
    { path: '/api/users',        target: process.env.USERS_URL        || 'http://localhost:3003' },
    { path: '/api/notifications',target: process.env.NOTIFICATIONS_URL|| 'http://localhost:3004' },
    { path: '/api/media',        target: process.env.MEDIA_URL        || 'http://localhost:3005' },
    { path: '/api/ai',           target: process.env.AI_URL           || 'http://localhost:3006' },
    { path: '/uploads',          target: process.env.MEDIA_URL        || 'http://localhost:3005' },
];

routes.forEach((route) => {
    app.use(route.path, createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        on: {
            error: (err, req, res) => {
                console.error(`❌ Error enrutando ${route.path} -> ${route.target}:`, err.message);
                if (!res.headersSent) {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                }
                res.end(JSON.stringify({
                    error: `Error en el API Gateway: el microservicio de ${route.path} no responde`,
                    details: err.message
                }));
            }
        }
    }));
});

app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway funcionando correctamente', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`API Gateway corriendo en el puerto ${PORT} (Regla de Oro: todo entra aquí)`);
});
