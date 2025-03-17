import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { formatPrice } from '../utils/format';
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
      const response = await axios.get(`${config.apiUrl}/orders`);
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении заказов:', error);
      setError('Не удалось загрузить список заказов');
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${config.apiUrl}/orders/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders(); // Обновляем список заказов
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setError('Не удалось обновить статус заказа');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'processing': return 'status-processing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'processing': return 'В обработке';
      case 'completed': return 'Выполнен';
      case 'cancelled': return 'Отменён';
      default: return status;
    }
  };

  if (loading) return <div className="loading">Загрузка заказов...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="orders-list">
      <h2>Заказы</h2>
      <table>
        <thead>
          <tr>
            <th>ID заказа</th>
            <th>Клиент</th>
            <th>Контакты</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.customerName}</td>
              <td>
                <div>{order.phone}</div>
                <div>{order.email}</div>
              </td>
              <td>{formatPrice(order.totalAmount)} ₽</td>
              <td>
                <span className={`status ${getStatusColor(order.status)}`}>
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
    </div>
  );
};

export default OrdersList; 
 