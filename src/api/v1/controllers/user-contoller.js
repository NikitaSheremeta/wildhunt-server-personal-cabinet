const userService = require('../services/user-service');

// eslint-disable-next-line no-magic-numbers
const thirtyDays = 30 * 24 * 60 * 60 * 1000;

class UserController {
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await userService.refresh(refreshToken);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: thirtyDays,
        httpOnly: true
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
