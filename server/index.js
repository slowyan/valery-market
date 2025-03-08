const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Настройки для production
if (process.env.NODE_ENV === 'production') {
  // Разрешаем запросы только с нашего домена
  app.use(cors({
    origin: process.env.CLIENT_URL
  }));
  
  // Устанавливаем заголовки безопасности
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Routes
app.get('/api/health', (req, res) => {
  res.send('API работает');
});

// Для production: все неопределенные маршруты направляем на React приложение
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Определение порта (Jino использует системную переменную PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 