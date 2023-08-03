const UploadAlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, {albumsService, storageService, validator}) => {
    const uploadsHandler =
        new UploadAlbumsHandler(albumsService, storageService, validator);
    server.route(routes(uploadsHandler));
  },
};
