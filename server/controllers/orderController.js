const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Создание нового заказа
exports.createOrder = async (req, res) => {
  try {
    console.log('Получен запрос на создание заказа:', req.body);
    
    const { items, shippingAddress, contactPhone, totalAmount } = req.body;

    // Проверяем наличие всех необходимых полей
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Корзина пуста или неверный формат данных'
      });
    }

    if (!shippingAddress || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Не указан адрес доставки или контактный телефон'
      });
    }

    // Проверяем адрес доставки
    const { city, street, house, postalCode } = shippingAddress;
    if (!city || !street || !house || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Не все поля адреса доставки заполнены'
      });
    }

    // Проверяем авторизацию
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        console.log('Ошибка при проверке токена:', error);
        return res.status(401).json({
          success: false,
          message: 'Недействительный токен авторизации'
        });
      }
    }

    // Загружаем и проверяем доступность товаров
    const formattedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId || item.id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Товар ${item.name} не найден`
        });
      }
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Товар ${product.name} недоступен для заказа`
        });
      }
      formattedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        discount: item.discount || 0
      });
    }

    // Создаем заказ
    const order = new Order({
      userId,
      items: formattedItems,
      totalAmount,
      shippingAddress,
      contactPhone,
      status: 'pending'
    });

    console.log('Создаем заказ:', order);

    await order.save();
    console.log('Заказ успешно сохранен');

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ошибка при создании заказа'
    });
  }
};

// Получение всех заказов (для админа)
exports.getAllOrders = async (req, res) => {
  try {
    console.log('Получен запрос на получение всех заказов');
    console.log('Пользователь:', req.user);

    const orders = await Order.find()
      .sort({ createdAt: -1 }) // Сортировка по дате создания (сначала новые)
      .populate('userId', 'email'); // Подгружаем email пользователя

    console.log('Найдено заказов:', orders.length);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении заказов'
    });
  }
};

// Получение заказов пользователя
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Ошибка при получении заказов пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении заказов'
    });
  }
};

// Обновление статуса заказа (для админа)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса заказа'
    });
  }
};

// Получение деталей заказа
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    // Проверяем права доступа
    if (!req.user.isAdmin && order.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к этому заказу'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Ошибка при получении деталей заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении деталей заказа'
    });
  }
};

// Отмена заказа
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, userId: userId });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Заказ не найден' 
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Заказ нельзя отменить' 
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Ошибка при отмене заказа:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка при отмене заказа' 
    });
  }
}; 