class GetIncidentByIdUseCase {
    constructor(incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    async execute(id) {
        const incident = await this.incidentRepository.findById(id);
        if (!incident) {
            throw new Error(`No se encontró el incidente con ID: ${id}`);
        }
        return incident;
    }
}

module.exports = GetIncidentByIdUseCase;