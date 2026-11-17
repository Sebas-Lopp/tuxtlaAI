const mysql = require('mysql2/promise');

class MySqlMediaRepository {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'adminSebas',
            password: process.env.DB_PASSWORD || 'megadethxd',
            database: process.env.DB_NAME || 'tuxtla_media',
            waitForConnections: true,
            connectionLimit: 2,
            maxIdle: 1,
            idleTimeout: 30000,
            charset: 'utf8mb4',
            ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
            dateStrings: true,
        });
    }

    async save(media) {
        const sql = `
            INSERT INTO media_evidence (id, incident_id, file_url, file_type, uploaded_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [media.id, media.incidentId, media.fileUrl, media.fileType, media.uploadedAt];

        try {
            await this.pool.execute(sql, values);
            console.log(`✅ Base de Datos (Media): Evidencia ${media.id} registrada.`);
        } catch (error) {
            console.error("❌ Error al guardar en tuxtla_media:", error);
            throw new Error("Error de base de datos al registrar la evidencia multimedia.");
        }
    }

    async findAll() {
        const sql = 'SELECT * FROM media_evidence ORDER BY uploaded_at DESC;';
        try {
            const [rows] = await this.pool.query(sql);
            return rows;
        } catch (error) {
            console.error("❌ Error al consultar evidencias:", error);
            throw new Error("Error al listar las evidencias.");
        }
    }
}

module.exports = MySqlMediaRepository;
