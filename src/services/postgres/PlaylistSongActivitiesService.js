const {Pool} = require('pg');
const generateId = require('../../util/id');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSongActivity(
      client,
      {playlistId, songId, userId, action, time},
  ) {
    const id = generateId('playlist_song_activity');

    const query = {
      text: `
        INSERT INTO playlist_song_activities
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING id
      `,
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await client.query(query);
    if (!result.rows[0].id) {
      await client.query('ROLLBACK');
      throw new InvariantError('Playlist gagal ditambahkan');
    }
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `
        SELECT u.username, s.title, pa.action, pa.time
        FROM playlist_song_activities AS pa
        LEFT JOIN users AS u ON u.id = pa.user_id
        LEFT JOIN songs AS s ON s.id = pa.song_id
        WHERE pa.playlist_id=$1
        `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return {playlistId, activities: result.rows};
  }
}

module.exports = PlaylistSongActivitiesService;
