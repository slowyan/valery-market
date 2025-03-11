require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/valery-market',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    // Добавьте здесь конфигурацию для SMS-сервиса
    sms: {
        enabled: process.env.NODE_ENV !== 'development',
        provider: 'sms.ru',
        apiKey: process.env.SMS_RU_API_KEY
    }
}; 