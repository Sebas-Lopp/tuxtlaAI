const WorkOrder = require('../../domain/entities/WorkOrder');

class AssignWorkOrderUseCase {
    constructor(dispatchRepository) {
        this.dispatchRepository = dispatchRepository;
    }

    async execute(orderData) {
        // 1. Creamos y validamos la entidad de dominio
        const workOrder = new WorkOrder(orderData);

        // 2. Persistimos a través del puerto/repositorio
        await this.dispatchRepository.save(workOrder);

        return workOrder;
    }
}

module.exports = AssignWorkOrderUseCase;