import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/CheckoutForm.css';
import { Link } from 'react-router-dom';

const CheckoutForm = ({ items, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    postalCode: '',
    isAgree: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validatePostalCode = (code) => {
    const postalCodeRegex = /^\d{6}$/;
    return postalCodeRegex.test(code);
  };

  const validatePhone = (phone) => {
    // Удаляем все не цифры из номера для проверки
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Проверяем формат номера
    if (cleanPhone.startsWith('7') || cleanPhone.startsWith('8')) {
      return cleanPhone.length === 11;
    } else if (cleanPhone.startsWith('9')) {
      return cleanPhone.length === 10;
    }
    return false;
  };

  const formatPhone = (phone) => {
    // Удаляем все не цифры
    let cleaned = phone.replace(/\D/g, '');
    
    // Если номер начинается с 8, заменяем на 7
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }
    
    // Если номер начинается с 9, добавляем 7
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      cleaned = '7' + cleaned;
    }
    
    // Форматируем номер
    if (cleaned.length >= 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    
    return phone;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let fieldErrors = { ...errors };
    
    if (name === 'phone') {
      formattedValue = formatPhone(value);
      if (value && !validatePhone(value)) {
        fieldErrors.phone = 'Введите корректный номер телефона';
      } else {
        delete fieldErrors.phone;
      }
    }
    
    if (name === 'postalCode') {
      // Разрешаем только цифры
      formattedValue = value.replace(/\D/g, '').slice(0, 6);
      if (value && !validatePostalCode(formattedValue)) {
        fieldErrors.postalCode = 'Индекс должен состоять из 6 цифр';
      } else {
        delete fieldErrors.postalCode;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    setErrors(fieldErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем валидацию перед отправкой
    const validationErrors = {};
    if (!validatePhone(formData.phone)) {
      validationErrors.phone = 'Введите корректный номер телефона';
    }
    if (!validatePostalCode(formData.postalCode)) {
      validationErrors.postalCode = 'Индекс должен состоять из 6 цифр';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
            <label htmlFor="email">Email*</label>
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
              placeholder="+7 (___) ___-__-__"
            />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>

          <h3>Адрес доставки</h3>

          <div className="form-group">
            <label htmlFor="city">Населенный пункт*</label>
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
            <label htmlFor="postalCode">Индекс* (6 цифр)</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              maxLength="6"
              placeholder="______"
            />
            {errors.postalCode && <div className="field-error">{errors.postalCode}</div>}
          </div>
          <div>
            <input type="checkbox" name="isAgree" value="true" checked="false|true"/>
            <label htmlFor="isAgree">Я согласен с условиями <Link to="/публичная-оферта" target="_blank">публичной оферты</Link></label>
            {errors.isAgree && <div className="field-error">{errors.isAgree}</div>}
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Отмена
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading || Object.keys(errors).length > 0}
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