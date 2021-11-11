const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');

const saltRounds = 10;

class UserService {
  async registration(email, password) {
    const candidate = ''; // Проверить наличие юзера в БД: email

    if (candidate) {
      throw new Error(
        `Пользователь с почтовым адресом ${email} уже существует`
      );
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const activationLink = uuid.v4();
    const user = ''; // Создаем пользователя: email, hashPassword, activationLink

    await mailService.sendActivationMail(email, activationLink);

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto
    };
  }
}

module.exports = new UserService();
