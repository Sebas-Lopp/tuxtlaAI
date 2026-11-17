const OpenAI = require('openai');
const Analysis = require('../../domain/entities/Analysis');
require('dotenv').config();

// Fallback determinístico (NO aleatorio): deriva una severidad estable a partir
// del id del incidente para degradar el servicio con gracia cuando la API de
// OpenAI no está disponible, no hay key o la imagen no es accesible.
function deterministicSeverity(incidentId) {
    const input = String(incidentId || '');
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    const options = ['BAJA', 'MEDIA', 'ALTA'];
    return options[hash % options.length];
}

class AnalyzeEvidenceUseCase {
    constructor(aiRepository) {
        this.aiRepository = aiRepository;
    }

    async execute(analysisData) {
        const { incidentId, imageUrl } = analysisData;
        let severity = 'MEDIA';
        let confidence = 0.85;
        let source = 'openai';
        let note = null;

        const apiKey = process.env.OPENAI_API_KEY;

        if (apiKey) {
            try {
                console.log(`🧠 Consultando a OpenAI Vision para el incidente: ${incidentId}...`);

                const openai = new OpenAI({ apiKey });
                const response = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Eres un experto en infraestructura urbana. Analiza la imagen del reporte ciudadano y clasifica la severidad del bache en: "ALTA" (peligroso/profundo), "MEDIA" (moderado) o "BAJA" (pequeño). Responde solo en JSON con las llaves: "severity" y "confidence" (decimal 0-1).'
                        },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Clasifica este bache:' },
                                { type: 'image_url', image_url: { url: imageUrl } }
                            ]
                        }
                    ],
                    response_format: { type: 'json_object' }
                });

                const content = response.choices[0].message.content;
                const result = JSON.parse(content);
                const allowed = ['ALTA', 'MEDIA', 'BAJA'];
                severity = allowed.includes(result.severity) ? result.severity : 'MEDIA';
                confidence = typeof result.confidence === 'number'
                    ? Math.min(Math.max(result.confidence, 0), 1)
                    : 0.90;

                console.log(`✅ Resultado IA: Severidad ${severity} (Confianza: ${confidence})`);
            } catch (error) {
                console.error('⚠️ Error con OpenAI:', error.message);
                severity = deterministicSeverity(incidentId);
                confidence = 0.5;
                source = 'fallback';
                note = `OpenAI no disponible: ${error.message}`;
            }
        } else {
            console.warn('⚠️ OPENAI_API_KEY no configurada. Usando triage determinístico de respaldo.');
            severity = deterministicSeverity(incidentId);
            confidence = 0.5;
            source = 'fallback';
            note = 'OPENAI_API_KEY no configurada';
        }

        const analysis = new Analysis({ incidentId, imageUrl, severity, confidence, source, note });

        if (this.aiRepository) {
            try {
                await this.aiRepository.save(analysis);
            } catch (error) {
                console.error('⚠️ No se pudo persistir el análisis (se devuelve igualmente):', error.message);
            }
        }

        return analysis;
    }
}

module.exports = AnalyzeEvidenceUseCase;
