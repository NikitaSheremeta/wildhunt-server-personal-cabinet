const connection = require('../config/mysql-connection');

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

  async getResetTokenByUserId(userId) {
    const [token] = await connection.execute(
      'SELECT * FROM reset_tokens WHERE user_id = ?',
      [userId],
      (err) => console.error(err)
    );

    return token.length > 0 ? token[0] : false;
  }

  async createResetToken(userId, resetToken) {
    await connection.execute(
      'INSERT INTO reset_tokens (user_id, link) VALUES (?, ?)',
      [userId, resetToken],
      (err) => console.error(err)
    );
  }

  async updateResetToken(userId, resetToken) {
    await connection.execute(
      'UPDATE reset_tokens SET reset_date = now(), link = ? WHERE user_id = ?',
      [resetToken, userId],
      (err) => console.error(err)
    );
  }
}

module.exports = new TokenData();
