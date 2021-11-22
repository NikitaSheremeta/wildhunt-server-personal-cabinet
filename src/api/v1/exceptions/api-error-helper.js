const statusCodesHelper = require('../utils/status-codes-helper');

module.exports = class ApiErrorHelper extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = []) {
    return new ApiErrorHelper(
      statusCodesHelper.httpStatus.BAD_REQUEST.code,
      message,
      errors
    );
  }

  static unauthorizedError() {
    return new ApiErrorHelper(
      statusCodesHelper.httpStatus.UNAUTHORIZED.code,
      'Пользователь не авторизован'
    );
  }

  static forbiddenError() {
    return new ApiErrorHelper(
      statusCodesHelper.httpStatus.UNAUTHORIZED.code,
      'Пользователю отказано в доступе к запрашиваемому ресурсу'
    );
  }

  // Only for mail.ru addresses
  static invalidMailbox() {
    return new ApiErrorHelper(
      statusCodesHelper.smtpStatus.MAILBOX_UNAVAILABLE.code,
      `Почтовый адрес не найден X_X`
    );
  }
};
