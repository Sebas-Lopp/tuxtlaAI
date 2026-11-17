const CreateIncidentUseCase = require('../../../application/use-cases/CreateIncidentUseCase');
const GetAllIncidentsUseCase = require('../../../application/use-cases/GetAllIncidentsUseCase');
const GetIncidentByIdUseCase = require('../../../application/use-cases/GetIncidentByIdUseCase');
const { publish } = require('../../messaging/RabbitPublisher');

class IncidentController {
    constructor(incidentRepository, commentRepository) {
        this.incidentRepository = incidentRepository;
        this.commentRepository = commentRepository;
        this.createIncidentUseCase = new CreateIncidentUseCase(incidentRepository);
        this.getAllIncidentsUseCase = new GetAllIncidentsUseCase(incidentRepository);
        this.getIncidentByIdUseCase = new GetIncidentByIdUseCase(incidentRepository);
    }

    // Crear reporte (requiere sesión) -> nace en moderación PENDIENTE
    async create(req, res) {
        try {
            const incident = await this.createIncidentUseCase.execute({
                ...req.body,
                citizenId: req.user.id,
                citizenName: req.user.name,
                moderation: 'PENDIENTE',
            });
            res.status(201).json({ message: "Reporte enviado. Quedó pendiente de aprobación.", data: incident });
            publish({ type: 'incident.created', incidentId: incident.id, title: incident.title, citizenId: incident.citizenId });
        } catch (error) {
            res.status(400).json({ error: "No se pudo registrar el reporte", details: error.message });
        }
    }

    // Feed público (aprobados). El admin con ?all=1 ve todo.
    async getAll(req, res) {
        try {
            const isAdmin = req.user && req.user.role === 'ADMIN';
            const all = req.query.all === '1' || req.query.all === 'true';
            const approvedOnly = !(isAdmin && all);
            const incidents = await this.getAllIncidentsUseCase.execute(approvedOnly);
            res.status(200).json({ message: "Reportes obtenidos", total: incidents.length, data: incidents });
        } catch (error) {
            res.status(500).json({ error: "No se pudieron obtener los reportes", details: error.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const incident = await this.getIncidentByIdUseCase.execute(id);
            res.status(200).json({ message: "Reporte encontrado", data: incident });
        } catch (error) {
            res.status(404).json({ error: "Reporte no encontrado", details: error.message });
        }
    }

    // Panel admin: pendientes de moderación
    async getPending(req, res) {
        try {
            const incidents = await this.incidentRepository.findPending();
            res.status(200).json({ message: "Reportes pendientes de moderación", total: incidents.length, data: incidents });
        } catch (error) {
            res.status(500).json({ error: "No se pudieron obtener los pendientes", details: error.message });
        }
    }

    // Aprobar / rechazar (admin)
    async updateModeration(req, res) {
        try {
            const { id } = req.params;
            const { moderation } = req.body;
            if (!['APROBADO', 'RECHAZADO'].includes(moderation)) {
                return res.status(400).json({ error: "moderation debe ser 'APROBADO' o 'RECHAZADO'." });
            }
            const updated = await this.incidentRepository.updateModeration(id, moderation);
            if (!updated) return res.status(404).json({ error: "Reporte no encontrado" });
            const inc = await this.incidentRepository.findById(id).catch(() => null);
            publish({
                type: `incident.${moderation.toLowerCase()}`,
                incidentId: id,
                title: inc ? inc.title : null,
                citizenId: inc ? inc.citizen_id : null,
            });
            res.status(200).json({ message: "Moderación actualizada", data: updated });
        } catch (error) {
            res.status(500).json({ error: "No se pudo moderar el reporte", details: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await this.incidentRepository.updateStatus(id, status);
            if (!updated) return res.status(404).json({ error: "Reporte no encontrado" });
            res.status(200).json({ message: "Estatus actualizado", data: updated });
        } catch (error) {
            res.status(500).json({ error: "No se pudo actualizar el estatus", details: error.message });
        }
    }

    async updatePhoto(req, res) {
        try {
            const { id } = req.params;
            const { photoUrl } = req.body;
            const updated = await this.incidentRepository.updatePhoto(id, photoUrl);
            if (!updated) return res.status(404).json({ error: "Reporte no encontrado" });
            res.status(200).json({ message: "Fotografía asociada", data: updated });
        } catch (error) {
            res.status(500).json({ error: "No se pudo asociar la fotografía", details: error.message });
        }
    }

    async updateSeverity(req, res) {
        try {
            const { id } = req.params;
            const { severity } = req.body;
            const updated = await this.incidentRepository.updateSeverity(id, severity);
            if (!updated) return res.status(404).json({ error: "Reporte no encontrado" });
            res.status(200).json({ message: "Severidad actualizada", data: updated });
        } catch (error) {
            res.status(500).json({ error: "No se pudo actualizar la severidad", details: error.message });
        }
    }
}

module.exports = IncidentController;
