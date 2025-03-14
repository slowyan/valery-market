import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/checkout.css';
import config from '../config';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    street: '',
    house: '',
    apartment: '',
    postalCode: '',
    contactPhone: ''
  });

  // Получаем товары из localStorage
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.discount 
      ? Math.round(item.price * (1 - item.discount / 100))
      : item.price;
    return sum + (price * item.quantity);
  }, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Формируем данные заказа
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0
        })),
        shippingAddress: {
          city: formData.city,
          street: formData.street,
          house: formData.house,
          apartment: formData.apartment || '',
          postalCode: formData.postalCode
        },
        contactPhone: formData.contactPhone,
        totalAmount
      };

      // Отправляем заказ на сервер
      const response = await axios.post(
        `${config.apiUrl}/orders`,
        orderData
      );

      if (response.data.success) {
        // Проверяем, что заказ действительно создан
        const orderId = response.data.order._id;
        const verifyResponse = await axios.get(
          `${config.apiUrl}/orders/${orderId}`
        );

        if (verifyResponse.data.success) {
          // Очищаем корзину
          localStorage.removeItem('cart');
          // Сохраняем ID заказа для страницы успеха
          localStorage.setItem('lastOrderId', orderId);
          navigate('/order-success');
        } else {
          throw new Error('Не удалось подтвердить создание заказа');
        }
      } else {
        throw new Error(response.data.message || 'Ошибка при создании заказа');
      }
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      setError(err.response?.data?.message || err.message || 'Произошла ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <h2>Корзина пуста</h2>
        <button onClick={() => navigate('/catalog')} className="back-button">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2>Оформление заказа</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-section">
          <h3>Адрес доставки</h3>
          
          <div className="form-group">
            <label htmlFor="city">Город*</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="street">Улица*</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="house">Дом*</label>
              <input
                type="text"
                id="house"
                name="house"
                value={formData.house}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="apartment">Квартира</label>
              <input
                type="text"
                id="apartment"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="postalCode">Почтовый индекс*</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Контактная информация</h3>
          
          <div className="form-group">
            <label htmlFor="contactPhone">Телефон*</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="order-summary">
          <h3>Ваш заказ</h3>
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item.id} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">×{item.quantity}</span>
                <span className="item-price">
                  {item.discount
                    ? Math.round(item.price * (1 - item.discount / 100)) * item.quantity
                    : item.price * item.quantity
                  } ₽
                </span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Итого:</span>
            <span>{totalAmount} ₽</span>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/catalog')}
            className="back-button"
          >
            Назад
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Оформление...' : 'Оформить заказ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout; 