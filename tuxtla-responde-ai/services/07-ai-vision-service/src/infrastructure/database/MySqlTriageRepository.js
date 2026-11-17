const mysql = require('mysql2/promise');

class MySqlAiRepository {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'adminSebas',
            password: process.env.DB_PASSWORD || 'megadethxd',
            database: process.env.DB_NAME || 'tuxtla_ai_triage',
            waitForConnections: true,
            connectionLimit: 2,
            maxIdle: 1,
            idleTimeout: 30000,
            charset: 'utf8mb4',
            ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
            dateStrings: true,
        });
    }

    // Reportes aprobados para el chatbot (consulta cruzada a tuxtla_responde)
    async getApprovedIncidents() {
        const sql = `
            SELECT id, type, title, description, status, severity, created_at
            FROM tuxtla_responde.incidents
            WHERE moderation = 'APROBADO'
            ORDER BY created_at DESC
        `;
        try {
            const [rows] = await this.pool.query(sql);
            return rows;
        } catch (error) {
            console.error('❌ Error al obtener reportes para el chatbot:', error);
            return [];
        }
    }

    async save(analysis) {
        const sql = `
            INSERT INTO ai_analyses (id, incident_id, image_url, severity, confidence, analyzed_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            analysis.id,
            analysis.incidentId,
            analysis.imageUrl,
            analysis.severity,
            analysis.confidence,
            analysis.analyzedAt,
        ];

        try {
            await this.pool.execute(sql, values);
            console.log(`✅ Base de Datos (AI Triage): Análisis guardado para ${analysis.incidentId}. Severidad: ${analysis.severity}`);
        } catch (error) {
            console.error('❌ Error al guardar en tuxtla_ai_triage:', error);
            throw new Error('Error de base de datos al registrar el análisis de IA.');
        }
    }
}

module.exports = MySqlAiRepository;
