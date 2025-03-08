# Настройка Ubuntu 22.04 LTS для веб-проекта на Jino VPS

## 1. Подготовка к работе

1. Получите данные для подключения из панели управления Jino:
   - Доменное имя сервера (*.your-ip.serv00.jino.ru)
   - Пароль root
   - Порт SSH (обычно 22)

2. Подключение к серверу:
```bash
ssh root@ваш_сервер.serv00.jino.ru
```

3. Обновление системы:
```bash
apt update
apt upgrade -y
apt install -y software-properties-common
```

4. Настройка временной зоны:
```bash
timedatectl set-timezone Europe/Moscow
```

5. Создание пользователя для деплоя:
```bash
adduser deploy
usermod -aG sudo deploy
```

6. Настройка SSH:
```bash
# На вашем локальном компьютере (Windows PowerShell):
ssh-keygen -t ed25519 -C "ваш_email@example.com"
type $env:USERPROFILE\.ssh\id_ed25519.pub | clip

# На сервере:
mkdir -p /home/deploy/.ssh
# Вставьте скопированный ключ в следующую команду:
echo "вставьте_сюда_ваш_публичный_ключ" >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

7. Настройка файрвола:
```bash
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## 2. Установка необходимого ПО

1. Установка Node.js 18:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Проверка версии
node --version
npm --version
```

2. Установка PM2:
```bash
npm install -g pm2
pm2 startup systemd
```

3. Установка Nginx:
```bash
apt install -y nginx

# Проверка статуса
systemctl status nginx
```

4. Установка MongoDB:
```bash
# Импорт публичного ключа
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor

# Создание файла источника
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Установка MongoDB
apt update
apt install -y mongodb-org

# Запуск и включение автозапуска
systemctl start mongod
systemctl enable mongod

# Проверка статуса
systemctl status mongod
```

5. Установка дополнительных инструментов:
```bash
apt install -y git curl htop
```

## 3. Настройка Nginx

1. Создание конфигурации сайта:
```bash
nano /etc/nginx/sites-available/ecommerce
```

2. Добавьте базовую конфигурацию:
```nginx
server {
    listen 80;
    server_name ваш_сервер.serv00.jino.ru;
    
    # Логи
    access_log /var/log/nginx/ecommerce.access.log;
    error_log /var/log/nginx/ecommerce.error.log;

    # Настройки прокси
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Дополнительные настройки безопасности
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Настройки для больших файлов
    client_max_body_size 20M;
    
    # Настройки кеширования статики
    location /static {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

3. Активация конфигурации:
```bash
ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 4. Настройка SSL (Let's Encrypt)

1. Установка Certbot:
```bash
apt install -y certbot python3-certbot-nginx
```

2. Получение сертификата:
```bash
certbot --nginx -d ваш_домен.com
```

## 5. Настройка автоматического обновления системы

1. Установка unattended-upgrades:
```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## 6. Настройка мониторинга

1. Настройка логирования PM2:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 7. Настройка резервного копирования

1. Создание скрипта для бэкапа:
```bash
mkdir -p /backup/mongodb
nano /usr/local/bin/backup-mongo.sh
```

2. Содержимое скрипта:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/mongodb"

# Создание бэкапа
mongodump --out "$BACKUP_DIR/$DATE"

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR/* -type d -mtime +7 -exec rm -rf {} \;
```

3. Настройка прав и расписания:
```bash
chmod +x /usr/local/bin/backup-mongo.sh
crontab -e

# Добавьте строку для ежедневного бэкапа в 2 часа ночи:
0 2 * * * /usr/local/bin/backup-mongo.sh
```

## Дополнительные рекомендации для Jino VPS

1. Мониторинг доступности:
```bash
# Установка утилиты для мониторинга
apt install -y monitoring-plugins-basic

# Создание скрипта проверки
nano /usr/local/bin/check-web.sh
```

2. Содержимое скрипта мониторинга:
```bash
#!/bin/bash
curl -f http://localhost:3000/api/health || systemctl restart ecommerce-app
```

3. Настройка автоматической проверки:
```bash
chmod +x /usr/local/bin/check-web.sh
crontab -e

# Добавьте строку для проверки каждые 5 минут:
*/5 * * * * /usr/local/bin/check-web.sh
```

4. Настройка оповещений о перезагрузке (опционально):
```bash
apt install -y postfix
# Выберите "Internet Site" при установке

nano /etc/systemd/system/server-startup-notification.service
```

5. Содержимое сервиса оповещений:
```ini
[Unit]
Description=Server Startup Notification
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/mail -s "Server Restarted" ваш_email@example.com < /dev/null

[Install]
WantedBy=multi-user.target
```

6. Активация сервиса оповещений:
```bash
systemctl enable server-startup-notification.service
``` 