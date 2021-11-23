const userService = require('./user-service');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const guardUtils = require('../utils/guard-utils');

const uuid = require('uuid');
const mailService = require('./mail-service');

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

    const activationLink = uuid.v4();

    await mailService.sendActivationMail(
      userInputData.email,
      `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    );

    await userService.recordUserActivationLink(user.insertId, activationLink);

    return await tokenService.generateAndSaveTokens({
      id: user.insertId,
      userName: userInputData.userName,
      roles: [guardUtils.siteRoles.USER]
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
      throw ApiError.badRequest('Пользователь не найден :/');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.badRequest('Неверный лоин или пароль T_T');
    }

    const roles = await userService.getUserSiteRoles(user.id);

    if (!roles) {
      throw ApiError.badRequest('Роли не обнаружены х_X');
    }

    return await tokenService.generateAndSaveTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.identifier)
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

  async userRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw ApiError.unauthorizedError();
    }

    const user = await userService.getUserById(userData.id);

    if (!user) {
      throw ApiError.badRequest('Пользователь не найден :/');
    }

    const roles = await userService.getUserSiteRoles(userData.id);

    if (!roles) {
      throw ApiError.badRequest('Роли не обнаружены х_X');
    }

    return await tokenService.generateAndSaveTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.identifier)
    });
  }
}

module.exports = new AuthService();
