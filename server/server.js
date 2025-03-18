const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Создаем папку uploads если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Копируем placeholder если его нет
const placeholderSrc = path.join(__dirname, 'assets', 'placeholder.jpg');
const placeholderDest = path.join(uploadsDir, 'placeholder.jpg');
if (!fs.existsSync(placeholderDest) && fs.existsSync(placeholderSrc)) {
  fs.copyFileSync(placeholderSrc, placeholderDest);
  console.log('Copied placeholder image');
}

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Роуты
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Раздача клиентского приложения
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Подключение к базе данных
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 