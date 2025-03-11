const config = {
  // В production API находится на том же домене
  API_URL: process.env.NODE_ENV === 'production'
    ? 'http://22000e1ac334.vps.myjino.ru/api'  // Используем полный URL в production
    : 'http://localhost:5000/api'
};

export default config; 