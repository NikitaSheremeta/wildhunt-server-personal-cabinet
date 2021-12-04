const connection = require('../config/mysql-connection');

class TokenData {
  async getRefreshTokenByUserId(userId) {
    const [token] = await connection.execute(
      'SELECT * FROM refresh_tokens WHERE user_id = ?',
      [userId],
      (err) => console.error(err)
    );

    return token.length > 0 ? token[0] : false;
  }

  async createRefreshToken(userId, refreshToken) {
    await connection.execute(
      'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
      [userId, refreshToken],
      (err) => console.error(err)
    );
  }

  async updateRefreshToken(userId, refreshToken) {
    connection.execute(
      'UPDATE refresh_tokens SET token = ? WHERE user_id = ?',
      [refreshToken, userId],
      (err) => console.error(err)
    );
  }

  async deleteRefreshToken(refreshToken) {
    await connection.execute(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [refreshToken],
      (err) => console.error(err)
    );
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
      'INSERT INTO reset_tokens (user_id, token) VALUES (?, ?)',
      [userId, resetToken],
      (err) => console.error(err)
    );
  }

  async updateResetToken(userId, resetToken) {
    await connection.execute(
      'UPDATE reset_tokens SET reset_date = now(), token = ? WHERE user_id = ?',
      [resetToken, userId],
      (err) => console.error(err)
    );
  }

  async deleteResetToken(resetToken) {
    await connection.execute(
      'DELETE FROM reset_tokens WHERE refresh_token = ?',
      [resetToken],
      (err) => console.error(err)
    );
  }
}

module.exports = new TokenData();
