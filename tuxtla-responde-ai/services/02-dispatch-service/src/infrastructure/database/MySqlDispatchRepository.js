const mysql = require('mysql2/promise');

class MySqlDispatchRepository {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'adminSebas',
            password: process.env.DB_PASSWORD || 'megadethxd',
            database: process.env.DB_NAME || 'tuxtla_dispatch',
            waitForConnections: true,
            connectionLimit: 2,
            maxIdle: 1,
            idleTimeout: 30000,
            charset: 'utf8mb4',
            ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
            dateStrings: true,
        });
    }

    async save(dispatch) {
        const sql = `
            INSERT INTO dispatches (id, incident_id, crew_name, status, assigned_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            dispatch.id,
            dispatch.incidentId,
            dispatch.crewName,
            dispatch.status,
            dispatch.assignedAt,
        ];

        try {
            await this.pool.execute(sql, values);
            console.log(`✅ Base de Datos (Dispatch): Cuadrilla ${dispatch.crewName} asignada al reporte ${dispatch.incidentId}.`);
        } catch (error) {
            console.error("❌ Error al guardar en tuxtla_dispatch:", error);
            throw new Error("Error de base de datos al registrar el despacho.");
        }
    }

    async findAll() {
        const sql = 'SELECT * FROM dispatches ORDER BY assigned_at DESC;';
        try {
            const [rows] = await this.pool.query(sql);
            return rows;
        } catch (error) {
            console.error("❌ Error al consultar despachos:", error);
            throw new Error("Error al listar los despachos.");
        }
    }
}

module.exports = MySqlDispatchRepository;
