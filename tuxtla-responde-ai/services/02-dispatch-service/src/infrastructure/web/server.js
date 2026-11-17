const express = require('express');
const cors = require('cors');
require('dotenv').config();

const DispatchController = require('./controllers/DispatchController');
const MySqlDispatchRepository = require('../database/MySqlDispatchRepository');

const app = express();
app.use(express.json());
app.use(cors());

const dispatchRepository = new MySqlDispatchRepository();
const dispatchController = new DispatchController(dispatchRepository);

app.get('/health', (req, res) => res.json({ status: 'OK', service: '02-dispatch-service' }));

// Rutas del Microservicio 2
app.post('/api/dispatches', (req, res) => dispatchController.assign(req, res));
app.get('/api/dispatches', (req, res) => dispatchController.getAll(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Microservicio 2 (Dispatch) corriendo en http://localhost:${PORT}`);
});
