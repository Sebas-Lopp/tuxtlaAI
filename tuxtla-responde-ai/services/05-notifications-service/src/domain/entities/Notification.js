class Notification {
    constructor({ id, recipientId, message, type, sentAt }) {
        this.id = id || require('crypto').randomUUID();
        this.recipientId = recipientId;
        this.message = message;
        this.type = type || 'PUSH'; // PUSH, EMAIL, TELEGRAM
        this.sentAt = sentAt || new Date();
    }
}

module.exports = Notification;