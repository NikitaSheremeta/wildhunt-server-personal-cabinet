const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user-contoller');

const router = express.Router();

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({
    min: 4,
    max: 32
  }),
  userController.registration
);

router.post('/login');
router.post('/logout');

router.get('/activate/:link', userController.activate);
router.get('/refresh');
router.get('/users');

module.exports = router;
