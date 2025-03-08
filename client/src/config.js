const config = {
  // В production API находится на том же домене
  API_URL: process.env.NODE_ENV === 'production' 
    ? '/api'
    : process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
};

export default config; 