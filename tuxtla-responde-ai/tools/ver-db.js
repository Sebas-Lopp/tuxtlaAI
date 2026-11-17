// Ver la base de datos de Aiven (MySQL en la nube) desde la terminal.
// Uso:  node tools/ver-db.js
const mysql = require('mysql2/promise');

const CFG = {
    host: 'mysql-1c4c8319-kh03768-251b.h.aivencloud.com',
    port: 18522,
    user: 'avnadmin',
    password: 'process.env.DB_PASSWORD',
    ssl: { rejectUnauthorized: false },
    charset: 'utf8mb4',
};

const DBS = [
    'tuxtla_responde',
    'tuxtla_dispatch',
    'tuxtla_transparency',
    'tuxtla_users',
    'tuxtla_notifications',
    'tuxtla_media',
    'tuxtla_ai_triage',
];

(async () => {
    const conn = await mysql.createConnection(CFG);

    console.log('\n=== TABLAS Y REGISTROS POR BASE DE DATOS ===');
    for (const db of DBS) {
        const [tables] = await conn.query('SHOW TABLES FROM `' + db + '`');
        const names = tables.map((t) => Object.values(t)[0]);
        const counts = [];
        for (const t of names) {
            const [[c]] = await conn.query('SELECT COUNT(*) c FROM `' + db + '`.`' + t + '`');
            counts.push(`${t}=${c.c}`);
        }
        console.log(`\n📦 ${db}\n   ${counts.join('  |  ') || '(vacía)'}`);
    }

    const [inc] = await conn.query(
        'SELECT id, type, title, status, moderation, severity, created_at FROM tuxtla_responde.incidents ORDER BY created_at DESC LIMIT 10'
    );
    console.log('\n=== ÚLTIMOS REPORTES (tuxtla_responde.incidents) ===');
    console.table(inc);

    const [users] = await conn.query('SELECT id, name, email, role FROM tuxtla_users.users');
    console.log('\n=== USUARIOS (tuxtla_users.users) ===');
    console.table(users);

    try {
        const [notif] = await conn.query('SELECT * FROM tuxtla_notifications.notifications ORDER BY created_at DESC LIMIT 5');
        console.log('\n=== NOTIFICACIONES (tuxtla_notifications.notifications) ===');
        console.table(notif);
    } catch (e) {
        console.log('\n(no se pudieron leer notificaciones:', e.message, ')');
    }

    await conn.end();
})().catch((e) => {
    console.log('❌ Error:', e.message);
    process.exit(1);
});
