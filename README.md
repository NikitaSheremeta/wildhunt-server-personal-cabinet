# minecraft (Back-end side)

### Установка всех зависимостей

```
npm i
```

### Подготовка перед первым запуском

```
npm run prepare
```

В скрипте `prepare` имеется `husky install`, это установка не самой зависимости, а гит-хуков, 
необходимо для корректной работы пре-коммита, иначе он просто не запустится.

### Запуск сервера в dev-режиме

```
npm start
```
