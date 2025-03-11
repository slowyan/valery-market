#!/bin/bash

# Остановка текущего приложения
pm2 stop valery-market-server

# Переход в директорию проекта
cd /var/www/valery-market

# Обновление кода из репозитория
git pull origin main

# Установка зависимостей
cd client && npm install --production
cd ../server && npm install --production

# Сборка клиентской части
cd ../client
npm run build

# Запуск приложения через PM2
cd ..
pm2 start ecosystem.config.js --env production

# Сохранение конфигурации PM2
pm2 save

# Проверка статуса
pm2 status 