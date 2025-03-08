# Настройка VPS для деплоя

## 1. Первоначальная настройка сервера

1. Подключитесь к серверу по SSH:
```bash
ssh root@ваш_ip_адрес
```

2. Обновите систему:
```bash
apt update && apt upgrade -y
```

3. Установите необходимые пакеты:
```bash
apt install -y curl git build-essential nginx
```

4. Создайте нового пользователя:
```bash
adduser deploy
usermod -aG sudo deploy
```

5. Настройте SSH-ключи для безопасности:
```bash
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

## 2. Установка Node.js и PM2

1. Установите Node.js 18.x:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

2. Установите PM2 глобально:
```bash
npm install -g pm2
```

3. Настройте автозапуск PM2:
```bash
pm2 startup systemd
```

## 3. Установка и настройка MongoDB

1. Установите MongoDB:
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
```

2. Запустите MongoDB:
```bash
systemctl start mongod
systemctl enable mongod
```

3. Создайте пользователя MongoDB:
```bash
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "ваш_сложный_пароль",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
exit
```

## 4. Настройка Nginx

1. Создайте конфигурацию Nginx:
```bash
nano /etc/nginx/sites-available/ecommerce
```

2. Добавьте следующую конфигурацию:
```nginx
server {
    listen 80;
    server_name ваш_домен.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Активируйте конфигурацию:
```bash
ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 5. Настройка SSL с Let's Encrypt

1. Установите Certbot:
```bash
apt install -y certbot python3-certbot-nginx
```

2. Получите SSL сертификат:
```bash
certbot --nginx -d ваш_домен.com
```

## 6. Деплой приложения

1. Перейдите в домашнюю директорию пользователя deploy:
```bash
cd /home/deploy
```

2. Клонируйте репозиторий:
```bash
git clone ваш_репозиторий
cd имя_проекта
```

3. Установите зависимости:
```bash
cd server
npm install
cd ../client
npm install
npm run build
cp -r build ../server/
```

4. Создайте файл с переменными окружения:
```bash
cd ../server
nano .env
```

Добавьте следующие переменные:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=ваш_сложный_секрет
CLIENT_URL=https://ваш_домен.com
```

5. Запустите приложение через PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

## 7. Настройка файрвола (UFW)

1. Настройте базовые правила:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## 8. Мониторинг и обслуживание

- Просмотр логов приложения: `pm2 logs`
- Перезапуск приложения: `pm2 restart ecommerce-app`
- Просмотр статуса: `pm2 status`
- Мониторинг системы: `htop` (установите командой `apt install htop`)

## 9. Резервное копирование

1. Настройте резервное копирование MongoDB:
```bash
mongodump --out /backup/$(date +%Y%m%d)
```

2. Добавьте задачу в cron для ежедневного бэкапа:
```bash
crontab -e
# Добавьте строку:
0 0 * * * mongodump --out /backup/$(date +%Y%m%d)
``` 