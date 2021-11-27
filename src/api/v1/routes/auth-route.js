const express = require('express');
const authValidation = require('../validations/auth-validation');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.post('/registration', authValidation(), authController.registration);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);

router.get('/activate/:link', authController.activate);
router.get('/reset/:link', authController.resetPassword);
router.get('/refresh', authController.refresh);

module.exports = router;
