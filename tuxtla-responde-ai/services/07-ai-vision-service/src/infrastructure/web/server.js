const express = require('express');
const cors = require('cors');
require('dotenv').config();

const AiController = require('./controllers/AiController');
const MySqlAiRepository = require('../database/MySqlTriageRepository');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const aiController = new AiController(new MySqlAiRepository());

app.get('/health', (req, res) => res.json({ status: 'OK', service: '07-ai-vision-service' }));

app.post('/api/ai/analyze', (req, res) => aiController.analyze(req, res));

// Alias para que el gateway pueda enrutar /api/ai directamente
app.post('/api/ai', (req, res) => aiController.analyze(req, res));

// Chatbot de resumen de la ciudad
app.post('/api/ai/chat', (req, res) => aiController.chat(req, res));

// Endpoint de prueba de salud
app.get('/api/ai/health', (req, res) => res.json({ status: 'OK', service: 'AI Vision' }));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Microservicio de IA corriendo en el puerto ${PORT}`);
});
