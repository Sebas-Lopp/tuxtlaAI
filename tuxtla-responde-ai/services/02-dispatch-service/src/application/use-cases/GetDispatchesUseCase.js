class GetDispatchesUseCase {
    constructor(dispatchRepository) {
        this.dispatchRepository = dispatchRepository;
    }

    async execute() {
        return await this.dispatchRepository.findAll();
    }
}

module.exports = GetDispatchesUseCase;