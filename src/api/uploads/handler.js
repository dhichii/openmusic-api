const autoBind = require('auto-bind');
const config = require('../../util/config');

class UploadAlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadAlbumsHandler(request, h) {
    const {cover} = request.payload;
    const {id} = request.params;
    this._validator.validateAlbumHeaders(cover.hapi.headers);

    const album = await this._albumsService.getAlbumById(id);
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    if (album.coverUrl) {
      const coverFilename = album.coverUrl.split('/').at(-1);
      await this._storageService.deleteFile(coverFilename);
    }

    const coverUrl = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;
    await this._albumsService.editCoverAlbumById(id, coverUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }
}

module.exports = UploadAlbumsHandler;
