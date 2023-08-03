const {Pool} = require('pg');
const generateId = require('../../util/id');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {mapSongDBToModel} = require('../../util/index');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = generateId('song');

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title='', performer='') {
    const query = {
      text: `
        SELECT id, title, performer
        FROM songs
        WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2
        `,
      values: [
        `%${title.toLowerCase()}%`, `%${performer.toLowerCase()}%`,
      ],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id=$1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: `
      SELECT * FROM songs WHERE id=$1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return mapSongDBToModel(result.rows[0]);
  }

  async editSongById(id, {title, year, genre, performer, duration, albumId}) {
    const query = {
      text: `UPDATE songs SET
      title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6
      WHERE id=$7 RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
