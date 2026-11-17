class GetNotificationsUseCase {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    async execute() {
        return await this.notificationRepository.findAll();
    }
}

module.exports = GetNotificationsUseCase;