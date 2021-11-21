const jwt = require('jsonwebtoken');
const connection = require('../../config/connection');

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m'
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d'
    });

    return {
      accessToken,
      refreshToken
    };
  }

  validateAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const [tokenData] = await connection.execute(
      'SELECT * FROM tokens WHERE user_id = ?',
      [userId],
      (err) => console.error(err)
    );

    if (tokenData.length > 0) {
      return connection.execute(
        'UPDATE tokens SET refresh_token = ? WHERE user_id = ?',
        [refreshToken, userId],
        (err) => console.error(err)
      );
    }

    await connection.execute(
      'INSERT INTO tokens (user_id, refresh_token) VALUES (?, ?)',
      [userId, refreshToken],
      (err) => console.error(err)
    );
  }

  async removeToken(refreshToken) {
    await connection.execute(
      'DELETE FROM tokens WHERE refresh_token = ?',
      [refreshToken],
      (err) => console.error(err)
    );
  }

  async findToken(refreshToken) {
    const [tokenData] = await connection.execute(
      'SELECT * FROM tokens WHERE refresh_token = ?',
      [refreshToken],
      (err) => console.error(err)
    );

    return tokenData.length > 0 ? tokenData[0] : false;
  }

  async generateAndSaveTokens(userData) {
    const tokens = this.generateTokens(userData);

    await this.saveToken(userData.id, tokens.refreshToken);

    return tokens;
  }
}

module.exports = new TokenService();
