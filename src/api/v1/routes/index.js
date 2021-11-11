const express = require('express');
const userController = require('../controllers/user-contoller');

const router = express.Router();

router.post('/registration', userController.registration);
router.post('/login');
router.post('/logout');

router.get('/activate/:link');
router.get('/refresh');
router.get('/users');

module.exports = router;
