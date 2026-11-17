const SendNotificationUseCase = require('../../../application/use-cases/SendNotificationUseCase');
const GetNotificationsUseCase = require('../../../application/use-cases/GetNotificationsUseCase');

class NotificationController {
    constructor(notificationRepository) {
        this.sendNotificationUseCase = new SendNotificationUseCase(notificationRepository);
        this.getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
    }

    async send(req, res) {
        try {
            const notification = await this.sendNotificationUseCase.execute(req.body);
            res.status(201).json({
                message: "Notificación procesada y registrada exitosamente",
                data: notification
            });
        } catch (error) {
            res.status(400).json({
                error: "No se pudo procesar la notificación",
                details: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const notifications = await this.getNotificationsUseCase.execute();
            res.status(200).json({
                message: "Notificaciones obtenidas exitosamente",
                total: notifications.length,
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                error: "No se pudieron obtener las notificaciones",
                details: error.message
            });
        }
    }
}

module.exports = NotificationController;