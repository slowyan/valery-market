require('dotenv').config();

const development = {
    port: process.env.PORT || 5000,
    mongoUri: 'mongodb://localhost:27017/valery-market-dev',
    jwtSecret: process.env.JWT_SECRET,
    // Добавьте здесь конфигурацию для SMS-сервиса
    sms: {
        enabled: true,
        provider: 'sms.ru',
        apiKey: process.env.SMS_RU_API_KEY
    }
};

const production = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/valery-market-prod',
    jwtSecret: process.env.JWT_SECRET,
    // Добавьте здесь конфигурацию для SMS-сервиса
    sms: {
        enabled: true,
        provider: 'sms.ru',
        apiKey: process.env.SMS_RU_API_KEY
    }
};

module.exports = process.env.NODE_ENV === 'production' ? production : development; 