const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

pool.getConnection(function (err) {
  if (err) {
    throw new Error('MySQL connection is failed');
  }

  console.log('MySQL connection is success');
});

module.exports = pool.promise();
