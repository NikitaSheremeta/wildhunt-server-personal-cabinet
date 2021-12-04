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
      const activationTemplate = await utils.prepareMailTemplate(
        'activation-mail-template',
        { link }
      );

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта Minecraft Wild Hunt',
        text: '',
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
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Сброс пароля учетной записи Minecraft Wild Hunt',
        text: '',
        html: `
          <div>
            <h1>
              Для сброса пароля перейдите по ссылке ниже
            </h1>
            <a href="${link}">${link}</a>
          </div>
        `
      });
    } catch (err) {
      throw ApiError.badRequest(
        'Ошибка при отпраке письма, возможно, почтовый ящик не существет :('
      );
    }
  }

  async sendNewPasswordMail(to, password) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Новый пароль для учетной записи Minecraft Wild Hunt',
        text: '',
        html: `
          <div>
            <h1>
              Ваш новый пароль, вот, держите:
            </h1>
            <p>${password}</p>
          </div>
        `
      });
    } catch (err) {
      throw ApiError.badRequest(
        'Ошибка при отпраке письма, возможно, почтовый ящик не существет :('
      );
    }
  }
}

module.exports = new MailService();
