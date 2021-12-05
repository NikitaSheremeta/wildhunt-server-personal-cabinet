const nodemailer = require('nodemailer');
const utils = require('../utils/utils');
const ApiError = require('../exceptions/api-error');

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
      const activationTemplate = await utils.prepareMailTemplate('activation', {
        link
      });

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация учетной записи Minecraft Wild Hunt',
        html: activationTemplate
      });
    } catch (err) {
      throw ApiError.badRequest(
        'Ошибка при отпраке письма, возможно, почтовый ящик не существет :('
      );
    }
  }

  async sendResetMail(to, link) {
    try {
      const resetTemplate = await utils.prepareMailTemplate('reset', { link });

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Восстановление пароля учетной записи Minecraft Wild Hunt',
        html: resetTemplate
      });
    } catch (err) {
      throw ApiError.badRequest(
        'Ошибка при отпраке письма, возможно, почтовый ящик не существет :('
      );
    }
  }

  async sendNewPasswordMail(to, password) {
    try {
      const newPasswordTemplate = await utils.prepareMailTemplate(
        'new-password',
        { password }
      );

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Новый пароль для учетной записи Minecraft Wild Hunt',
        html: newPasswordTemplate
      });
    } catch (err) {
      throw ApiError.badRequest(
        'Ошибка при отпраке письма, возможно, почтовый ящик не существет :('
      );
    }
  }
}

module.exports = new MailService();
