class GetAllIncidentsUseCase {
    constructor(incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    async execute(approvedOnly = true) {
        return await this.incidentRepository.findAll(approvedOnly);
    }
}

module.exports = GetAllIncidentsUseCase;
