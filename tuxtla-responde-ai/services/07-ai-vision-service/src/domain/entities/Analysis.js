class Analysis {
    constructor({ id, incidentId, imageUrl, severity, confidence, analyzedAt, source, note }) {
        this.id = id || require('crypto').randomUUID();
        this.incidentId = incidentId;
        this.imageUrl = imageUrl;
        this.severity = severity || 'MEDIA'; // ALTA, MEDIA, BAJA
        this.confidence = confidence || 0.0;
        this.analyzedAt = analyzedAt || new Date();
        this.source = source || 'openai'; // 'openai' | 'fallback'
        this.note = note || null;
    }
}

module.exports = Analysis;
