class Media {
    constructor({ id, incidentId, fileUrl, fileType, uploadedAt }) {
        this.id = id || require('crypto').randomUUID();
        this.incidentId = incidentId;
        this.fileUrl = fileUrl;
        this.fileType = fileType || 'image/jpeg';
        this.uploadedAt = uploadedAt || new Date();
    }
}

module.exports = Media;
