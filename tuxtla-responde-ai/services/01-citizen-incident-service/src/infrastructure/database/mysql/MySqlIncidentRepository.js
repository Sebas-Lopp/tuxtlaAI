const mysql = require('mysql2/promise');

class MySqlIncidentRepository {
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

    // CREAR INCIDENTE (nace en moderación PENDIENTE)
    async save(incident) {
        const sql = `
            INSERT INTO incidents (id, type, title, description, status, priority, severity, photo_url, citizen_id, citizen_name, moderation, geom, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(CONCAT('POINT(', ?, ' ', ?, ')'), 4326), ?)
        `;
        const values = [
            incident.id,
            incident.type,
            incident.title,
            incident.description,
            incident.status,
            incident.priority,
            incident.severity,
            incident.photoUrl,
            incident.citizenId,
            incident.citizenName,
            incident.moderation,
            Number(incident.latitude),
            Number(incident.longitude),
            incident.createdAt,
        ];

        try {
            await this.pool.execute(sql, values);
            console.log(`✅ Reporte ${incident.id} guardado (moderación: ${incident.moderation}).`);
        } catch (error) {
            console.error("❌ Error al guardar en tuxtla_responde:", error);
            throw new Error("Error de base de datos al registrar el reporte.");
        }
    }

    // LEER TODOS (por defecto solo aprobados; approvedOnly=false trae todo para el admin)
    async findAll(approvedOnly = true) {
        const where = approvedOnly ? "WHERE moderation = 'APROBADO'" : '';
        const sql = `
            SELECT id, type, title, description, status, priority, severity, photo_url, citizen_id, citizen_name, moderation,
                   ST_X(geom) AS latitude, ST_Y(geom) AS longitude, created_at
            FROM incidents ${where}
            ORDER BY created_at DESC
        `;
        try {
            const [rows] = await this.pool.query(sql);
            return rows;
        } catch (error) {
            console.error("❌ Error al obtener incidentes:", error);
            throw new Error("Error de base de datos al listar los incidentes.");
        }
    }

    // PENDIENTES DE MODERACIÓN (para el admin)
    async findPending() {
        const sql = `
            SELECT id, type, title, description, status, priority, severity, photo_url, citizen_id, citizen_name, moderation,
                   ST_X(geom) AS latitude, ST_Y(geom) AS longitude, created_at
            FROM incidents
            WHERE moderation = 'PENDIENTE'
            ORDER BY created_at ASC
        `;
        try {
            const [rows] = await this.pool.query(sql);
            return rows;
        } catch (error) {
            console.error("❌ Error al obtener incidentes pendientes:", error);
            throw new Error("Error al listar los reportes pendientes de moderación.");
        }
    }

    // LEER POR ID
    async findById(id) {
        const sql = `
            SELECT id, type, title, description, status, priority, severity, photo_url, citizen_id, citizen_name, moderation,
                   ST_X(geom) AS latitude, ST_Y(geom) AS longitude, created_at
            FROM incidents
            WHERE id = ?
        `;
        try {
            const [rows] = await this.pool.query(sql, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error("❌ Error al buscar incidente por ID:", error);
            throw new Error("Error de base de datos al buscar el incidente.");
        }
    }

    // APROBAR / RECHAZAR
    async updateModeration(incidentId, moderation) {
        const sql = `UPDATE incidents SET moderation = ?, updated_at = NOW() WHERE id = ?`;
        try {
            const [result] = await this.pool.execute(sql, [moderation, incidentId]);
            if (result.affectedRows === 0) return null;
            console.log(`✅ Moderación: ${incidentId} -> ${moderation}.`);
            return { id: incidentId, moderation };
        } catch (error) {
            console.error("❌ Error al actualizar moderación:", error);
            throw new Error("Error de base de datos al moderar el incidente.");
        }
    }

    async updateStatus(incidentId, newStatus) {
        const sql = `UPDATE incidents SET status = ?, updated_at = NOW() WHERE id = ?`;
        try {
            const [result] = await this.pool.execute(sql, [newStatus, incidentId]);
            if (result.affectedRows === 0) return null;
            return { id: incidentId, status: newStatus };
        } catch (error) {
            console.error("❌ Error al actualizar estatus:", error);
            throw new Error("Error de base de datos al actualizar el incidente.");
        }
    }

    async updatePhoto(incidentId, photoUrl) {
        const sql = `UPDATE incidents SET photo_url = ?, updated_at = NOW() WHERE id = ?`;
        try {
            const [result] = await this.pool.execute(sql, [photoUrl, incidentId]);
            if (result.affectedRows === 0) return null;
            return { id: incidentId, photoUrl };
        } catch (error) {
            console.error("❌ Error al asociar fotografía:", error);
            throw new Error("Error de base de datos al asociar la fotografía.");
        }
    }

    async updateSeverity(incidentId, severity) {
        const sql = `UPDATE incidents SET severity = ?, priority = ?, updated_at = NOW() WHERE id = ?`;
        try {
            const [result] = await this.pool.execute(sql, [severity, severity, incidentId]);
            if (result.affectedRows === 0) return null;
            return { id: incidentId, severity };
        } catch (error) {
            console.error("❌ Error al actualizar severidad:", error);
            throw new Error("Error de base de datos al actualizar la severidad.");
        }
    }
}

module.exports = MySqlIncidentRepository;
