const { validationResult } = require('express-validator');
const ApiErrorHelper = require('../helpers/api-error-helper');
const utils = require('../utils/utils');
const authService = require('../services/auth-service');
const statusCodesHelper = require('../helpers/status-codes-helper');

// eslint-disable-next-line no-magic-numbers
const thirtyDays = 30 * 24 * 60 * 60 * 1000;

class AuthController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(
          ApiErrorHelper.badRequest(
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

  async login(req, res, next) {
    try {
      const { login, password } = req.body;

      const userData = await authService.userLogin(login, password);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: thirtyDays,
        httpOnly: true
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      await authService.userLogout(refreshToken);

      res.clearCookie('refreshToken');

      return res.json(statusCodesHelper.httpStatus.OK.code);
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

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await authService.userRefreshToken(refreshToken);

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: thirtyDays,
        httpOnly: true
      });

      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
