const userData = require('../../../infrastructure/data/user-data');
const tokenData = require('../../../infrastructure/data/token-data');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const guardUtils = require('../utils/guard-utils');
const uuid = require('uuid');
const mailService = require('./mail-service');
const utils = require('../utils/utils');

const salt = 10;

class AuthService {
  async userRegistration(userInputData) {
    const userName = await userData.getUserByName(userInputData.userName);
    const userEmail = await userData.getUserByEmail(userInputData.email);

    if (userName) {
      throw ApiError.badRequest(
        'Пользователь с таким никнеймом уже зарегистрирован x_x'
      );
    }

    if (userEmail) {
      throw ApiError.badRequest(
        'Пользователь с таким почтовым адресом уже зарегистрирован >_<'
      );
    }

    const activationLink = uuid.v4();

    // I guess if the mail obviously doesn't exist,
    // there is no need to create a user.
    // That is why sending a letter before creating a user to the database.
    await mailService.sendActivationMail(
      userInputData.email,
      `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    );

    userInputData.password = await bcrypt.hash(userInputData.password, salt);

    const user = await userData.createUser(userInputData);

    await userData.createUserActivationLink(user.insertId, activationLink);

    return await tokenService.generateAndSaveRefreshTokens({
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

    const roles = await userData.getUserRoles(user.id);

    if (!roles) {
      throw ApiError.badRequest('Роли не обнаружены х_X');
    }

    return await tokenService.generateAndSaveRefreshTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.identifier)
    });
  }

  async userLogout(refreshToken) {
    await tokenData.deleteRefreshToken(refreshToken);
  }

  async userActivation(activationLink) {
    const user = await userData.getUserByActivationLink(activationLink);

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

    return {
      message: 'Инструкция по сбросу пароля отправлена на ваш почтовый ящик'
    };
  }

  async userResetPassword(resetToken) {
    const mailToken = tokenService.validateResetToken(resetToken);

    if (!mailToken) {
      throw ApiError.badRequest('Срок действия ссылки истек x_X');
    }

    const user = await userData.getUserById(mailToken.id);

    if (!user) {
      throw ApiError.badRequest('Пользователь не найден...');
    }

    const newPassword = utils.generatePassword();

    const newHashPassword = await bcrypt.hash(newPassword, salt);

    await userData.updateUserPassword(mailToken.id, newHashPassword);
    await mailService.sendNewPasswordMail(user.email, newPassword);
  }

  async userRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError();
    }

    const cookieToken = tokenService.validateRefreshToken(refreshToken);
    const dbToken = await tokenData.getRefreshTokenByUserId(cookieToken.id);

    if (!cookieToken || !dbToken) {
      throw ApiError.unauthorizedError();
    }

    const user = await userData.getUserById(dbToken.user_id);

    if (!user) {
      throw ApiError.badRequest('Пользователь не найден :/');
    }

    const roles = await userData.getUserRoles(dbToken.user_id);

    if (!roles) {
      throw ApiError.badRequest('Роли не обнаружены х_X');
    }

    return await tokenService.generateAndSaveRefreshTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.identifier)
    });
  }
}

module.exports = new AuthService();
