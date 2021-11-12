const tokenService = require('../services/token-service');

class Utils {
  async generateAndSaveToken(userData) {
    const tokens = tokenService.generateTokens(userData);

    await tokenService.saveToken(userData.id, tokens.refreshToken);

    return tokens;
  }
}

module.exports = new Utils();
