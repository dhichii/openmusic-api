const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(
      producerService, playlistsService, validator,
  ) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const {id: playlistId} = request.params;
    const userId = request.auth.credentials.id;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    await this._producerService
        .sendMessage('export:playlist', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    }).code(201);
  }
}

module.exports = ExportsHandler;
