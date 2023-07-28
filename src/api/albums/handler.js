const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  postAlbumHandler(request, h) {
    const {name, year} = request.payload;

    const id = this._service.addAlbum({name, year});
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        id,
      },
    });

    response.code(201);
    return response;
  }

  getAlbumByIdHandler(request) {
    const {id} = request.params;

    const album = this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  putAlbumByIdHandler(request) {
    const {id} = request.params;

    this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  deleteAlbumByIdHandler(request) {
    const {id} = request.params;

    this._service.deleteAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }
}

module.exports = AlbumsHandler;
