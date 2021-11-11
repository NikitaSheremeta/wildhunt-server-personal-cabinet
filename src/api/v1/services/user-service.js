const bcrypt = require('bcrypt');
const uuid = require('uuid');
const connection = require('../../config/connection');
const mailService = require('./mail-service');
const tokenService = require('./token-service');

const saltRounds = 10;

class UserService {
  async registration(email, password) {
    const [candidate] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email],
      (err) => console.error(err)
    );

    if (candidate.length > 0) {
      console.log('пользователь с таким почтовым адресом уже зарегистрирован');
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const activationLink = uuid.v4();

    const [user] = await connection.execute(
      'INSERT INTO users (email, password, isActivated,  activationLink) VALUES (?, ?, ?, ?)',
      [email, hashPassword, 0, activationLink],
      (err) => console.error(err)
    );

    const userData = {
      id: user.insertId,
      email,
      isActivated: 0
    };

    await mailService.sendActivationMail(email, activationLink);

    const tokens = tokenService.generateTokens(userData);

    await tokenService.saveToken(userData.id, tokens.refreshToken);

    return {
      success: 'Поздравляем - Вы успешно зарегистрировались!',
      ...tokens,
      user: userData
    };
  }
}

module.exports = new UserService();
