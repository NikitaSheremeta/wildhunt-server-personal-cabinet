const tokenService = require('../services/token-service');

class Utils {
  async generateAndSaveToken(userData) {
    const tokens = tokenService.generateTokens(userData);

    await tokenService.saveToken(userData.id, tokens.refreshToken);

    return tokens;
  }

  getCurrentDate() {
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const DD = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours());
    const mm = String(today.getMinutes());
    const ss = String(today.getSeconds());

    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  }
}

module.exports = new Utils();
