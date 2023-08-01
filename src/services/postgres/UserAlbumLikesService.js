const {Pool} = require('pg');
const generateId = require('../../util/id');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addUserAlbumLike(userId, albumId) {
    const id = generateId('user_album_like');
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1,$2,$3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal melakukan like pada album');
    }

    await this._cacheService.delete(`user_album_like:${albumId}`);
  }

  async verifyUserAlbumLike(userId, albumId) {
    const query = {
      text: `
        SELECT id FROM user_album_likes
        WHERE user_id=$1 AND album_id=$2
      `,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) {
      throw new InvariantError('User sudah melakukan like pada album');
    }

    throw new NotFoundError('User belum melakukan like pada album');
  }

  async getUserAlbumLikesByAlbumId(albumId) {
    try {
      const result = await this._cacheService.get(`user_album_like:${albumId}`);
      return {
        likes: parseInt(result),
        from: 'cache',
      };
    } catch (e) {
      const query = {
        text: `
        SELECT COUNT(id) AS likes FROM user_album_likes
        WHERE album_id=$1
      `,
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].likes);
      if (likes) {
        await this._cacheService.set(`user_album_like:${albumId}`, likes);
      }

      return {likes};
    }
  }

  async deleteUserAlbumLikeByAlbumId(userId, albumId) {
    const query = {
      text: `
        DELETE FROM user_album_likes
        WHERE user_id=$1 AND album_id=$2 RETURNING id
      `,
      values: [userId, albumId],
    };

    await this._pool.query(query);
    await this._cacheService.delete(`user_album_like:${albumId}`);
  }
}

module.exports = UserAlbumLikesService;
