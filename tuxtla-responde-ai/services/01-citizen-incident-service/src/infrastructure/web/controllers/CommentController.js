const crypto = require('crypto');

class CommentController {
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
    }

    async getByIncident(req, res) {
        try {
            const { id } = req.params;
            const comments = await this.commentRepository.findByIncident(id);
            res.status(200).json({ message: "Comentarios obtenidos", total: comments.length, data: comments });
        } catch (error) {
            res.status(500).json({ error: "No se pudieron obtener los comentarios", details: error.message });
        }
    }

    async create(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            if (!content || !String(content).trim()) {
                return res.status(400).json({ error: "El comentario no puede estar vacío." });
            }

            const comment = await this.commentRepository.save({
                id: crypto.randomUUID(),
                incidentId: id,
                userId: req.user.id,
                userName: req.user.name || 'Ciudadano',
                content: String(content).trim(),
                createdAt: new Date(),
            });

            res.status(201).json({ message: "Comentario publicado", data: comment });
        } catch (error) {
            res.status(400).json({ error: "No se pudo publicar el comentario", details: error.message });
        }
    }
}

module.exports = CommentController;
