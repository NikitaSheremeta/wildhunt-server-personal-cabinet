const nodemailer = require('nodemailer');

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
  }
}

module.exports = new MailService();
