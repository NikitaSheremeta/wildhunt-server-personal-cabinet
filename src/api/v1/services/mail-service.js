const nodemailer = require('nodemailer');
const statusCodesHelper = require('../utils/status-codes-helper');
const ApiErrorHelper = require('../exceptions/api-error-helper');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendActivationMail(to, link) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта Minecraft Wild Hunt',
        text: '',
        html: `
          <div>
            <h1>
              Для Активации аккаунта перейдите по ссылке ниже
            </h1>
            <a href="${link}">${link}</a>
          </div>
        `
      });
    } catch (err) {
      if (
        err.responseCode ===
        statusCodesHelper.smtpStatus.MAILBOX_UNAVAILABLE.code
      ) {
        throw ApiErrorHelper.invalidMailbox(err.responseCode);
      }

      throw ApiErrorHelper.badRequest(
        'Ошибка при отпраке письма, попробуйте позже :('
      );
    }
  }
}

module.exports = new MailService();
