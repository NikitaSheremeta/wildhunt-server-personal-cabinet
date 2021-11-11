const bcrypt = require('bcrypt');
const uuid = require('uuid');
const connection = require('../../config/connection');
const mailService = require('./mail-service');
const tokenService = require('./token-service');

const saltRounds = 10;
const isActivated = 1;

class UserService {
  async registration(email, password) {
    const [candidate] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email],
      (err) => console.error(err)
    );

    if (candidate.length > 0) {
      throw new Error(
        'пользователь с таким почтовым адресом уже зарегистрирован'
      );
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const activationLink = uuid.v4();

    const [user] = await connection.execute(
      'INSERT INTO users (email, password, isActivated, activationLink) VALUES (?, ?, ?, ?)',
      [email, hashPassword, 0, activationLink],
      (err) => console.error(err)
    );

    const userData = {
      id: user.insertId,
      email,
      isActivated: 0
    };

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/v1/activate/${activationLink}`
    );

    const tokens = tokenService.generateTokens(userData);

    await tokenService.saveToken(userData.id, tokens.refreshToken);

    return {
      success: 'Поздравляем - Вы успешно зарегистрировались!',
      ...tokens,
      user: userData
    };
  }

  async activate(activationLink) {
    const [user] = await connection.execute(
      'SELECT id FROM users WHERE activationLink = ?',
      [activationLink],
      (err) => console.error(err)
    );

    if (user.length === 0) {
      throw new Error('Некорректная ссылка активации');
    }

    await connection.execute(
      'UPDATE users SET isActivated = ?, activationLink = ? WHERE id = ?',
      [isActivated, 'NULL', user[0].id],
      (err) => console.error(err)
    );
  }
}

module.exports = new UserService();
