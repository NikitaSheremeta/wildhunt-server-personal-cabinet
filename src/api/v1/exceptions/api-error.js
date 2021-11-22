const statusCodesUtils = require('../utils/status-codes-utils');

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
      'Пользователь не авторизован'
    );
  }

  static forbiddenError() {
    return new ApiError(
      statusCodesUtils.httpStatus.UNAUTHORIZED.code,
      'Пользователю отказано в доступе к запрашиваемому ресурсу'
    );
  }

  // Only for mail.ru addresses
  static invalidMailbox() {
    return new ApiError(
      statusCodesUtils.smtpStatus.MAILBOX_UNAVAILABLE.code,
      `Почтовый адрес не найден X_X`
    );
  }
};
