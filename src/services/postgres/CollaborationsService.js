const {Pool} = require('pg');
const generateId = require('../../util/id');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addCollaboration({playlistId, userId}) {
    const id = generateId('collaboration');
    const query = {
      text: 'INSERT INTO collaborations VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Collaborator gagal ditambahkan');
    }

    await this._cacheService.delete(`playlist:${userId}`);

    return result.rows[0].id;
  }

  async deleteCollaboration({playlistId, userId}) {
    const query = {
      text: `
        DELETE FROM collaborations
        WHERE playlist_id=$1 AND user_id=$2 RETURNING id
      `,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(
          'Gagal menghapus collaborator. Id tidak ditemukan',
      );
    }

    await this._cacheService.delete(`playlist:${userId}`);
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id=$1 AND user_id=$2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Collaboration gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
