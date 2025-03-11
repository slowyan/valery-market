#!/bin/bash

# Остановка текущего приложения
pm2 stop valery-market-server

# Переход в директорию проекта
cd /var/www/valery-market

# Обновление кода из репозитория
git pull origin main

# Переходим в директорию клиента
cd client

# Устанавливаем зависимости и собираем проект
echo "Installing client dependencies..."
npm install
echo "Building client..."
npm run build

# Переходим в директорию сервера
cd ../server

# Устанавливаем зависимости сервера
echo "Installing server dependencies..."
npm install

# Запускаем приложение через PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2
pm2 save

echo "Deployment completed!"

# Проверка статуса
pm2 status 