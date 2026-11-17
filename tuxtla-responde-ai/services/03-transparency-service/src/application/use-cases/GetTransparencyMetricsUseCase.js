class GetTransparencyMetricsUseCase {
    constructor(transparencyRepository) {
        this.transparencyRepository = transparencyRepository;
    }

    async execute() {
        // Retorna las métricas y estadísticas públicas para los ciudadanos
        return await this.transparencyRepository.findAll();
    }
}

module.exports = GetTransparencyMetricsUseCase;