const ApiErrorHelper = require('../helpers/api-error-helper');
const tokenService = require('../services/token-service');

module.exports = function (roles) {
  return function (req, res, next) {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        return next(ApiErrorHelper.unauthorizedError());
      }

      const [bearer, accessToken] = authorizationHeader.split(' ');

      if (bearer !== 'Bearer' || !accessToken) {
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
