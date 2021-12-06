const express = require('express');
const authRoute = require('./auth-route');
const userRoute = require('./users-route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);

module.exports = router;
