const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const guardUtils = require('../utils/guard-utils');
const userController = require('../controllers/user-controller');

const router = express.Router();

router.get(
  '/all',
  authMiddleware(guardUtils.routeAccess.users),
  userController.getUsers
);

module.exports = router;
