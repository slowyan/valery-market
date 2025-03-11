const User = require('../models/User');

// Получение профиля пользователя
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-verificationCode -password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Находим пользователя
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверяем, не занят ли email другим пользователем
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email уже используется' });
            }
        }

        // Обновляем данные
        user.name = name || user.name;
        if (email) user.email = email;

        await user.save();

        // Отправляем обновленные данные без чувствительной информации
        const updatedUser = await User.findById(user._id).select('-verificationCode -password');
        res.json(updatedUser);
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}; 