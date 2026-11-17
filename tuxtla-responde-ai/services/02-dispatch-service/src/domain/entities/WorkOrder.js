class WorkOrder {
    constructor({ id, incidentId, crewName, status, assignedAt }) {
        this.id = id || `order-${Date.now()}`;
        this.incidentId = incidentId;
        this.crewName = crewName;
        this.status = status || 'ASIGNADA'; // ASIGNADA, EN_PROCESO, RESUELTA
        this.assignedAt = assignedAt || new Date();

        this.validate();
    }

    validate() {
        if (!this.incidentId) throw new Error("La orden de trabajo debe estar asociada a un incidente.");
        if (!this.crewName) throw new Error("Debe asignarse un nombre de cuadrilla.");
    }
}

module.exports = WorkOrder;