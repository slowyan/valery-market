const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Настройка хранилища для загруженных файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Создаем директорию, если она не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WebP.'), false);
  }
};

// Настройка загрузки
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // максимум 10 файлов
  }
}).array('image', 10); // Изменено с 'images' на 'image'

// Обработка изображений
const processImage = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles = [];

    for (const file of req.files) {
      const outputPath = file.path;
      await sharp(file.path)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath + '_processed');

      // Заменяем оригинальный файл обработанным
      fs.unlinkSync(file.path);
      fs.renameSync(outputPath + '_processed', outputPath);

      processedFiles.push(file);
    }

    req.files = processedFiles;
    next();
  } catch (error) {
    console.error('Ошибка при обработке изображений:', error);
    next(error);
  }
};

module.exports = { upload, processImage }; 
 