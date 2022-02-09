module.exports = class ErrorDTO {
  error = {
    message: ''
  };

  constructor(message) {
    this.error.message = message;
  }
};
