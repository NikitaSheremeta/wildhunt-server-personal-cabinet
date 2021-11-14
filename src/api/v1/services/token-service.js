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
      'SELECT * FROM tokens WHERE user_id = ?',
      [userId],
      (err) => console.error(err)
    );

    if (tokenData > 0) {
      return connection.execute(
        'UPDATE tokens SET refresh_token = ?',
        [refreshToken],
        (err) => console.error(err)
      );
    }

    await connection.execute(
      'UPDATE tokens SET user_id = ?, refresh_token = ?',
      [userId, refreshToken],
      (err) => console.error(err)
    );
  }
}

module.exports = new TokenService();
