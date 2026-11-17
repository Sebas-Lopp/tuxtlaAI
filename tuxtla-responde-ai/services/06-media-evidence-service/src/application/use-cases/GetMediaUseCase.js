class GetMediaUseCase {
    constructor(mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    async execute() {
        return await this.mediaRepository.findAll();
    }
}

module.exports = GetMediaUseCase;