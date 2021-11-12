const ApiError = require('../exceptions/api-error');

const internalServer = 500;

// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors
    });
  }
  return res.status(internalServer).json({ message: err.message });
};
