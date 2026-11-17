const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const MediaController = require('./controllers/MediaController');
const MySqlMediaRepository = require('../database/MySqlMediaRepository');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de Multer para guardar en la carpeta local 'uploads'
const uploadDir = path.join(__dirname, '../../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        cb(new Error('Solo se permiten archivos de imagen.'));
    }
});

// Servir la carpeta de imágenes de manera estática
app.use('/uploads', express.static(uploadDir));

const mediaRepository = new MySqlMediaRepository();
const mediaController = new MediaController(mediaRepository);

app.get('/health', (req, res) => res.json({ status: 'OK', service: '06-media-evidence-service' }));

// Rutas del Microservicio 6 (El campo del formulario se llamará 'image')
app.post('/api/media', upload.single('image'), (req, res) => mediaController.upload(req, res));
app.get('/api/media', (req, res) => mediaController.getAll(req, res));

// Manejo de errores de Multer
app.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({ error: err.message || 'Error al procesar el archivo' });
    }
    next();
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Microservicio 6 (Media) corriendo en http://localhost:${PORT}`);
});
