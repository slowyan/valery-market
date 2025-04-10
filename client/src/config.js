const config = {
  development: {
    apiUrl: 'http://localhost:5000/api',
    baseUrl: 'http://localhost:5000'
  },
  production: {
    apiUrl: 'https://valery-pools.shop/api',
    baseUrl: 'https://valery-pools.shop'
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment]; 