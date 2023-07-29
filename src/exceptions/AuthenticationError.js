const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
