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

  async saveToken(userId, refreshToken) {
    const [tokenData] = await connection.execute(
      'SELECT * FROM tokens WHERE userId = ?',
      [userId],
      (err) => console.error(err)
    );

    if (tokenData > 0) {
      return connection.execute(
        'UPDATE tokens SET refreshToken = ?',
        [refreshToken],
        (err) => console.error(err)
      );
    }

    await connection.execute(
      'UPDATE tokens SET userId = ?, refreshToken = ?',
      [userId, refreshToken],
      (err) => console.error(err)
    );
  }
}

module.exports = new TokenService();
