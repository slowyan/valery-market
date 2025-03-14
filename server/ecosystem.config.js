module.exports = {
  apps: [{
    name: 'valery-market-server',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000,
      MONGO_URI: process.env.MONGO_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      SMS_RU_API_KEY: process.env.SMS_RU_API_KEY
    }
  }]
}; 