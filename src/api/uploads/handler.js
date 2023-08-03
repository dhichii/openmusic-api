const autoBind = require('auto-bind');

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
    const fileUrl = await this._storageService.writeFile(cover, cover.hapi);
    if (album.coverUrl) {
      const coverFilename = album.coverUrl.split('/').at(-1);
      await this._storageService.deleteFile(coverFilename);
    }

    await this._albumsService.editCoverAlbumById(id, fileUrl);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }
}

module.exports = UploadAlbumsHandler;
