const ApiErrorHelper = require('../exceptions/api-error-helper');
const statusCodesHelper = require('../utils/status-codes-helper');

// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  if (err instanceof ApiErrorHelper) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors
    });
  }

  return res
    .status(statusCodesHelper.httpStatus.INTERNAL_SERVER_ERROR.code)
    .json({ message: err.message });
};
