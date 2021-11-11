const express = require('express');

const router = express.Router();

router.post('/registration');
router.post('/login');
router.post('/logout');

router.get('/activate/:link');
router.get('/refresh');
router.get('/users');

module.exports = router;
