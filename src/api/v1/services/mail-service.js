const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
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

  prepareActivationTemplate(link) {
    const filepath = path.join(
      __dirname,
      '..',
      'templates',
      'activation-mail-template.html'
    );

    return new Promise((resolve, reject) => {
      fs.readFile(filepath, 'utf-8', (error, content) => {
        if (error) {
          reject(error);
        }

        const handlebarsTemplate = Handlebars.compile(content);
        const template = handlebarsTemplate({ link });

        resolve(template);
      });
    });
  }

  async sendActivationMail(to, link) {
    try {
      const activationTemplate = await this.prepareActivationTemplate(link);

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта Minecraft Wild Hunt',
        text: '',
        html: activationTemplate
      });
    } catch (err) {
      throw ApiError.badRequest(
        'Ошибка при отпраке письма, попробуйте позже :('
      );
    }
  }

  async sendResetMail(to, link) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Сброс пароля Minecraft Wild Hunt',
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
        'Ошибка при отпраке письма, попробуйте позже :('
      );
    }
  }
}

module.exports = new MailService();
