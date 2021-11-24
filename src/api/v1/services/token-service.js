const jwt = require('jsonwebtoken');
const tokenData = require('../../../infrastructure/data/token-data');

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
    const token = await tokenData.getTokenByUserId(userId);

    if (token) {
      return await tokenData.updateToken(refreshToken, userId);
    }

    await tokenData.createToken(userId, refreshToken);
  }

  async generateAndSaveTokens(userData) {
    const tokens = this.generateTokens(userData);

    await this.saveToken(userData.id, tokens.refreshToken);

    return tokens;
  }
}

module.exports = new TokenService();
