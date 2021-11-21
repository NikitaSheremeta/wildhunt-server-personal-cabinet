const ApiErrorHelper = require('../helpers/api-error-helper');
const tokenService = require('../services/token-service');

module.exports = function (roles) {
  // eslint-disable-next-line
  return function (req, res, next) {
    if (req.method === 'OPTIONS') {
      next();
    }

    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        return next(ApiErrorHelper.unauthorizedError());
      }

      const accessToken = authorizationHeader.split(' ')[1];

      if (!accessToken) {
        return next(ApiErrorHelper.unauthorizedError());
      }

      const userData = tokenService.validateAccessToken(accessToken);

      if (!userData) {
        return next(ApiErrorHelper.unauthorizedError());
      }

      let hasRole = false;

      userData.roles.forEach((role) => {
        if (roles.includes(role)) {
          hasRole = true;
        }
      });

      if (!hasRole) {
        return next(ApiErrorHelper.forbiddenError());
      }

      next();
    } catch (err) {
      return next(ApiErrorHelper.unauthorizedError());
    }
  };
};
