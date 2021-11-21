const userService = require('../services/user-service');

class UserController {
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();

      return res.json(users);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
