const config = {
  // В production API находится на том же домене
  API_URL: process.env.NODE_ENV === 'production' 
    ? '/api'
    : 'http://localhost:5000/api'
};

export default config; 