const bcrypt = require('bcrypt');
const uuid = require('uuid');
const connection = require('../../config/connection');
const mailService = require('./mail-service');
const utils = require('../utils/utils');
const ApiError = require('../exceptions/api-error');

const saltRounds = 10;
const isActivated = 1;
const invalidMailbox = 550;

class UserService {
  async registration(email, password) {
    const [candidate] = await connection.execute(
      'SELECT email FROM users WHERE email = ?',
      [email],
      (err) => console.error(err)
    );

    if (candidate.length > 0) {
      throw ApiError.badRequest(
        'Пользователь с таким почтовым адресом уже зарегистрирован >_<'
      );
    }

    const activationLink = uuid.v4();

    try {
      await mailService.sendActivationMail(
        email,
        `${process.env.API_URL}/api/v1/activate/${activationLink}`
      );
    } catch (err) {
      if (err.responseCode === invalidMailbox) {
        throw ApiError.invalidMailbox(err.responseCode);
      }

      throw ApiError.badRequest(err, err.message);
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);

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

    const tokens = await utils.generateAndSaveToken(userData);

    return {
      success: 'Вы успешно зарегистрированы ^_^',
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
      throw ApiError.badRequest('Недействительная ссылка активация o_O');
    }

    await connection.execute(
      'UPDATE users SET isActivated = ?, activationLink = ? WHERE id = ?',
      [isActivated, 'NULL', user[0].id],
      (err) => console.error(err)
    );
  }

  async login(email, password) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err) => console.error(err)
    );

    if (user.length === 0) {
      throw ApiError.badRequest(
        `Пользователь с почтовым адресом ${email} не найден :/`
      );
    }

    const isPassEquals = await bcrypt.compare(password, user[0].password);

    if (!isPassEquals) {
      throw ApiError.badRequest('Неверный пароль T_T');
    }

    const userData = {
      id: user[0].id,
      email: user[0].email,
      isActivated: user[0].isActivated
    };

    const tokens = await utils.generateAndSaveToken(userData);

    return {
      ...tokens,
      user: userData
    };
  }
}

module.exports = new UserService();
