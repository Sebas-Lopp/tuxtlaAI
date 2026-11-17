const amqp = require('amqplib');
const crypto = require('crypto');

const QUEUE = 'incident_events';

async function start(notificationRepository) {
    const url = process.env.RABBITMQ_URL;
    if (!url) {
        console.warn('⚠️ RABBITMQ_URL no configurada; consumer deshabilitado.');
        return;
    }
    try {
        const conn = await amqp.connect(url);
        conn.on('error', (e) => console.error('RabbitMQ error:', e.message));
        conn.on('close', () => setTimeout(() => start(notificationRepository), 5000));

        const ch = await conn.createChannel();
        await ch.assertQueue(QUEUE, { durable: true });
        console.log('🐰 RabbitMQ consumiendo incident_events');

        ch.consume(QUEUE, async (msg) => {
            if (!msg) return;
            try {
                const evt = JSON.parse(msg.content.toString());
                const map = {
                    'incident.created': `Nuevo reporte: "${evt.title}" (pendiente de aprobación)`,
                    'incident.aprobado': `Tu reporte "${evt.title}" fue APROBADO ✅`,
                    'incident.rechazado': `Tu reporte "${evt.title}" fue RECHAZADO ❌`,
                };
                const message = map[evt.type] || `Evento ${evt.type} del reporte ${evt.incidentId}`;

                await notificationRepository.save({
                    id: crypto.randomUUID(),
                    recipientId: evt.citizenId || 'ciudadano',
                    message,
                    type: 'PUSH',
                    sentAt: new Date(),
                });

                console.log(`🔔 Notificación creada desde ${evt.type}: ${message}`);
                ch.ack(msg);
            } catch (err) {
                console.error('Error procesando evento:', err.message);
                ch.nack(msg, false, false);
            }
        });
    } catch (err) {
        console.error('❌ RabbitMQ consumer no disponible:', err.message, '— reintento en 5s');
        setTimeout(() => start(notificationRepository), 5000);
    }
}

module.exports = { start };
