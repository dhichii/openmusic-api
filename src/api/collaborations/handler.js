const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(
      collaborationsService, playlistsService, usersService, validator,
  ) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const {playlistId, userId} = request.payload;
    const {id} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, id);
    await this._usersService.getUserById(userId);
    const collaborationId = await this._collaborationsService
        .addCollaboration(request.payload);

    return h.response({
      status: 'success',
      data: {collaborationId},
    }).code(201);
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);

    const {playlistId: id} = request.payload;
    const {id: userId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, userId);
    await this._collaborationsService.deleteCollaboration(request.payload);

    return {
      status: 'success',
      message: 'Collaborator berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
