class GetStatsUseCase {
    constructor(transparencyRepository) {
        this.transparencyRepository = transparencyRepository;
    }

    async execute() {
        return await this.transparencyRepository.getMetrics();
    }
}

module.exports = GetStatsUseCase;