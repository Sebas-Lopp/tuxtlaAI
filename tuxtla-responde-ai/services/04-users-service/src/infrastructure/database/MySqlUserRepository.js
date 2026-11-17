const mysql = require('mysql2/promise');

class MySqlUserRepository {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'adminSebas',
            password: process.env.DB_PASSWORD || 'megadethxd',
            database: process.env.DB_NAME || 'tuxtla_users',
            waitForConnections: true,
            connectionLimit: 2,
            maxIdle: 1,
            idleTimeout: 30000,
            charset: 'utf8mb4',
            ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
            dateStrings: true,
        });
    }

    async save(user) {
        const sql = `
            INSERT INTO users (id, name, email, role, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [user.id, user.name, user.email, user.role, user.password, user.createdAt];

        try {
            await this.pool.execute(sql, values);
            console.log(`✅ Base de Datos (Users): Usuario ${user.email} registrado.`);
        } catch (error) {
            console.error("❌ Error al guardar en tuxtla_users:", error);
            throw new Error("Error de base de datos al registrar el usuario.");
        }
    }

    async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1;';
        try {
            const [rows] = await this.pool.query(sql, [email]);
            return rows[0] || null;
        } catch (error) {
            console.error("❌ Error al buscar usuario por email:", error);
            throw new Error("Error de base de datos al buscar el usuario.");
        }
    }

    async findAll() {
        const sql = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC;';
        try {
            const [rows] = await this.pool.query(sql);
            return rows;
        } catch (error) {
            console.error("❌ Error al consultar usuarios:", error);
            throw new Error("Error al listar los usuarios.");
        }
    }
}

module.exports = MySqlUserRepository;
