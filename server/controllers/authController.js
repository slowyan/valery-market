const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const smsService = require('../services/smsService');

// Временное хранилище кодов (в реальном приложении следует использовать Redis или другое хранилище)
const verificationCodes = new Map();

const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendCode = async (req, res) => {
    try {
        const { phone } = req.body;
        
        console.log('Получен запрос на отправку кода:', { phone });

        if (!phone || !/^7\d{10}$/.test(phone)) {
            console.log('Неверный формат номера:', phone);
            return res.status(400).json({
                success: false,
                message: 'Неверный формат номера телефона'
            });
        }

        // Генерируем код
        const code = generateVerificationCode();
        console.log('Сгенерирован код:', code);
        
        // Отправляем SMS через наш сервис
        const smsResult = await smsService.sendVerificationCode(phone, code);
        console.log('Результат отправки SMS:', smsResult);
        
        if (!smsResult) {
            throw new Error('Не удалось отправить SMS');
        }
        
        // Сохраняем код
        verificationCodes.set(phone, {
            code,
            timestamp: Date.now(),
            attempts: 0
        });
        console.log('Код сохранен в памяти');

        res.json({
            success: true,
            message: 'Код отправлен'
        });
    } catch (error) {
        console.error('Ошибка при отправке кода:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Ошибка при отправке кода'
        });
    }
};

const verifyCode = async (req, res) => {
    try {
        const { phone, code } = req.body;

        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: 'Не указан телефон или код'
            });
        }

        const verification = verificationCodes.get(phone);
        
        if (!verification) {
            return res.status(400).json({
                success: false,
                message: 'Код подтверждения не был отправлен или истек'
            });
        }

        // Проверяем количество попыток
        if (verification.attempts >= 3) {
            verificationCodes.delete(phone);
            return res.status(400).json({
                success: false,
                message: 'Превышено количество попыток. Запросите новый код'
            });
        }

        // Проверяем время действия кода (5 минут)
        if (Date.now() - verification.timestamp > 5 * 60 * 1000) {
            verificationCodes.delete(phone);
            return res.status(400).json({
                success: false,
                message: 'Код подтверждения истек'
            });
        }

        verification.attempts++;

        if (verification.code !== code) {
            return res.status(400).json({
                success: false,
                message: 'Неверный код'
            });
        }

        // Код верный, удаляем его из хранилища
        verificationCodes.delete(phone);

        // Ищем или создаем пользователя
        let user = await User.findOne({ phone });
        
        if (!user) {
            user = new User({
                phone,
                role: 'user'
            });
            await user.save();
        }

        // Создаем токен
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка при проверке кода:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при проверке кода'
        });
    }
};

// Регистрация пользователя
const register = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
            });
        }

        // Создаем нового пользователя
        const user = new User({
            email,
            password,
            name,
            phone
        });

        await user.save();

        // Создаем токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при регистрации пользователя'
        });
    }
};

// Вход для пользователей
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Находим пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем пароль
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Создаем токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при входе в систему'
        });
    }
};

// Вход для администраторов
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Попытка входа администратора:', { email });

        // Находим пользователя
        const user = await User.findOne({ email });
        console.log('Найден пользователь:', user ? { 
            email: user.email, 
            isAdmin: user.isAdmin,
            hashedPassword: user.password.substring(0, 10) + '...' // Показываем только часть хэша
        } : 'Пользователь не найден');

        if (!user || !user.isAdmin) {
            console.log('Отказано в доступе: пользователь не найден или не является администратором');
            return res.status(401).json({
                success: false,
                message: 'Доступ запрещен'
            });
        }

        // Проверяем пароль
        console.log('Проверяем пароль...');
        console.log('Введенный пароль:', password);
        
        // Пробуем оба метода проверки пароля
        const isMatchBcrypt = await bcrypt.compare(password, user.password);
        const isMatchMethod = await user.comparePassword(password);
        
        console.log('Результаты проверки пароля:', {
            bcrypt: isMatchBcrypt,
            method: isMatchMethod
        });

        if (!isMatchBcrypt) {
            console.log('Отказано в доступе: неверный пароль');
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        console.log('Пароль верный, создаем токен...');

        // Создаем токен
        const token = jwt.sign(
            { 
                userId: user._id,
                isAdmin: user.isAdmin 
            },
            process.env.JWT_SECRET || 'dev-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Токен создан, отправляем ответ...');

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Ошибка при входе администратора:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при входе в систему'
        });
    }
};

module.exports = {
    sendCode,
    verifyCode,
    register,
    login,
    adminLogin
}; 