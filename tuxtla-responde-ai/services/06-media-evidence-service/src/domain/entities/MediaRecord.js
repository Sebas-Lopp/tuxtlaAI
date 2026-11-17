class MediaRecord {
    constructor({ id, incidentId, fileUrl, fileType, uploadedAt }) {
        this.id = id || `media-${Date.now()}`;
        this.incidentId = incidentId;
        this.fileUrl = fileUrl || 'PENDIENTE_DE_SUBIR_A_NUBE'; 
        this.fileType = fileType || 'image/jpeg';
        this.uploadedAt = uploadedAt || new Date();

        this.validate();
    }

    validate() {
        if (!this.incidentId) throw new Error("La evidencia debe estar asociada a un reporte (incidentId).");
    }
}

module.exports = MediaRecord;