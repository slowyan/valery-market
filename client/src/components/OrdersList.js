import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/OrdersList.css';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      const response = await axios.get(
        `${config.apiUrl}/orders/admin`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Не удалось загрузить заказы');
      }
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error);
      setError(error.message || 'Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      const response = await axios.put(
        `${config.apiUrl}/orders/admin/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        await fetchOrders();
      } else {
        throw new Error(response.data.message || 'Не удалось обновить статус заказа');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setError(error.message || 'Ошибка при обновлении статуса заказа');
    }
  };

  if (loading) return <div className="loading">Загрузка заказов...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="orders-list">
      <h2>Заказы</h2>
      {orders.length === 0 ? (
        <div className="no-orders">Заказы отсутствуют</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID заказа</th>
              <th>Дата и время</th>
              <th>Клиент</th>
              <th>Контакты</th>
              <th>Адрес</th>
              <th>Товары</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id.slice(-6)}</td>
                <td className="order-date">
                  <div className="date-time">
                    {order.formattedDate}
                  </div>
                </td>
                <td>{order.customerName}</td>
                <td>
                  <div className="contact-info">
                    {order.phone && <div className="phone">{order.phone}</div>}
                    {order.email && <div className="email">{order.email}</div>}
                  </div>
                </td>
                <td title={order.address}>{order.address}</td>
                <td>
                  <div className="order-items-container">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="order-item-name" title={item.product?.name || 'Товар не найден'}>
                          {item.product?.name || 'Товар не найден'}
                        </span>
                        <span className="order-item-quantity">
                          {item.quantity} шт
                        </span>
                        <span className="order-item-price">
                          {new Intl.NumberFormat('ru-RU').format(item.price)} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td>{new Intl.NumberFormat('ru-RU').format(order.totalAmount)} ₽</td>
                <td>
                  <span className={`status ${order.status}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="new">Новый</option>
                    <option value="processing">В обработке</option>
                    <option value="completed">Выполнен</option>
                    <option value="cancelled">Отменён</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const getStatusText = (status) => {
  const statusMap = {
    new: 'Новый',
    processing: 'В обработке',
    completed: 'Выполнен',
    cancelled: 'Отменён'
  };
  return statusMap[status] || status;
};

export default OrdersList;