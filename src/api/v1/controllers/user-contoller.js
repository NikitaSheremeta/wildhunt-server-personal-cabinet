const userService = require('../services/user-service');

// eslint-disable-next-line no-magic-numbers
const thirtyDays = 30 * 24 * 60 * 60 * 1000;

class UserController {
  async registration(req, res) {
    try {
      const { email, password } = req.body;
      const userData = await userService.registration(email, password);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: thirtyDays,
        httpOnly: true
      });

      return res.json(userData);
    } catch (err) {
      console.error(err.message);
    }
  }

  async activate(req, res) {
    try {
      await userService.activate(req.params.link);

      return res.redirect(process.env.API_URL);
    } catch (err) {
      console.error(err.message);
    }
  }
}

module.exports = new UserController();
