const mysql = require('mysql2/promise');

class MySqlCommentRepository {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'adminSebas',
            password: process.env.DB_PASSWORD || 'megadethxd',
            database: process.env.DB_NAME || 'tuxtla_responde',
            waitForConnections: true,
            connectionLimit: 2,
            maxIdle: 1,
            idleTimeout: 30000,
            charset: 'utf8mb4',
            ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
            dateStrings: true,
        });
    }

    async save(comment) {
        const sql = `
            INSERT INTO comments (id, incident_id, user_id, user_name, content, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [comment.id, comment.incidentId, comment.userId, comment.userName, comment.content, comment.createdAt];
        try {
            await this.pool.execute(sql, values);
            return comment;
        } catch (error) {
            console.error("❌ Error al guardar comentario:", error);
            throw new Error("Error de base de datos al guardar el comentario.");
        }
    }

    async findByIncident(incidentId) {
        const sql = 'SELECT id, incident_id, user_id, user_name, content, created_at FROM comments WHERE incident_id = ? ORDER BY created_at ASC;';
        try {
            const [rows] = await this.pool.query(sql, [incidentId]);
            return rows;
        } catch (error) {
            console.error("❌ Error al listar comentarios:", error);
            throw new Error("Error al listar los comentarios.");
        }
    }
}

module.exports = MySqlCommentRepository;
