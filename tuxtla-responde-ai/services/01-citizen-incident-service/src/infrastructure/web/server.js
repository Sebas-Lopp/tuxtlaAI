const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auth = require('./middleware/auth');
const IncidentController = require('./controllers/IncidentController');
const CommentController = require('./controllers/CommentController');
const MySqlIncidentRepository = require('../database/mysql/MySqlIncidentRepository');
const MySqlCommentRepository = require('../database/mysql/MySqlCommentRepository');

const app = express();
app.use(cors());
app.use(express.json());

const incidentRepository = new MySqlIncidentRepository();
const commentRepository = new MySqlCommentRepository();
const incidentController = new IncidentController(incidentRepository, commentRepository);
const commentController = new CommentController(commentRepository);

app.get('/health', (req, res) => res.json({ status: 'OK', service: '01-citizen-incident-service' }));

// Moderación (admin) — antes de /:id para evitar colisiones
app.get('/api/incidents/moderation/pending', auth('ADMIN'), (req, res) => incidentController.getPending(req, res));

// Reportes
app.post('/api/incidents', auth(), (req, res) => incidentController.create(req, res));
app.get('/api/incidents', auth.optionalAuth, (req, res) => incidentController.getAll(req, res));
app.get('/api/incidents/:id', (req, res) => incidentController.getById(req, res));
app.put('/api/incidents/:id/moderation', auth('ADMIN'), (req, res) => incidentController.updateModeration(req, res));
app.put('/api/incidents/:id/status', auth(), (req, res) => incidentController.updateStatus(req, res));
app.put('/api/incidents/:id/photo', auth(), (req, res) => incidentController.updatePhoto(req, res));
app.put('/api/incidents/:id/severity', auth(), (req, res) => incidentController.updateSeverity(req, res));

// Comentarios
app.get('/api/incidents/:id/comments', (req, res) => commentController.getByIncident(req, res));
app.post('/api/incidents/:id/comments', auth(), (req, res) => commentController.create(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Microservicio 1 (Citizen Incidents) corriendo en http://localhost:${PORT}`);
});
