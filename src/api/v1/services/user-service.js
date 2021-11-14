const bcrypt = require('bcrypt');
const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');
const connection = require('../../config/connection');
const mailService = require('./mail-service');
const utils = require('../utils/utils');
const tokenService = require('./token-service');

const saltRounds = 10;
const isActivatedStatus = 1;

class UserService {
  async registration(email, password) {
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const activationLink = uuid.v4();

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

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/v1/activate/${activationLink}`
    );

    const [user] = await connection.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashPassword],
      (err) => console.error(err)
    );

    await connection.execute(
      'INSERT INTO activation_links (user_id, link) VALUES (LAST_INSERT_ID(), ?)',
      [activationLink],
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
      'SELECT user_id FROM activation_links WHERE link = ?',
      [activationLink],
      (err) => console.error(err)
    );

    if (user.length === 0) {
      throw ApiError.badRequest('Недействительная ссылка активация o_O');
    }

    await connection.execute(
      'UPDATE users, activation_links SET users.is_activated_status = ?, activation_links.link = ? WHERE activation_links.id = ? AND users.id = ?',
      [isActivatedStatus, 'NULL', user[0].user_id, user[0].user_id],
      (err) => console.error(err)
    );
  }

  async login(email, password) {
    const [user] = await connection.execute(
      'SELECT id, password, email, is_activated_status FROM users WHERE email = ?',
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
      isActivated: user[0].is_activated_status
    };

    const tokens = await utils.generateAndSaveToken(userData);

    return {
      ...tokens,
      user: userData
    };
  }

  async logout(refreshToken) {
    await tokenService.removeToken(refreshToken);
  }
}

module.exports = new UserService();
