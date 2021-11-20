const userService = require('./user-service');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const utils = require('../utils/utils');
const tokenService = require('./token-service');

const salt = 10;

class AuthService {
  async userRegistration(userInputData) {
    const candidate = await userService.getUserByEmail(userInputData.email);

    if (candidate) {
      throw ApiError.badRequest(
        'Пользователь с таким почтовым адресом уже зарегистрирован >_<'
      );
    }

    userInputData.password = await bcrypt.hash(userInputData.password, salt);

    const user = await userService.createUser(userInputData);

    await userService.confirmUser(userInputData.email, user.insertId);

    return await utils.generateAndSaveToken({
      id: user.insertId,
      userName: userInputData.userName
    });
  }

  async userLogin(login, password) {
    let user;

    if (login.indexOf('@') > -1) {
      user = await userService.getUserByEmail(login);
    } else {
      user = await userService.getUserByName(login);
    }

    if (!user) {
      throw ApiError.badRequest(`Пользователь не найден :/`);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.badRequest('Неверный лоин или пароль T_T');
    }

    return await utils.generateAndSaveToken({
      id: user.id,
      userName: user.user_name
    });
  }

  async userLogout(refreshToken) {
    await tokenService.removeToken(refreshToken);
  }

  async userActivation(activationLink) {
    const user = await userService.checkUserActivationLink(activationLink);

    if (!user) {
      throw ApiError.badRequest('Ссылка Недействительна o_O');
    }

    if (user.is_activation_status !== 0) {
      return false;
    }

    await userService.updateUserActivationStatus(user.id);
  }
}

module.exports = new AuthService();
