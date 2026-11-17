class Dispatch {
    constructor({ id, incidentId, crewName, status, assignedAt }) {
        this.id = id || require('crypto').randomUUID();
        this.incidentId = incidentId;
        this.crewName = crewName; // Ej. "Cuadrilla Norte - Bacheo"
        this.status = status || 'ASIGNADA'; // ASIGNADA, EN_CAMINO, COMPLETADA
        this.assignedAt = assignedAt || new Date();
    }
}

module.exports = Dispatch;