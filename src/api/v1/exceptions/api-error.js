const statusCodesUtils = require('../utils/status-codes-utils');
const technicalMessagesUtils = require('../utils/technical-messages-utils');

module.exports = class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = []) {
    return new ApiError(
      statusCodesUtils.httpStatus.BAD_REQUEST.code,
      message,
      errors
    );
  }

  static unauthorizedError() {
    return new ApiError(
      statusCodesUtils.httpStatus.UNAUTHORIZED.code,
      technicalMessagesUtils.apiErrorMessages.UNAUTHORIZED
    );
  }

  static forbiddenError() {
    return new ApiError(
      statusCodesUtils.httpStatus.FORBIDDEN.code,
      technicalMessagesUtils.apiErrorMessages.FORBIDDEN
    );
  }
};
