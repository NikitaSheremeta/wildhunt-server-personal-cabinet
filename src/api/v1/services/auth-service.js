const userData = require('../../../infrastructure/data/user-data');
const technicalMessagesUtils = require('../utils/technical-messages-utils');
const tokenData = require('../../../infrastructure/data/token-data');
const apiResponse = require('../dtos/api-response');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const guardUtils = require('../utils/guard-utils');
const uuid = require('uuid');
const mailService = require('./mail-service');
const utils = require('../utils/utils');

const salt = 10;

class AuthService {
  async userSignup(userInputData) {
    const username = await userData.getUserByName(userInputData.username);
    const email = await userData.getUserByEmail(userInputData.email);

    if (username) {
      return apiResponse.errorResponse({
        message:
          technicalMessagesUtils.authMessages.NICKNAME_IS_ALREADY_REGISTERED
      });
    }

    if (email) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.EMAIL_IS_ALREADY_REGISTERED
      });
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

    const tokens = await tokenService.generateAndSaveRefreshTokens({
      id: user.insertId,
      username: userInputData.username,
      roles: [guardUtils.siteRoles.USER]
    });

    return apiResponse.successResponse(tokens);
  }

  async userLogin(login, password) {
    let user;

    if (login.indexOf('@') > -1) {
      user = await userData.getUserByEmail(login);
    } else {
      user = await userData.getUserByName(login);
    }

    if (!user) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.USER_IS_NOT_FOUND
      });
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.WRONG_LOGIN_OR_PASSWORD
      });
    }

    const roles = await userData.getUserRoles(user.id);

    if (!roles) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.ROLES_NOT_FOUND
      });
    }

    const tokens = await tokenService.generateAndSaveRefreshTokens({
      id: user.id,
      username: user.user_name,
      roles: roles.map((role) => role.identifier)
    });

    return apiResponse.successResponse(tokens);
  }

  async userLogout(refreshToken) {
    if (!refreshToken) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.LOGOUT_ERROR
      });
    }

    const token = await tokenData.deleteRefreshToken(refreshToken);

    return apiResponse.successResponse(token);
  }

  async userActivation(activationLink) {
    const user = await userData.getUserByActivationLink(activationLink);

    if (!user) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.INVALID_LINK
      });
    }

    if (user.is_activation_status !== 0) {
      return false;
    }

    await userData.updateUserActivationStatus(user.id);
  }

  async userForgotPassword(email) {
    const user = await userData.getUserByEmail(email);

    if (!user) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.EMAIL_ADDRESS_NOT_FOUND
      });
    }

    const resetToken = await tokenService.generateAndSaveResetToken({
      id: user.id
    });

    await mailService.sendResetMail(
      email,
      `${process.env.API_URL}/api/v1/auth/reset/${resetToken}`
    );

    return apiResponse.successResponse();
  }

  async userResetPassword(resetToken) {
    const mailToken = tokenService.validateResetToken(resetToken);

    if (!mailToken) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.LINK_EXPIRED
      });
    }

    const user = await userData.getUserById(mailToken.id);

    if (!user) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.USER_NOT_FOUND
      });
    }

    const newPassword = utils.generatePassword();

    const newHashPassword = await bcrypt.hash(newPassword, salt);

    await userData.updateUserPassword(mailToken.id, newHashPassword);
    await mailService.sendNewPasswordMail(user.email, newPassword);
    await tokenData.deleteResetToken(resetToken);
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
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.USER_NOT_FOUND
      });
    }

    const roles = await userData.getUserRoles(dbToken.user_id);

    if (!roles) {
      return apiResponse.errorResponse({
        message: technicalMessagesUtils.authMessages.ROLES_NOT_FOUND
      });
    }

    const tokens = await tokenService.generateAndSaveRefreshTokens({
      id: user.id,
      username: user.user_name,
      roles: roles.map((role) => role.identifier)
    });

    return apiResponse.successResponse(tokens);
  }
}

module.exports = new AuthService();
