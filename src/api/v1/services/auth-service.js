const userData = require('../../../infrastructure/data/user-data');
const tokenData = require('../../../infrastructure/data/token-data');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const guardUtils = require('../utils/guard-utils');

const uuid = require('uuid');
const mailService = require('./mail-service');

class AuthService {
  async userRegistration(userInputData) {
    const checkUserName = await userData.getUserByName(userInputData.userName);
    const checkEmail = await userData.getUserByEmail(userInputData.email);

    if (checkUserName) {
      throw ApiError.badRequest(
        'Пользователь с таким никнеймом уже зарегистрирован x_x'
      );
    }

    if (checkEmail) {
      throw ApiError.badRequest(
        'Пользователь с таким почтовым адресом уже зарегистрирован >_<'
      );
    }

    const salt = 10;

    userInputData.password = await bcrypt.hash(userInputData.password, salt);

    const user = await userData.createUser(userInputData);

    const activationLink = uuid.v4();

    await mailService.sendActivationMail(
      userInputData.email,
      `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    );

    await userData.createUserActivationLink(user.insertId, activationLink);

    return await tokenService.generateAndSaveTokens({
      id: user.insertId,
      userName: userInputData.userName,
      roles: [guardUtils.siteRoles.USER]
    });
  }

  async userLogin(login, password) {
    let user;

    if (login.indexOf('@') > -1) {
      user = await userData.getUserByEmail(login);
    } else {
      user = await userData.getUserByName(login);
    }

    if (!user) {
      throw ApiError.badRequest('Пользователь не найден :/');
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.badRequest('Неверный лоин или пароль T_T');
    }

    const roles = await userData.getUserSiteRoles(user.id);

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
    await tokenData.deleteToken(refreshToken);
  }

  async userActivation(activationLink) {
    const user = await userData.checkUserActivationLink(activationLink);

    if (!user) {
      throw ApiError.badRequest('Ссылка Недействительна o_O');
    }

    if (user.is_activation_status !== 0) {
      return false;
    }

    await userData.updateUserActivationStatus(user.id);
  }

  async userForgotPassword(email) {
    const user = await userData.getUserByEmail(email);

    if (!user) {
      throw ApiError.badRequest(
        'Пользователь с таким почтовым адресом не найден -_-'
      );
    }

    const resetToken = await tokenService.generateAndSaveResetToken({
      id: user.id
    });

    await mailService.sendResetMail(
      email,
      `${process.env.API_URL}/api/v1/auth/reset/${resetToken}`
    );
  }

  async userResetPassword() {
    console.log();
  }

  async userRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenData.findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw ApiError.unauthorizedError();
    }

    const user = await userData.getUserById(userData.id);

    if (!user) {
      throw ApiError.badRequest('Пользователь не найден :/');
    }

    const roles = await userData.getUserSiteRoles(userData.id);

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
