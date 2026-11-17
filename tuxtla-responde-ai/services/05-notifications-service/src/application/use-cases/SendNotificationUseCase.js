const Notification = require('../../domain/entities/Notification');

class SendNotificationUseCase {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    async execute(notificationData) {
        const notification = new Notification(notificationData);
        await this.notificationRepository.save(notification);
        return notification;
    }
}

module.exports = SendNotificationUseCase;