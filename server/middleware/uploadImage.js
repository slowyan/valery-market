const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Создаем директорию для загрузки, если её нет
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'), false);
    }
  }
});

// Middleware для обработки изображения
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Обработка изображения
    await sharp(req.file.buffer)
      .resize(800, 800, { // максимальные размеры
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 }) // конвертируем в webp
      .toFile(filepath);

    // Добавляем путь к файлу в req.body
    req.body.image = `/uploads/${filename}`;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload: upload.single('image'),
  processImage
}; 