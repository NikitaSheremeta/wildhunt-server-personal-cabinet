const ApiError = require('../exceptions/api-error');
const statusCodesHelper = require('../helpers/status-codes-helper');

// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors
    });
  }

  return res
    .status(statusCodesHelper.httpStatus.INTERNAL_SERVER_ERROR.code)
    .json({ message: err.message });
};
