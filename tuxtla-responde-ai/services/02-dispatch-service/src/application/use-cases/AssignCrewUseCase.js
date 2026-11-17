const Dispatch = require('../../domain/entities/Dispatch');

class AssignCrewUseCase {
    constructor(dispatchRepository) {
        this.dispatchRepository = dispatchRepository;
    }

    async execute(dispatchData) {
        const newDispatch = new Dispatch(dispatchData);
        await this.dispatchRepository.save(newDispatch);
        return newDispatch;
    }
}

module.exports = AssignCrewUseCase;