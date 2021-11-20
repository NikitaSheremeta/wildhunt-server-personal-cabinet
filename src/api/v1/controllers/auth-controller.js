const authService = require('../services/auth-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
const utils = require('../utils/utils');

// eslint-disable-next-line no-magic-numbers
const thirtyDays = 30 * 24 * 60 * 60 * 1000;

class AuthController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(
          ApiError.badRequest(
            'Ошибка валидации введеных данных -_-',
            errors.array()
          )
        );
      }

      const userInputData = {
        userName: req.body.userName,
        email: req.body.email,
        birthDate: req.body.birthDate,
        registrationDate: utils.getCurrentDate(),
        password: req.body.password
      };

      const userData = await authService.userRegistration(userInputData);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: thirtyDays,
        httpOnly: true
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async activate(req, res, next) {
    try {
      await authService.userActivation(req.params.link);

      return res.redirect(process.env.API_URL);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
