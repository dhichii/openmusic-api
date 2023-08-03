const autoBind = require('auto-bind');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsHandler {
  constructor(albumsService, songsService, userAlbumLikesService, validator) {
    this._albumsService = albumsService;
    this._songsService = songsService;
    this._userAlbumLikesService = userAlbumLikesService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._albumsService.addAlbum(request.payload);
    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    }).code(201);

    return response;
  }

  async getAlbumByIdHandler(request) {
    const {id} = request.params;

    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._songsService.getSongsByAlbumId(id);
    album.songs = songs;

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const {id} = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const {id} = request.params;

    await this._albumsService.deleteAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postUserAlbumLikeHandler(request, h) {
    const {id: albumId} = request.params;
    const {id: userId} = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);

    try {
      await this._userAlbumLikesService.verifyUserAlbumLike(userId, albumId);
    } catch (e) {
      if (e instanceof InvariantError) {
        throw e;
      }

      try {
        await this._userAlbumLikesService.addUserAlbumLike(userId, albumId);

        return h.response({
          status: 'success',
          message: 'Like berhasil ditambahkan',
        }).code(201);
      } catch (e) {
        throw e;
      }
    }
  }

  async getUserAlbumLikesByAlbumIdHandler(request, h) {
    const {id: albumId} = request.params;

    const {likes, from} = await this._userAlbumLikesService
        .getUserAlbumLikesByAlbumId(albumId);

    const response = h.response({
      status: 'success',
      data: {likes},
    });

    if (from === 'cache') {
      response.header('X-Data-Source', from);
    }

    return response;
  }

  async deleteUserAlbumLikeByAlbumIdHandler(request) {
    const {id: albumId} = request.params;
    const {id: userId} = request.auth.credentials;

    try {
      await this._userAlbumLikesService.verifyUserAlbumLike(userId, albumId);
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw e;
      }

      try {
        await this._userAlbumLikesService
            .deleteUserAlbumLikeByAlbumId(userId, albumId);

        return {
          status: 'success',
          message: 'Like berhasil dihapus',
        };
      } catch (e) {
        throw e;
      }
    }
  }
}

module.exports = AlbumsHandler;
