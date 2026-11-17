const AssignCrewUseCase = require('../../../application/use-cases/AssignCrewUseCase');
const GetDispatchesUseCase = require('../../../application/use-cases/GetDispatchesUseCase');

class DispatchController {
    constructor(dispatchRepository) {
        this.assignCrewUseCase = new AssignCrewUseCase(dispatchRepository);
        this.getDispatchesUseCase = new GetDispatchesUseCase(dispatchRepository);
    }

    async assign(req, res) {
        try {
            const dispatch = await this.assignCrewUseCase.execute(req.body);
            res.status(201).json({
                message: "Cuadrilla asignada exitosamente",
                data: dispatch
            });
        } catch (error) {
            res.status(400).json({
                error: "No se pudo asignar la cuadrilla",
                details: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const dispatches = await this.getDispatchesUseCase.execute();
            res.status(200).json({
                message: "Despachos obtenidos exitosamente",
                total: dispatches.length,
                data: dispatches
            });
        } catch (error) {
            res.status(500).json({
                error: "No se pudieron obtener los despachos",
                details: error.message
            });
        }
    }
}

module.exports = DispatchController;