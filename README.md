# valery-market

Проект интернет-магазина строительных материалов с использованием MERN стека (MongoDB, Express, React, Node.js).

## Требования

- Node.js
- MongoDB
- npm или yarn

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/slowyan/valery-market.git
```

2. Установите зависимости для сервера:
```bash
cd server
npm install
```

3. Установите зависимости для клиента:
```bash
cd ../client
npm install
```

4. Создайте файл .env в папке server со следующими переменными:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Запуск

1. Запустите сервер:
```bash
cd server
npm run dev
```

2. В другом терминале запустите клиент:
```bash
cd client
npm start
```

## Деплой

### Подготовка проекта

1. Соберите клиентскую часть:
```bash
cd client
npm run build
```

2. Скопируйте собранную клиентскую часть в папку сервера:
```bash
cp -r build ../server/
```

### Настройка на сервере

1. Настройте Nginx для проксирования запросов
2. Настройте SSL-сертификат через Certbot
3. Настройте MongoDB
4. Настройте PM2 для управления процессом Node.js

### Настройка переменных окружения

На сервере установите следующие переменные окружения:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=https://your-domain.com
```

### Запуск приложения

1. Установите зависимости:
```bash
npm install
```
2. Запустите приложение с PM2:
```bash
pm2 start ecosystem.config.js
```

## Основные функции

- Просмотр каталога строительных материалов
- Детальная информация о товарах
- Корзина покупок
- Регистрация и авторизация пользователей
- Админ-панель для управления товарами

## Технологии

- Frontend: React, Material-UI
- Backend: Node.js, Express
- База данных: MongoDB
- Аутентификация: JWT
