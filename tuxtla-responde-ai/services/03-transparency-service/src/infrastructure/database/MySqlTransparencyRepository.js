const mysql = require('mysql2/promise');

class MySqlTransparencyRepository {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'adminSebas',
            password: process.env.DB_PASSWORD || 'megadethxd',
            database: process.env.DB_NAME || 'tuxtla_transparency',
            waitForConnections: true,
            connectionLimit: 2,
            maxIdle: 1,
            idleTimeout: 30000,
            charset: 'utf8mb4',
            ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
            dateStrings: true,
        });
    }

    // Estadísticas en tiempo real calculadas desde la fuente de verdad (incidents).
    async getMetrics() {
        const aggregateSql = `
            SELECT
                COUNT(*) AS total_reports,
                COALESCE(SUM(status = 'PENDIENTE'), 0)  AS pending_reports,
                COALESCE(SUM(status = 'EN_PROCESO'), 0) AS in_progress_reports,
                COALESCE(SUM(status = 'RESUELTO'), 0)   AS resolved_reports,
                COALESCE(SUM(severity = 'ALTA'), 0)     AS alta,
                COALESCE(SUM(severity = 'MEDIA'), 0)    AS media,
                COALESCE(SUM(severity = 'BAJA'), 0)     AS baja
            FROM tuxtla_responde.incidents
            WHERE moderation = 'APROBADO'
        `;
        const byTypeSql = `
            SELECT type, COUNT(*) AS total
            FROM tuxtla_responde.incidents
            WHERE moderation = 'APROBADO'
            GROUP BY type
            ORDER BY total DESC
        `;

        try {
            const [[agg]] = await this.pool.query(aggregateSql);
            const [byType] = await this.pool.query(byTypeSql);

            const total = Number(agg.total_reports || 0);
            const resolved = Number(agg.resolved_reports || 0);

            return {
                total_reports: total,
                pending_reports: Number(agg.pending_reports || 0),
                in_progress_reports: Number(agg.in_progress_reports || 0),
                resolved_reports: resolved,
                resolved_rate: total > 0 ? Number(((resolved / total) * 100).toFixed(1)) : 0,
                by_severity: {
                    ALTA: Number(agg.alta || 0),
                    MEDIA: Number(agg.media || 0),
                    BAJA: Number(agg.baja || 0),
                },
                by_type: byType.map(r => ({ type: r.type, total: Number(r.total) })),
            };
        } catch (error) {
            console.error("❌ Error al obtener métricas de transparencia:", error);
            return {
                total_reports: 0, pending_reports: 0, in_progress_reports: 0, resolved_reports: 0,
                resolved_rate: 0, by_severity: { ALTA: 0, MEDIA: 0, BAJA: 0 }, by_type: [],
            };
        }
    }

    // Bitácora de indicadores (tabla transparency_logs)
    async logMetric(metric) {
        const sql = `
            INSERT INTO transparency_logs (id, indicator_name, value, category, status, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            metric.id,
            metric.indicatorName,
            metric.value,
            metric.category,
            metric.status || null,
            metric.recordedAt,
        ];
        try {
            await this.pool.execute(sql, values);
            return metric;
        } catch (error) {
            console.error("❌ Error al registrar métrica:", error);
            throw new Error("Error de base de datos al registrar la métrica.");
        }
    }
}

module.exports = MySqlTransparencyRepository;
