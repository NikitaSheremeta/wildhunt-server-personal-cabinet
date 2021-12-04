const jwt = require('jsonwebtoken');
const tokenData = require('../../../infrastructure/data/token-data');
const dateUtils = require('../utils/date-utils');
const ApiError = require('../exceptions/api-error');

class TokenService {
  generateAuthTokens(payload) {
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

  validateResetToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
    } catch (err) {
      return null;
    }
  }

  async saveRefreshToken(userId, refreshToken) {
    const token = await tokenData.getRefreshTokenByUserId(userId);

    if (token) {
      return await tokenData.updateRefreshToken(userId, refreshToken);
    }

    await tokenData.createRefreshToken(userId, refreshToken);
  }

  async saveResetToken(userId, resetToken) {
    const resetTokenData = await tokenData.getResetTokenByUserId(userId);

    if (resetTokenData) {
      const fifteenMinutes = 900;

      const resetDate = dateUtils.convertIsoToMilliseconds(
        resetTokenData.reset_date
      );

      const isDifference = dateUtils.getDifferenceInTime(
        resetDate,
        fifteenMinutes
      );

      if (isDifference) {
        throw ApiError.badRequest('Повторите попытку позже');
      }

      return await tokenData.updateResetToken(userId, resetToken);
    }

    await tokenData.createResetToken(userId, resetToken);
  }

  async generateAndSaveRefreshTokens(userData) {
    const tokens = this.generateAuthTokens(userData);

    await this.saveRefreshToken(userData.id, tokens.refreshToken);

    return tokens;
  }

  async generateAndSaveResetToken(userData) {
    const resetToken = this.generateResetToken(userData);

    await this.saveResetToken(userData.id, resetToken);

    return resetToken;
  }
}

module.exports = new TokenService();
