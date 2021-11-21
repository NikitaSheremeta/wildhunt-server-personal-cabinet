const uuid = require('uuid');
const connection = require('../../config/connection');
const mailService = require('./mail-service');

class UserService {
  async getUserById(id) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id],
      (err) => console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async getUserByEmail(email) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err) => console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async getUserByName(name) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE user_name = ?',
      [name],
      (err) => console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async getAllUsers() {
    const [users] = await connection.execute('SELECT * FROM users', [], (err) =>
      console.error(err)
    );

    return users.length > 0 ? users : false;
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
