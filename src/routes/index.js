const express = require('express');
const statusCode = require('../utils/status-code');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.json({ user: 'user', password: 'password' });
  } catch (err) {
    res.status(statusCode.serverError.code).json({
      message: statusCode.serverError.message
    });
  }
});

module.exports = router;
