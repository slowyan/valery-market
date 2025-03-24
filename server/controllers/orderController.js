const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const YooKassa = require('yookassa');
const { v4: uuidv4 } = require('uuid');

// Инициализация клиента ЮKassa
const yooKassa = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID || '123456',
  secretKey: process.env.YOOKASSA_SECRET_KEY || 'test_RvNKVamCJu1tErIO0v6MJyTXsRqTtBfhkDTMO8iMiNM'
});

const orderController = {
  // Получение всех заказов (для админа)
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find({ paymentStatus: 'succeeded' })
        .populate({
          path: 'items.product',
          select: 'name price image quantity inStock infiniteStock'
        })
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        orders: orders.map(order => ({
          ...order.toObject(),
          createdAt: order.createdAt,
          formattedDate: new Date(order.createdAt).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
      });
    } catch (error) {
      console.error('Ошибка при получении заказов:', error);
      res.status(500).json({ 
        success: false,
        message: 'Ошибка при получении списка заказов' 
      });
    }
  },

  // Создание нового заказа
  createOrder: async (req, res) => {
    try {
      console.log('Получен запрос на создание заказа:', req.body);
      
      const { items, shippingAddress, contactPhone, totalAmount } = req.body;

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

      const { city, street, house, postalCode } = shippingAddress;
      if (!city || !street || !house || !postalCode) {
        return res.status(400).json({
          success: false,
          message: 'Не все поля адреса доставки заполнены'
        });
      }

      // Получаем userId из токена
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (error) {
          console.log('Ошибка при проверке токена:', error);
          // Продолжаем без userId для неавторизованных пользователей
        }
      }

      const formattedItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Товар ${item.name} не найден`
          });
        }

        if (!product.infiniteStock) {
          if (!product.inStock || product.quantity < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Товар ${product.name} недоступен в запрошенном количестве. Доступно: ${product.quantity}`
            });
          }

          product.quantity -= item.quantity;
          product.inStock = product.quantity > 0;
          await product.save();

          console.log(`Обновлено количество товара ${product.name}: ${product.quantity}`);
        }

        formattedItems.push({
          product: product._id,
          quantity: item.quantity,
          price: item.price
        });
      }

      const order = new Order({
        customerName: shippingAddress.customerName,
        email: shippingAddress.email,
        phone: contactPhone,
        address: `${shippingAddress.city}, ${shippingAddress.street}, д. ${shippingAddress.house}${shippingAddress.apartment ? `, кв. ${shippingAddress.apartment}` : ''}, ${shippingAddress.postalCode}`,
        items: formattedItems,
        totalAmount,
        userId: userId,
        status: 'new',
        paymentStatus: 'pending'
      });

      await order.save();

      // Создаем платеж в ЮKassa
      try {
        const idempotenceKey = uuidv4();
        const payment = await yooKassa.createPayment({
          amount: {
            value: order.totalAmount.toFixed(2),
            currency: 'RUB'
          },
          confirmation: {
            type: 'redirect',
            return_url: `${process.env.CLIENT_URL}/payment-success`
          },
          capture: true,
          description: `Заказ №${order._id}`,
          metadata: {
            orderId: order._id.toString()
          }
        }, idempotenceKey);

        // Обновляем заказ с информацией о платеже
        order.paymentId = payment.id;
        await order.save();

        // Возвращаем URL для оплаты
        res.status(201).json({
          success: true,
          order,
          paymentUrl: payment.confirmation.confirmation_url
        });
      } catch (paymentError) {
        console.error('Ошибка при создании платежа:', paymentError);
        
        // Если произошла ошибка при создании платежа, все равно возвращаем информацию о заказе
        res.status(201).json({
          success: true,
          order,
          paymentError: 'Не удалось создать платеж. Пожалуйста, попробуйте оплатить позже.'
        });
      }
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Ошибка при создании заказа'
      });
    }
  },

  // Получение заказов пользователя
  getUserOrders: async (req, res) => {
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
  },

  // Обновление статуса заказа (для админа)
  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('items.product');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

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
  },

  // Получение деталей заказа
  getOrderDetails: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('items.product');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      // Если есть ID платежа, проверяем его статус
      if (order.paymentId) {
        try {
          const payment = await yooKassa.getPayment(order.paymentId);
          
          // Обновляем статус оплаты в заказе
          if (payment.status === 'succeeded' && order.paymentStatus !== 'succeeded') {
            order.paymentStatus = 'succeeded';
            order.status = 'processing'; // Меняем статус заказа на "в обработке"
            await order.save();
          } else if (payment.status === 'canceled' && order.paymentStatus !== 'cancelled') {
            order.paymentStatus = 'cancelled';
            order.status = 'cancelled';
            await order.save();
          }
        } catch (paymentError) {
          console.error('Ошибка при проверке статуса платежа:', paymentError);
        }
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Ошибка при получении заказа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении информации о заказе'
      });
    }
  },

  // Отмена заказа
  cancelOrder: async (req, res) => {
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

      if (order.status !== 'new') {
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
  }
};

module.exports = orderController; 