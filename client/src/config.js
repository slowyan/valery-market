const config = {
  development: {
    apiUrl: 'http://localhost:5000/api',
    baseUrl: 'http://localhost:5000',
    uploadsUrl: 'http://localhost:5000'
  },
  production: {
    apiUrl: 'https://22000e1ac334.vps.myjino.ru/api',
    baseUrl: 'https://22000e1ac334.vps.myjino.ru',
    uploadsUrl: 'https://22000e1ac334.vps.myjino.ru'
  }
};

// Определяем окружение на основе текущего URL
const isProduction = window.location.hostname !== 'localhost';
const environment = isProduction ? 'production' : 'development';

console.log('Current environment:', environment);
console.log('Current config:', config[environment]);

export default config[environment]; 