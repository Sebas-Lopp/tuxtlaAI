class TriageResult {
    constructor({ id, incidentId, severity, confidence, analyzedAt }) {
        this.id = id || `triage-${Date.now()}`;
        this.incidentId = incidentId;
        this.severity = severity || 'PENDIENTE'; // ALTA, MEDIA, BAJA
        this.confidence = confidence || 0.0;
        this.analyzedAt = analyzedAt || new Date();

        this.validate();
    }

    validate() {
        if (!this.incidentId) throw new Error("El análisis debe estar asociado a un incidente (incidentId).");
    }
}

module.exports = TriageResult;