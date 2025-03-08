# Интернет-магазин

Проект интернет-магазина с использованием MERN стека (MongoDB, Express, React, Node.js).

## Требования

- Node.js
- MongoDB
- npm или yarn

## Установка

1. Клонируйте репозиторий:
```bash
git clone <url-репозитория>
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

## Деплой на Jino

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

### Настройка хостинга на Jino

1. Войдите в панель управления Jino
2. Создайте новый Node.js сайт
3. Подключитесь к серверу через SSH или SFTP
4. Загрузите файлы проекта в корневую директорию сайта:
   - Все файлы из папки server
   - Файл ecosystem.config.js
   - Папку build

### Настройка переменных окружения

В панели управления Jino установите следующие переменные окружения:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=https://your-domain.com
```

### Запуск приложения

1. Подключитесь к серверу через SSH
2. Перейдите в директорию с проектом
3. Установите зависимости:
```bash
npm install
```
4. Запустите приложение с PM2:
```bash
pm2 start ecosystem.config.js
```

### База данных (MongoDB Atlas)

1. Создайте аккаунт на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Создайте новый кластер (бесплатный M0 подойдет)
3. Настройте доступ к базе данных:
   - Создайте пользователя базы данных
   - Настройте Network Access (добавьте IP адрес вашего сервера на Jino)
4. Получите строку подключения и добавьте её в переменные окружения на Jino

### Обслуживание

- Для просмотра логов: `pm2 logs`
- Для перезапуска приложения: `pm2 restart ecommerce-app`
- Для остановки приложения: `pm2 stop ecommerce-app`
- Для просмотра статуса: `pm2 status`

## Основные функции

- Просмотр списка товаров
- Детальная информация о товаре
- Корзина покупок
- Регистрация и авторизация пользователей
- Админ-панель для управления товарами

## Технологии

- Frontend: React, Material-UI
- Backend: Node.js, Express
- База данных: MongoDB
- Аутентификация: JWT 