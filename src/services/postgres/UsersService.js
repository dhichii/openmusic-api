const {Pool} = require('pg');
const generateId = require('../../util/id');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({username, password, fullname}) {
    await this.verifyNewUsername(username);

    const id = generateId('user');
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);
    if (result.rowCount) {
      throw new InvariantError(
          'Gagal menambahkan user. Username sudah digunakan.',
      );
    }
  }

  async verifyUserCredential({username, password}) {
    const errCredential = 'Username atau password salah';
    const query = {
      text: 'SELECT id, password FROM users WHERE username=$1',
      values: [username],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthenticationError(errCredential);
    }

    const {id, password: hashedPassword} = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError(errCredential);
    }

    return id;
  }
}

module.exports = UsersService;