const jwt = require('jsonwebtoken');
const tokenData = require('../../../infrastructure/data/token-data');
const dateUtils = require('../utils/date-utils');
const ApiError = require('../exceptions/api-error');

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

  generateResetToken(payload) {
    return jwt.sign(payload, process.env.JWT_RESET_PASSWORD_SECRET, {
      expiresIn: '15m'
    });
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

  async saveResetToken(userId, resetToken) {
    const resetTokenData = await tokenData.getResetTokenByUserId(userId);

    if (resetTokenData) {
      const fiveMinutes = 300;

      const resetDate = dateUtils.convertIsoToMilliseconds(
        resetTokenData.reset_date
      );

      const isDifference = dateUtils.getDifferenceInTime(
        resetDate,
        fiveMinutes
      );

      if (isDifference) {
        throw ApiError.badRequest('Повторите попытку позже');
      }

      return await tokenData.updateResetToken(userId, resetToken);
    }

    await tokenData.createResetToken(userId, resetToken);
  }

  async generateAndSaveResetToken(userData) {
    const resetToken = this.generateResetToken(userData);

    await this.saveResetToken(userData.id, resetToken);

    return resetToken;
  }
}

module.exports = new TokenService();
