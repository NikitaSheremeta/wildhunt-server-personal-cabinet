const connection = require('../config/connection');

class TokenData {
  async getTokenByUserId(userId) {
    const [token] = await connection.execute(
      'SELECT * FROM tokens WHERE user_id = ?',
      [userId],
      (err) => console.error(err)
    );

    return token.length > 0 ? token[0] : false;
  }

  async updateToken(refreshToken, userId) {
    connection.execute(
      'UPDATE tokens SET refresh_token = ? WHERE user_id = ?',
      [refreshToken, userId],
      (err) => console.error(err)
    );
  }

  async createToken(userId, refreshToken) {
    await connection.execute(
      'INSERT INTO tokens (user_id, refresh_token) VALUES (?, ?)',
      [userId, refreshToken],
      (err) => console.error(err)
    );
  }

  async deleteToken(refreshToken) {
    await connection.execute(
      'DELETE FROM tokens WHERE refresh_token = ?',
      [refreshToken],
      (err) => console.error(err)
    );
  }

  async findToken(refreshToken) {
    const [token] = await connection.execute(
      'SELECT * FROM tokens WHERE refresh_token = ?',
      [refreshToken],
      (err) => console.error(err)
    );

    return token.length > 0 ? token[0] : false;
  }
}

module.exports = new TokenData();
