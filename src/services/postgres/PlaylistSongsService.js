const {Pool} = require('pg');
const generateId = require('../../util/id');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');


class PlaylistsService {
  constructor(playlistSongActivitiesService) {
    this._pool = new Pool();
    this._playlistSongActivitiesService = playlistSongActivitiesService;
  }

  async addPlaylistSong(playlistId, userId, {songId}) {
    const id = generateId('playlist_song');
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');

      const action = 'add';
      const time = new Date().toISOString();

      const result = await client.query(query);
      if (!result.rows[0].id) {
        await client.query('ROLLBACK');
        throw new InvariantError('Playlist song gagal ditambahkan');
      }

      await this._playlistSongActivitiesService
          .addPlaylistSongActivity(
              client,
              {playlistId, songId, userId, action, time},
          );
      await client.query('COMMIT');
    } catch (e) {
      throw e;
    } finally {
      client.release();
    }
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: `
        SELECT songs.id, songs.title, songs.performer
        FROM playlist_songs
        JOIN songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id=$1
      `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistSong(playlistId, userId, {songId}) {
    const query = {
      text: `
        DELETE FROM playlist_songs
        WHERE playlist_id=$1 AND song_id=$2 RETURNING id
      `,
      values: [playlistId, songId],
    };

    const client = await this._pool.connect();
    try {
      await client.query('BEGIN');

      const action = 'delete';
      const time = new Date().toISOString();
      const result = await this._pool.query(query);
      if (!result.rowCount) {
        throw new NotFoundError(
            'Gagal menghapus playlist song. Id tidak ditemukan',
        );
      }

      await this._playlistSongActivitiesService
          .addPlaylistSongActivity(
              client,
              {playlistId, songId, userId, action, time},
          );
      await client.query('COMMIT');
    } catch (e) {
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = PlaylistsService;
