const config = {
  development: {
    apiUrl: 'http://localhost:5000/api'
  },
  production: {
    apiUrl: 'https://22000e1ac334.vps.myjino.ru/api'
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment]; 