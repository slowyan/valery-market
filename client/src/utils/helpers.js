// Базовый URL для продакшена
const PRODUCTION_URL = 'https://22000e1ac334.vps.myjino.ru';

// Функция для получения правильного URL изображения
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/uploads/placeholder.jpg';
  
  // Если мы в продакшене
  if (process.env.NODE_ENV === 'production') {
    // Если путь уже содержит полный URL, возвращаем как есть
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Иначе добавляем базовый URL
    return `${PRODUCTION_URL}${imagePath}`;
  }
  
  // В разработке используем относительный путь
  return imagePath;
}; 