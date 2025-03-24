const express = require('express');
const router = express.Router();
const YooKassa = require('yookassa');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Инициализация клиента ЮKassa
const yooKassa = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID || '123456',
  secretKey: process.env.YOOKASSA_SECRET_KEY || 'test_RvNKVamCJu1tErIO0v6MJyTXsRqTtBfhkDTMO8iMiNM'
});

// Создание платежа
router.post('/create', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Находим заказ
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Проверяем, что заказ принадлежит текущему пользователю
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Нет доступа к этому заказу' });
    }

    // Проверяем, нет ли уже успешного платежа для этого заказа
    const existingPayment = await Payment.findOne({ 
      orderId: order._id,
      status: 'succeeded'
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Заказ уже оплачен' });
    }

    // Создаем платеж в ЮKassa
    const idempotenceKey = uuidv4();
    const payment = await yooKassa.createPayment({
      amount: {
        value: order.totalAmount.toFixed(2),
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${orderId}/success`
      },
      capture: true,
      description: `Заказ №${order._id}`,
      metadata: {
        orderId: order._id.toString()
      }
    }, idempotenceKey);

    // Сохраняем информацию о платеже в базе данных
    const newPayment = new Payment({
      orderId: order._id,
      paymentId: payment.id,
      amount: order.totalAmount,
      status: payment.status,
      paymentMethod: payment.payment_method?.type
    });
    await newPayment.save();

    // Обновляем статус заказа
    order.paymentStatus = 'pending';
    order.paymentId = payment.id;
    await order.save();

    res.json({
      paymentId: payment.id,
      confirmation_url: payment.confirmation.confirmation_url
    });

  } catch (error) {
    console.error('Ошибка при создании платежа:', error);
    res.status(500).json({ error: 'Ошибка при создании платежа' });
  }
});

// Проверка статуса платежа
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 });
    if (!payment) {
      return res.status(404).json({ error: 'Платеж не найден' });
    }

    // Получаем актуальный статус от ЮKassa
    const paymentStatus = await yooKassa.getPayment(payment.paymentId);
    
    // Обновляем статус в базе данных
    payment.status = paymentStatus.status;
    payment.paymentMethod = paymentStatus.payment_method?.type;
    await payment.save();

    // Если платеж успешен, обновляем статус заказа
    if (paymentStatus.status === 'succeeded' && payment.status !== 'succeeded') {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
      }
    }

    res.json({
      status: payment.status,
      paymentMethod: payment.paymentMethod
    });

  } catch (error) {
    console.error('Ошибка при проверке статуса платежа:', error);
    res.status(500).json({ error: 'Ошибка при проверке статуса платежа' });
  }
});

// Обработка уведомлений о платежах
router.post('/webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;
    
    // Проверка подписи уведомления
    const signature = req.headers['yookassa-signature'];
    if (!signature) {
      return res.status(400).send('Отсутствует подпись запроса');
    }

    const payment = event.object;
    const { status, metadata } = payment;
    const orderId = metadata.orderId;

    // Обновляем информацию о платеже
    const paymentRecord = await Payment.findOne({ paymentId: payment.id });
    if (paymentRecord) {
      paymentRecord.status = status;
      paymentRecord.paymentMethod = payment.payment_method?.type;
      await paymentRecord.save();

      // Обновляем статус заказа
      const order = await Order.findById(orderId);
      if (order) {
        if (status === 'succeeded') {
          order.paymentStatus = 'paid';
          order.status = 'processing';
        } else if (status === 'canceled') {
          order.paymentStatus = 'failed';
        }
        await order.save();
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error('Ошибка при обработке уведомления:', error);
    res.status(500).send();
  }
});

module.exports = router; 