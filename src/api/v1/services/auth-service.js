const userService = require('./user-service');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');

const salt = 10;

class AuthService {
  async registration(userInputData) {
    const candidate = await userService.getUserByEmail(userInputData.email);

    if (candidate) {
      throw ApiError.badRequest(
        'Пользователь с таким почтовым адресом уже зарегистрирован >_<'
      );
    }

    userInputData.password = await bcrypt.hash(userInputData.password, salt);

    await userService.createUser(userInputData);
  }
}

module.exports = new AuthService();
