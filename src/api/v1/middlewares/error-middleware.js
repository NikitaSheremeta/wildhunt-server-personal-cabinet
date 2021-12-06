const ApiError = require('../exceptions/api-error');
const statusCodesUtils = require('../utils/status-codes-utils');

// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      errors: err.errors
    });
  }

  return res
    .status(statusCodesUtils.httpStatus.INTERNAL_SERVER_ERROR.code)
    .json({ message: err.message });
};
