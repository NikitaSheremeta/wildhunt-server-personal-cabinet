class TechnicalMessagesUtils {
  get apiErrorMessages() {
    return {
      UNAUTHORIZED: 'Пользователь не авторизован',
      FORBIDDEN: 'Пользователю отказано в доступе к запрашиваемому ресурсу'
    };
  }

  get authMessages() {
    return {
      NICKNAME_IS_ALREADY_REGISTERED:
        'Пользователь с таким никнеймом уже зарегистрирован x_x',
      EMAIL_IS_ALREADY_REGISTERED:
        'Пользователь с таким почтовым адресом уже зарегистрирован >_<',
      USER_IS_NOT_FOUND: 'Пользователь не найден :/',
      WRONG_LOGIN_OR_PASSWORD: 'Неверный лоин или пароль T_T',
      ROLES_NOT_FOUND: 'Роли не обнаружены х_X',
      INVALID_LINK: 'Ссылка Недействительна o_()',
      EMAIL_ADDRESS_NOT_FOUND:
        'Пользователь с таким почтовым адресом не найден -_-',
      PASSWORD_RECOVERY_INSTRUCTIONS:
        'Инструкция по восстановлению пароля - отправлена на ваш почтовый ящик ^_^',
      LINK_EXPIRED: 'Срок действия ссылки истек x_o',
      USER_NOT_FOUND: 'Пользователь не найден o_()'
    };
  }

  get mailMessages() {
    return {
      ACTIVATION_MAIL_SUBJECT: 'Активация учетной записи Minecraft Wild Hunt',
      RESET_MAIL_SUBJECT:
        'Восстановление пароля учетной записи Minecraft Wild Hunt',
      NEW_PASSWORD_SUBJECT:
        'Новый пароль для учетной записи Minecraft Wild Hunt',
      ERROR_SENDING_EMAIL:
        'Ошибка при отпраке письма, возможно, почтовый ящик не существет :('
    };
  }

  get tokenMessages() {
    return {
      TRY_AGAIN_LATER: 'Повторите попытку позже'
    };
  }
}

module.exports = new TechnicalMessagesUtils();
