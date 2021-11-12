const unauthorizedError = 401;
const badRequest = 400;

module.exports = class ApiError extends Error {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static unauthorizedError() {
    return new ApiError(unauthorizedError, 'Пользователь не авторизован');
  }

  static badRequest(message, errors = []) {
    return new ApiError(badRequest, message, errors);
  }
};
