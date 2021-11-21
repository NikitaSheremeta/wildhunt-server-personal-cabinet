const userService = require('./user-service');
const ApiErrorHelper = require('../helpers/api-error-helper');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');

const salt = 10;

class AuthService {
  async userRegistration(userInputData) {
    const candidate = await userService.getUserByEmail(userInputData.email);

    if (candidate) {
      throw ApiErrorHelper.badRequest(
        'Пользователь с таким почтовым адресом уже зарегистрирован >_<'
      );
    }

    userInputData.password = await bcrypt.hash(userInputData.password, salt);

    const user = await userService.createUser(userInputData);

    await userService.confirmUser(userInputData.email, user.insertId);

    return await tokenService.generateAndSaveTokens({
      id: user.insertId,
      userName: userInputData.userName,
      roles: ['User']
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
      throw ApiErrorHelper.badRequest('Пользователь не найден :/');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiErrorHelper.badRequest('Неверный лоин или пароль T_T');
    }

    const roles = await userService.getUserSiteRoles(user.id);

    if (!roles) {
      throw ApiErrorHelper.badRequest('Роли не обнаружены х_X');
    }

    return await tokenService.generateAndSaveTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.value)
    });
  }

  async userLogout(refreshToken) {
    await tokenService.removeToken(refreshToken);
  }

  async userActivation(activationLink) {
    const user = await userService.checkUserActivationLink(activationLink);

    if (!user) {
      throw ApiErrorHelper.badRequest('Ссылка Недействительна o_O');
    }

    if (user.is_activation_status !== 0) {
      return false;
    }

    await userService.updateUserActivationStatus(user.id);
  }

  async userRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiErrorHelper.unauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw ApiErrorHelper.unauthorizedError();
    }

    const user = await userService.getUserById(userData.id);

    if (!user) {
      throw ApiErrorHelper.badRequest('Пользователь не найден :/');
    }

    const roles = await userService.getUserSiteRoles(userData.id);

    if (!roles) {
      throw ApiErrorHelper.badRequest('Роли не обнаружены х_X');
    }

    return await tokenService.generateAndSaveTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.value)
    });
  }
}

module.exports = new AuthService();
