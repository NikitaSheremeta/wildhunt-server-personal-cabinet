const statusCodesHelper = require('../helpers/status-codes-helper');

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
      statusCodesHelper.httpStatus.BAD_REQUEST.code,
      message,
      errors
    );
  }

  static unauthorizedError() {
    return new ApiError(
      statusCodesHelper.httpStatus.UNAUTHORIZED.code,
      'Пользователь не авторизован'
    );
  }

  // Only for mail.ru addresses
  static invalidMailbox() {
    return new ApiError(
      statusCodesHelper.smtpStatus.MAILBOX_UNAVAILABLE.code,
      `Почтовый адрес не найден X_X`
    );
  }
};
