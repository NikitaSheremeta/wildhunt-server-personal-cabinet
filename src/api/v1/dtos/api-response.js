const statusCodesUtils = require('../utils/status-codes-utils');

class ApiResponse {
  successResponse(payload = {}) {
    return {
      success: true,
      data: payload
    };
  }

  errorResponse({ code, message }) {
    return {
      success: false,
      error: {
        code: code || statusCodesUtils.httpStatus.BAD_REQUEST.code,
        message: message || statusCodesUtils.httpStatus.BAD_REQUEST.message
      }
    };
  }
}

module.exports = new ApiResponse();
