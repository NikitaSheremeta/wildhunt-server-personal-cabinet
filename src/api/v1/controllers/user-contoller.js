const userService = require('../services/user-service');
const { validationResult } = require('express-validator');
const statusCodesHelper = require('../helpers/status-codes-helper');
const ApiError = require('../exceptions/api-error');

// eslint-disable-next-line no-magic-numbers
const thirtyDays = 30 * 24 * 60 * 60 * 1000;

class UserController {
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

      const { email, password } = req.body;
      const userData = await userService.registration(email, password);

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
      await userService.activate(req.params.link);

      return res.redirect(process.env.API_URL);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const userData = await userService.login(email, password);

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
      await userService.logout(refreshToken);

      res.clearCookie('refreshToken');

      return res.json(statusCodesHelper.httpStatus.OK.code);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await userService.refresh(refreshToken);

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

module.exports = new UserController();
