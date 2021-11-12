const badRequest = 400;
const unauthorizedError = 401;

module.exports = class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = []) {
    return new ApiError(badRequest, message, errors);
  }

  static unauthorizedError() {
    return new ApiError(unauthorizedError, 'Пользователь не авторизован');
  }

  static invalidMailbox(code) {
    return new ApiError(code, `Почтовый адрес не найден X_X`);
  }
};
