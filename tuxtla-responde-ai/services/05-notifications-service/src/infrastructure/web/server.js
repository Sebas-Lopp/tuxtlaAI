const express = require('express');
const cors = require('cors');
require('dotenv').config();

const NotificationController = require('./controllers/NotificationController');
const MySqlNotificationRepository = require('../database/MySqlNotificationRepository');
const rabbitConsumer = require('../messaging/RabbitConsumer');

const app = express();
app.use(express.json());
app.use(cors());

const notificationRepository = new MySqlNotificationRepository();
const notificationController = new NotificationController(notificationRepository);

// Consumir eventos de RabbitMQ (incidentes) y guardarlos como notificaciones
rabbitConsumer.start(notificationRepository);

app.get('/health', (req, res) => res.json({ status: 'OK', service: '05-notifications-service' }));

// Rutas del Microservicio 5
app.post('/api/notifications', (req, res) => notificationController.send(req, res));
app.get('/api/notifications', (req, res) => notificationController.getAll(req, res));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`🚀 Microservicio 5 (Notifications) corriendo en http://localhost:${PORT}`);
});
