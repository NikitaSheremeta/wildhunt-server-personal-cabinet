const connection = require('../config/mysql-connection');

class UserData {
  // SELECT

  async getUserById(userId) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId],
      (err) => console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async getUserByName(userName) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE user_name = ?',
      [userName],
      (err) => console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async getUserByEmail(userEmail) {
    const [user] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [userEmail],
      (err) => console.error(err)
    );

    return user.length > 0 ? user[0] : false;
  }

  async getUserByActivationLink(activationLink) {
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

  async getAllUsers() {
    const [users] = await connection.execute('SELECT * FROM users', [], (err) =>
      console.error(err)
    );

    return users.length > 0 ? users : false;
  }

  async getUserRoles(userId) {
    const sql =
      'SELECT s.identifier ' +
      'FROM user_roles AS u ' +
      'INNER JOIN roles AS s ' +
      'WHERE u.site_role_id = s.id ' +
      'AND u.user_id = ?';

    const [roles] = await connection.execute(sql, [userId], (err) =>
      console.error(err)
    );

    return roles.length > 0 ? roles : false;
  }

  // INSERT

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

  async createUserActivationLink(userId, activationLink) {
    await connection.execute(
      'INSERT INTO activation_links (user_id, link) VALUES (?, ?)',
      [userId, activationLink],
      (err) => console.error(err)
    );
  }

  // UPDATE

  async updateUserPassword(userID, password) {
    await connection.execute(
      'UPDATE users SET password = ? WHERE users.id = ?',
      [password, userID],
      (err) => console.error(err)
    );
  }

  async updateUserActivationStatus(userId) {
    const sql =
      'UPDATE users, activation_links ' +
      'SET users.is_activation_status = ?, ' +
      'activation_links.activation_date = now() ' +
      'WHERE users.id = ? ' +
      'AND activation_links.user_id = ?';

    await connection.execute(sql, [1, userId, userId], (err) =>
      console.error(err)
    );
  }
}

module.exports = new UserData();
