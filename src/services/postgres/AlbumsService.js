const {Pool} = require('pg');
const generateId = require('../../util/id');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {mapAlbumDBToModel} = require('../../util/index');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({name, year}) {
    const id = generateId('album');

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id=$1',
      values: [id],
    };

    const result = await this._pool.query(albumQuery);
    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return mapAlbumDBToModel(result.rows[0]);
  }

  async editAlbumById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editCoverAlbumById(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover=$1 WHERE id=$2 RETURNING id',
      values: [cover, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(
          'Gagal memperbarui cover album. Id tidak ditemukan',
      );
    }
  }
}

module.exports = AlbumsService;
