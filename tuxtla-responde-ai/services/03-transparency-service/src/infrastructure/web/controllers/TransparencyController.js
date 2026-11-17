const GetStatsUseCase = require('../../../application/use-cases/GetStatsUseCase');

class TransparencyController {
    constructor(transparencyRepository) {
        this.transparencyRepository = transparencyRepository;
        this.getStatsUseCase = new GetStatsUseCase(transparencyRepository);
    }

    async getStats(req, res) {
        try {
            const stats = await this.getStatsUseCase.execute();
            res.status(200).json({
                message: "Estadísticas de transparencia obtenidas exitosamente",
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                error: "No se pudieron calcular las estadísticas",
                details: error.message
            });
        }
    }

    async log(req, res) {
        try {
            const { indicatorName, value, category, status } = req.body;
            if (!indicatorName || value === undefined) {
                return res.status(400).json({ error: "indicatorName y value son requeridos" });
            }
            const metric = {
                id: `metric-${Date.now()}`,
                indicatorName,
                value: Number(value),
                category: category || 'GENERAL',
                status: status || null,
                recordedAt: new Date(),
            };
            await this.transparencyRepository.logMetric(metric);
            res.status(201).json({ message: "Métrica registrada", data: metric });
        } catch (error) {
            res.status(400).json({ error: "No se pudo registrar la métrica", details: error.message });
        }
    }
}

module.exports = TransparencyController;
