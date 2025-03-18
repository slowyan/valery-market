import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/CheckoutForm.css';

const CheckoutForm = ({ items, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const orderData = {
        customerName: formData.customerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        items: items.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          customerName: formData.customerName.trim(),
          email: formData.email.trim(),
          city: formData.city.trim(),
          street: formData.street.trim(),
          house: formData.house.trim(),
          apartment: formData.apartment.trim(),
          postalCode: formData.postalCode.trim()
        },
        contactPhone: formData.phone.trim(),
        totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      const response = await axios.post(
        `${config.apiUrl}/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        onSuccess(response.data);
      } else {
        throw new Error('Не удалось создать заказ');
      }
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err);
      setError(err.response?.data?.message || 'Произошла ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form-overlay">
      <div className="checkout-form">
        <h2>Оформление заказа</h2>
        
        <div className="order-summary">
          <h3>Ваш заказ</h3>
          {items.map(item => (
            <div key={item._id} className="order-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">×{item.quantity}</span>
              <span className="item-price">
                {item.price * item.quantity} ₽
              </span>
            </div>
          ))}
          <div className="order-total">
            <strong>Итого:</strong>
            <strong>
              {items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽
            </strong>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerName">Имя*</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

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
            <label htmlFor="postalCode">Индекс*</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Отмена
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm; 