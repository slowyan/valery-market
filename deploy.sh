#!/bin/bash

echo "Deploying Valery Market to production..."

# Переходим в директорию проекта
cd /var/www/valery-market

# Получаем последние изменения
git pull origin main

# Устанавливаем зависимости сервера
cd server
npm install --production

# Перезапускаем PM2
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# Устанавливаем зависимости клиента и собираем
cd ../client
npm install
npm run build

# Перезагружаем Nginx
sudo systemctl reload nginx

echo "Deployment completed!" 