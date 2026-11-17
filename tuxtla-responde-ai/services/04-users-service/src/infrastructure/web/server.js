const express = require('express');
const cors = require('cors');
require('dotenv').config();

const UserController = require('./controllers/UserController');
const MySqlUserRepository = require('../database/MySqlUserRepository');

const app = express();
app.use(express.json());
app.use(cors());

const userRepository = new MySqlUserRepository();
const userController = new UserController(userRepository);

app.get('/health', (req, res) => res.json({ status: 'OK', service: '04-users-service' }));

// Autenticación y usuarios
app.post('/api/users/register', (req, res) => userController.register(req, res));
app.post('/api/users/login', (req, res) => userController.login(req, res));
app.get('/api/users', (req, res) => userController.getAll(req, res));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`🚀 Microservicio 4 (Users) corriendo en http://localhost:${PORT}`);
});
