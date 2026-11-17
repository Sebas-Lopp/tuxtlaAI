const express = require('express');
const cors = require('cors');
require('dotenv').config();

const TransparencyController = require('./controllers/TransparencyController');
const MySqlTransparencyRepository = require('../database/MySqlTransparencyRepository');

const app = express();
app.use(express.json());
app.use(cors());

const transparencyRepo = new MySqlTransparencyRepository();
const transparencyController = new TransparencyController(transparencyRepo);

app.get('/health', (req, res) => res.json({ status: 'OK', service: '03-transparency-service' }));

// Ruta del Microservicio 3 para métricas del dashboard municipal
app.get('/api/transparency/stats', (req, res) => transparencyController.getStats(req, res));
app.post('/api/transparency/log', (req, res) => transparencyController.log(req, res));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 Microservicio 3 (Transparency) corriendo en http://localhost:${PORT}`);
});
