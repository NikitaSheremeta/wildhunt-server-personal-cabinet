const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth-controller');
const userController = require('../controllers/user-contoller');
// const authMiddleware = require('../middlewares/auth-middleware');

const router = express.Router();

router.post(
  '/auth/registration',
  body('userName').isLength({
    min: 4,
    max: 24
  }),
  body('email').isEmail(),
  body('birthDate').isDate(),
  body('password').isLength({
    min: 4,
    max: 32
  }),
  authController.registration
);

router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);

module.exports = router;
