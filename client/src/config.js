const config = {
  development: {
    apiUrl: 'http://localhost:5000/api',
    baseUrl: 'http://localhost:5000'
  },
  production: {
    apiUrl: 'https://22000e1ac334.vps.myjino.ru/api',
    baseUrl: 'https://22000e1ac334.vps.myjino.ru'
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment]; 