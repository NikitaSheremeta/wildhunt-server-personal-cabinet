const connection = require('../config/connection');

class UserData {
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
      'INSERT INTO users (user_name, email, birth_date, password) VALUES (?, ?, ?, ?)',
      [
        userData.userName,
        userData.email,
        userData.birthDate,
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

  async recordUserActivationLink(userId, activationLink) {
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

  async getUserSiteRoles(id) {
    const sql =
      'SELECT s.identifier ' +
      'FROM user_roles AS u ' +
      'INNER JOIN site_roles AS s ' +
      'WHERE u.site_role_id = s.id ' +
      'AND u.user_id = ?';

    const [roles] = await connection.execute(sql, [id], (err) =>
      console.error(err)
    );

    return roles.length > 0 ? roles : false;
  }
}

module.exports = new UserData();
