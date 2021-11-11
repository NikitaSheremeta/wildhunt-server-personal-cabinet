const jwt = require('jsonwebtoken');
const connection = require('../../config/connection');

class TokeService {
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
      'SELECT userId FROM tokens WHERE userId = ?',
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

    const token = await connection.execute(
      'UPDATE tokens SET userId =?, refreshToken = ?',
      [userId, refreshToken],
      (err) => console.error(err)
    );

    return token;
  }
}

module.exports = new TokeService();
