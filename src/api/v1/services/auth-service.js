const userService = require('./user-service');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const utils = require('../utils/utils');

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

  async userActivation(activationLink) {
    const user = await userService.checkUserActivationLink(activationLink);

    if (!user) {
      throw ApiError.badRequest('Недействительная ссылка активация o_O');
    }

    if (user.is_activation_status !== 0) {
      return false;
    }

    await userService.updateUserActivationStatus(user.id);
  }
}

module.exports = new AuthService();
