const mysql = require('mysql2/promise');

class MySqlNotificationRepository {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'adminSebas',
            password: process.env.DB_PASSWORD || 'megadethxd',
            database: process.env.DB_NAME || 'tuxtla_notifications',
            waitForConnections: true,
            connectionLimit: 2,
            maxIdle: 1,
            idleTimeout: 30000,
            charset: 'utf8mb4',
            ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
            dateStrings: true,
        });
    }

    async save(notification) {
        const sql = `
            INSERT INTO notifications (id, recipient_id, message, type, sent_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            notification.id,
            notification.recipientId,
            notification.message,
            notification.type,
            notification.sentAt,
        ];

        try {
            await this.pool.execute(sql, values);
            console.log(`✅ Base de Datos (Notifications): Notificación enviada al destinatario ${notification.recipientId}.`);
        } catch (error) {
            console.error("❌ Error al guardar en tuxtla_notifications:", error);
            throw new Error("Error de base de datos al registrar la notificación.");
        }
    }

    async findAll() {
        const sql = 'SELECT * FROM notifications ORDER BY sent_at DESC;';
        try {
            const [rows] = await this.pool.query(sql);
            return rows;
        } catch (error) {
            console.error("❌ Error al consultar notificaciones:", error);
            throw new Error("Error al listar las notificaciones.");
        }
    }
}

module.exports = MySqlNotificationRepository;
