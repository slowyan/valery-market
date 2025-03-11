import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ordersManagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Токен админа:', token); // Отладочная информация

      if (!token) {
        setError('Отсутствует токен администратора');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Ответ сервера:', response.data); // Отладочная информация

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError(response.data.message || 'Ошибка при загрузке заказов');
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке заказов:', err.response || err); // Отладочная информация
      setError(err.response?.data?.message || 'Ошибка при загрузке заказов');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('Отсутствует токен администратора');
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchOrders();
      } else {
        setError(response.data.message || 'Ошибка при обновлении статуса заказа');
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err.response || err);
      setError(err.response?.data?.message || 'Ошибка при обновлении статуса заказа');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffd700',
      processing: '#1e90ff',
      completed: '#32cd32',
      cancelled: '#ff4500'
    };
    return colors[status] || '#000';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидает обработки',
      processing: 'В обработке',
      completed: 'Выполнен',
      cancelled: 'Отменён'
    };
    return statusMap[status] || status;
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return (
    <div className="error">
      <p>{error}</p>
      <button onClick={fetchOrders} className="retry-button">
        Попробовать снова
      </button>
    </div>
  );

  return (
    <div className="orders-management">
      <h2>Управление заказами</h2>
      
      <div className="orders-container">
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>Заказы отсутствуют</p>
            </div>
          ) : (
            orders.map(order => (
              <div 
                key={order._id}
                className={`order-item ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-header">
                  <span className="order-id">#{order._id.slice(-6)}</span>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="order-info">
                  <p>Сумма: {order.totalAmount} ₽</p>
                  <p>Создан: {formatDate(order.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedOrder && (
          <div className="order-details">
            <h3>Детали заказа #{selectedOrder._id.slice(-6)}</h3>
            
            <div className="status-control">
              <label>Статус заказа:</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
              >
                <option value="pending">Ожидает обработки</option>
                <option value="processing">В обработке</option>
                <option value="completed">Выполнен</option>
                <option value="cancelled">Отменён</option>
              </select>
            </div>

            <div className="customer-info">
              <h4>Информация о покупателе</h4>
              <p>Email: {selectedOrder.userId?.email || 'Гость'}</p>
              <p>Телефон: {selectedOrder.contactPhone}</p>
            </div>

            <div className="shipping-info">
              <h4>Адрес доставки</h4>
              <p>Город: {selectedOrder.shippingAddress.city}</p>
              <p>Улица: {selectedOrder.shippingAddress.street}</p>
              <p>Дом: {selectedOrder.shippingAddress.house}</p>
              {selectedOrder.shippingAddress.apartment && (
                <p>Квартира: {selectedOrder.shippingAddress.apartment}</p>
              )}
              <p>Индекс: {selectedOrder.shippingAddress.postalCode}</p>
            </div>

            <div className="order-items">
              <h4>Товары</h4>
              <table>
                <thead>
                  <tr>
                    <th>Наименование</th>
                    <th>Цена</th>
                    <th>Кол-во</th>
                    <th>Скидка</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.price} ₽</td>
                      <td>{item.quantity}</td>
                      <td>{item.discount}%</td>
                      <td>
                        {item.discount
                          ? Math.round(item.price * (1 - item.discount / 100)) * item.quantity
                          : item.price * item.quantity
                        } ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4">Итого:</td>
                    <td>{selectedOrder.totalAmount} ₽</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement; 