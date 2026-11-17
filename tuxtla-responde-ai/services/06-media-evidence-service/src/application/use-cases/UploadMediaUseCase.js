const Media = require('../../domain/entities/Media');

class UploadMediaUseCase {
    constructor(mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    async execute(mediaData) {
        const media = new Media(mediaData);
        await this.mediaRepository.save(media);
        return media;
    }
}

module.exports = UploadMediaUseCase;