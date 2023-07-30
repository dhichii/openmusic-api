const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(
      playlistsService,
      playlistSongsService,
      playlistSongActivitiesService,
      songsService,
      validator,
  ) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const {id: owner} = request.auth.credentials;

    const playlistId = await this._playlistsService
        .addPlaylist(owner, request.payload);

    return h.response({
      status: 'success',
      data: {playlistId},
    }).code(201);
  }

  async getPlaylistsHandler(request) {
    const {id} = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(id);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const {id} = request.params;
    const {id: owner} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, owner);
    await this._playlistsService.deletePlaylist(id);

    return {
      status: 'success',
      message: 'Playlist song berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);

    const {songId} = request.payload;
    const {id} = request.params;
    const {id: userId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, userId);
    await this._songsService.getSongById(songId);
    await this._playlistSongsService
        .addPlaylistSong(id, userId, request.payload);

    return h.response({
      status: 'success',
      message: 'Playlist song berhasil ditambahkan',
    }).code(201);
  }

  async getPlaylistSongsHandler(request) {
    const {id} = request.params;
    const {id: userId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, userId);
    const playlist = await this._playlistsService.getPlaylistById(id);
    const songs = await this._playlistSongsService.getPlaylistSongs(id);
    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    this._validator.validateDeletePlaylistSongPayload(request.payload);

    const {id} = request.params;
    const {id: userId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, userId);
    await this._playlistSongsService
        .deletePlaylistSong(id, userId, request.payload);

    return {
      status: 'success',
      message: 'Playlist song berhasil dihapus',
    };
  }

  async getPlaylistSongActivitiesHandler(request) {
    const {id} = request.params;
    const {id: userId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, userId);
    const data = await this._playlistSongActivitiesService.
        getPlaylistSongActivities(id);

    return {
      status: 'success',
      data,
    };
  }
}

module.exports = PlaylistsHandler;
