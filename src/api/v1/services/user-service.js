const bcrypt = require('bcrypt');
const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');
const connection = require('../../config/connection');
const mailService = require('./mail-service');
const utils = require('../utils/utils');
const tokenService = require('./token-service');

class UserService {
  async login(email, password) {
    const [user] = await connection.execute(
      'SELECT id, password, email, is_activation_status FROM users WHERE email = ?',
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
      isActivated: user[0].is_activation_status
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

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDB) {
      throw ApiError.unauthorizedError();
    }

    const [user] = await connection.execute(
      'SELECT id, email, is_activation_status FROM users WHERE id = ?',
      [userData.id],
      (err) => console.error(err)
    );

    const tokens = await utils.generateAndSaveToken(user[0]);

    return {
      ...tokens,
      user: user[0]
    };
  }

  // ===========================================================================

  async getUserByEmail(email) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err) => console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async createUser(userData) {
    const [user] = await connection.execute(
      'INSERT INTO users (user_name, email, birth_date, registration_date, password) VALUES (?, ?, ?, ?, ?)',
      [
        userData.userName,
        userData.email,
        userData.birthDate,
        userData.registrationDate,
        userData.password
      ],
      (err) => console.error(err)
    );

    await connection.execute(
      'INSERT INTO user_roles (user_id) VALUE (LAST_INSERT_ID())',
      [],
      (err) => console.error(err)
    );

    return user;
  }

  async confirmUser(email, userId) {
    const activationLink = uuid.v4();

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    );

    await connection.execute(
      'INSERT INTO activation_links (user_id, link) VALUES (?, ?)',
      [userId, activationLink],
      (err) => console.error(err)
    );
  }

  async checkUserActivationLink(activationLink) {
    const sql =
      'SELECT u.id, u.is_activation_status ' +
      'FROM users AS u ' +
      'INNER JOIN activation_links AS a ' +
      'WHERE u.id = a.user_id ' +
      'AND a.link = ?';

    const [user] = await connection.execute(sql, [activationLink], (err) =>
      console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async updateUserActivationStatus(userId) {
    await connection.execute(
      'UPDATE users SET is_activation_status = ? WHERE users.id = ?',
      [1, userId],
      (err) => console.error(err)
    );
  }
}

module.exports = new UserService();
