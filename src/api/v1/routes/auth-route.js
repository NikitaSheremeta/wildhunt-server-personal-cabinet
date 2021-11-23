const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.post(
  '/registration',
  body('userName').isLength({
    min: 4,
    max: 24
  }),
  body('email').isEmail(),
  body('birthDate').isDate(),
  body('password').isLength({
    min: 8,
    max: 32
  }),
  authController.registration
);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/activate/:link', authController.activate);
router.get('/refresh', authController.refresh);

module.exports = router;
