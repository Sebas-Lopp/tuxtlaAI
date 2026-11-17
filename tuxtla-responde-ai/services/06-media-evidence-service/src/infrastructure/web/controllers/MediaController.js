const UploadMediaUseCase = require('../../../application/use-cases/UploadMediaUseCase');
const GetMediaUseCase = require('../../../application/use-cases/GetMediaUseCase');

class MediaController {
    constructor(mediaRepository) {
        this.uploadMediaUseCase = new UploadMediaUseCase(mediaRepository);
        this.getMediaUseCase = new GetMediaUseCase(mediaRepository);
    }

    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No se ha proporcionado ninguna imagen." });
            }

            const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? '';
            const fileUrl = `${publicBaseUrl}/uploads/${req.file.filename}`;
            const incidentId = req.body.incidentId || 'general';

            const media = await this.uploadMediaUseCase.execute({
                incidentId,
                fileUrl,
                fileType: req.file.mimetype || 'image/jpeg',
            });

            res.status(201).json({
                message: "Evidencia guardada localmente con éxito",
                data: media
            });
        } catch (error) {
            res.status(400).json({
                error: "No se pudo subir la evidencia",
                details: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const mediaList = await this.getMediaUseCase.execute();
            res.status(200).json({
                message: "Evidencias obtenidas exitosamente",
                total: mediaList.length,
                data: mediaList
            });
        } catch (error) {
            res.status(500).json({
                error: "No se pudieron obtener las evidencias",
                details: error.message
            });
        }
    }
}

module.exports = MediaController;
