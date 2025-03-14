import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/CheckoutForm.css';

const CheckoutForm = ({ items, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    city: '',
    street: '',
    house: '',
    apartment: '',
    postalCode: '',
    contactPhone: ''
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
        items: items.map(item => ({
          productId: item._id,
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
        totalAmount: items.reduce((sum, item) => {
          const price = item.discount 
            ? Math.round(item.price * (1 - item.discount / 100))
            : item.price;
          return sum + (price * item.quantity);
        }, 0)
      };

      const response = await axios.post(
        `${config.apiUrl}/orders`,
        orderData
      );

      if (response.data.success) {
        onSuccess(response.data.order);
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

  return (
    <div className="checkout-form-overlay">
      <div className="checkout-form">
        <h2>Оформление заказа</h2>
        
        <div className="order-summary">
          <h3>Ваш заказ</h3>
          {items.map(item => (
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
          <div className="order-total">
            <strong>Итого:</strong>
            <strong>
              {items.reduce((sum, item) => {
                const price = item.discount 
                  ? Math.round(item.price * (1 - item.discount / 100))
                  : item.price;
                return sum + (price * item.quantity);
              }, 0)} ₽
            </strong>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onCancel}
              disabled={loading}
            >
              Отмена
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
    </div>
  );
};

export default CheckoutForm; 