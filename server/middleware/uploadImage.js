const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем директорию uploads, если она не существует
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  // Разрешенные типы файлов
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP.'), false);
  }
};

// Создаем middleware для загрузки
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

// Middleware для загрузки одного файла
const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Ошибка multer
      return res.status(400).json({
        success: false,
        message: `Ошибка загрузки файла: ${err.message}`
      });
    } else if (err) {
      // Другая ошибка
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Если файл загружен успешно, добавляем путь к файлу в req.body
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    next();
  });
};

// Middleware для проверки наличия файла
const processImage = (req, res, next) => {
  if (!req.file && req.method === 'POST') {
    return res.status(400).json({
      success: false,
      message: 'Пожалуйста, загрузите изображение'
    });
  }
  next();
};

module.exports = {
  uploadImage,
  processImage
}; 
 