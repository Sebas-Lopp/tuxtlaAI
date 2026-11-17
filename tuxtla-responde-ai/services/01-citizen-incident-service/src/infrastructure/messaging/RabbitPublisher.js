const amqp = require('amqplib');

const QUEUE = 'incident_events';
let channel = null;

async function connect() {
    const url = process.env.RABBITMQ_URL;
    if (!url) {
        console.warn('⚠️ RABBITMQ_URL no configurada; eventos deshabilitados.');
        return;
    }
    try {
        const conn = await amqp.connect(url);
        conn.on('error', (e) => console.error('RabbitMQ error:', e.message));
        conn.on('close', () => { channel = null; setTimeout(connect, 5000); });
        channel = await conn.createChannel();
        await channel.assertQueue(QUEUE, { durable: true });
        console.log('🐰 RabbitMQ conectado (publisher de incidencias)');
    } catch (err) {
        console.error('❌ RabbitMQ no disponible:', err.message, '— reintento en 5s');
        setTimeout(connect, 5000);
    }
}

function publish(event) {
    if (!channel) {
        console.warn('RabbitMQ sin canal; evento omitido:', event.type);
        return;
    }
    try {
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(event)), { persistent: true });
        console.log(`📤 Evento publicado: ${event.type} (${event.incidentId})`);
    } catch (err) {
        console.error('Error publicando evento:', err.message);
    }
}

connect();

module.exports = { publish };
