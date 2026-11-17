const OpenAI = require('openai');
require('dotenv').config();

class ChatbotUseCase {
    constructor(aiRepository) {
        this.aiRepository = aiRepository;
    }

    async execute({ message }) {
        const incidents = await this.aiRepository.getApprovedIncidents();
        const totalReports = incidents.length;

        const context = incidents.slice(0, 60).map((i) =>
            `- "${i.title || 'Sin título'}" (${i.type}, severidad ${i.severity}, estado ${i.status}, reportado el ${i.created_at})`
        ).join('\n') || 'Aún no hay reportes públicos.';

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return { reply: this.fallbackSummary(incidents), totalReports, source: 'fallback' };
        }

        try {
            const openai = new OpenAI({ apiKey });
            const response = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Eres "TuxtlaResponde AI", el asistente ciudadano de Tuxtla Gutiérrez. Responde SIEMPRE en español, de forma breve, clara y empática. Resume la situación urbana a partir de los reportes que se te dan. Usa viñetas y emojis cuando ayude. Si piden algo ajeno a los reportes de la ciudad, contesta con amabilidad que tu rol es resumir la situación urbana.'
                    },
                    {
                        role: 'system',
                        content: `REPORTES ACTUALES (aprobados):\n${context}`
                    },
                    {
                        role: 'user',
                        content: message || 'Resume qué está pasando en la ciudad.'
                    }
                ],
                temperature: 0.6,
            });

            return {
                reply: response.choices[0].message.content,
                totalReports,
                source: 'openai',
            };
        } catch (error) {
            console.error('⚠️ Error en chatbot OpenAI:', error.message);
            return { reply: this.fallbackSummary(incidents), totalReports, source: 'fallback', note: error.message };
        }
    }

    // Resumen determinístico si OpenAI no está disponible
    fallbackSummary(incidents) {
        if (!incidents.length) return 'Aún no hay reportes públicos en la ciudad. 🌆';
        const bySeverity = { ALTA: 0, MEDIA: 0, BAJA: 0 };
        const byStatus = { PENDIENTE: 0, EN_PROCESO: 0, RESUELTO: 0 };
        incidents.forEach((i) => {
            if (bySeverity[i.severity] !== undefined) bySeverity[i.severity]++;
            if (byStatus[i.status] !== undefined) byStatus[i.status]++;
        });
        return [
            `📊 Actualmente hay ${incidents.length} reportes públicos en Tuxtla Gutiérrez:`,
            `🔴 Alta severidad: ${bySeverity.ALTA} · 🟡 Media: ${bySeverity.MEDIA} · 🟢 Baja: ${bySeverity.BAJA}`,
            `⏳ Pendientes: ${byStatus.PENDIENTE} · 🛠️ En proceso: ${byStatus.EN_PROCESO} · ✅ Resueltos: ${byStatus.RESUELTO}`,
        ].join('\n');
    }
}

module.exports = ChatbotUseCase;
