import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/orderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = localStorage.getItem('lastOrderId');
        if (!orderId) {
          navigate('/catalog');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          throw new Error('Не удалось загрузить информацию о заказе');
        }
      } catch (err) {
        setError(err.message || 'Произошла ошибка при загрузке заказа');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="loading">Загрузка информации о заказе...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-success-page">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/catalog')} className="back-button">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="success-message">
        <h2>Заказ успешно оформлен!</h2>
        <p>Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения.</p>
      </div>

      {order && (
        <div className="order-details">
          <h3>Информация о заказе</h3>
          <div className="order-info">
            <p><strong>Номер заказа:</strong> #{order._id.slice(-6)}</p>
            <p><strong>Дата оформления:</strong> {formatDate(order.createdAt)}</p>
            <p><strong>Статус:</strong> {order.status}</p>
          </div>

          <div className="delivery-info">
            <h4>Адрес доставки</h4>
            <p>{order.shippingAddress.city}, {order.shippingAddress.street}, {order.shippingAddress.house}
              {order.shippingAddress.apartment && `, кв. ${order.shippingAddress.apartment}`}</p>
            <p>Индекс: {order.shippingAddress.postalCode}</p>
            <p>Телефон: {order.contactPhone}</p>
          </div>

          <div className="items-list">
            <h4>Состав заказа</h4>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
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
              <span>Итого:</span>
              <span>{order.totalAmount} ₽</span>
            </div>
          </div>
        </div>
      )}

      <div className="actions">
        <button onClick={() => navigate('/catalog')} className="back-to-catalog">
          Вернуться в каталог
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess; 