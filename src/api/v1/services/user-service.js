const bcrypt = require('bcrypt');
const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');
const connection = require('../../config/connection');
const mailService = require('./mail-service');
const utils = require('../utils/utils');
const tokenService = require('./token-service');

const isActivatedStatus = 1;

class UserService {
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
      'SELECT id, email, is_activated_status FROM users WHERE id = ?',
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

  async userConfirmation(email, userId) {
    const activationLink = uuid.v4();

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/v1/activate/${activationLink}`
    );

    await connection.execute(
      'INSERT INTO activation_links (user_id, link) VALUES (?, ?)',
      [userId, activationLink],
      (err) => console.error(err)
    );
  }
}

module.exports = new UserService();
