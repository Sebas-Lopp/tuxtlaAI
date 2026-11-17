const AnalyzeEvidenceUseCase = require('../../../application/use-cases/AnalyzeEvidenceUseCase');
const ChatbotUseCase = require('../../../application/use-cases/ChatbotUseCase');

class AiController {
    constructor(aiRepository) {
        this.analyzeEvidenceUseCase = new AnalyzeEvidenceUseCase(aiRepository);
        this.chatbotUseCase = new ChatbotUseCase(aiRepository);
    }

    async analyze(req, res) {
        try {
            const { incidentId, imageUrl } = req.body;
            if (!incidentId || !imageUrl) {
                return res.status(400).json({ error: 'incidentId e imageUrl son requeridos' });
            }
            const result = await this.analyzeEvidenceUseCase.execute({ incidentId, imageUrl });
            return res.status(200).json({ message: 'Análisis de evidencia completado', data: result });
        } catch (error) {
            console.error('Error en el controlador de IA:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    async chat(req, res) {
        try {
            const { message } = req.body;
            const result = await this.chatbotUseCase.execute({ message });
            return res.status(200).json({ message: 'Respuesta del chatbot', data: result });
        } catch (error) {
            console.error('Error en el chatbot:', error);
            return res.status(500).json({ error: 'Error del chatbot', details: error.message });
        }
    }
}

module.exports = AiController;
