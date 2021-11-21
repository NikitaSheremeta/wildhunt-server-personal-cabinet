const ApiErrorHelper = require('../helpers/api-error-helper');
const tokenService = require('../services/token-service');

module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(ApiErrorHelper.unauthorizedError());
    }

    const bearer = authorizationHeader.split(' ')[0];
    const accessToken = authorizationHeader.split(' ')[1];

    if (bearer !== 'Bearer' || !accessToken) {
      return next(ApiErrorHelper.unauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(ApiErrorHelper.unauthorizedError());
    }

    req.user = userData;

    next();
  } catch (err) {
    return next(ApiErrorHelper.unauthorizedError());
  }
};
