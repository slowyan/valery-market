import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const PaymentSuccess = ({ onSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderId = localStorage.getItem('pendingOrderId');
      
      if (!orderId) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/orders/${orderId}`);
        
        if (response.data.success && response.data.order.paymentStatus === 'succeeded') {
          // Очищаем ID заказа из localStorage
          localStorage.removeItem('pendingOrderId');
          // Очищаем корзину
          if (onSuccess) {
            onSuccess(response.data);
          }
          // Показываем сообщение об успешной оплате
          alert('Оплата прошла успешно! Спасибо за заказ.');
          // Перенаправляем на страницу заказа
          navigate(`/orders/${orderId}`);
        } else {
          // Если статус оплаты не "succeeded", показываем сообщение об ошибке
          alert('Оплата не была подтверждена. Пожалуйста, свяжитесь с поддержкой.');
          navigate(`/orders/${orderId}`);
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса оплаты:', error);
        alert('Произошла ошибка при проверке статуса оплаты');
        navigate('/');
      }
    };

    checkPaymentStatus();
  }, [navigate, onSuccess]);

  return (
    <div className="payment-success">
      <h2>Проверка статуса оплаты...</h2>
      <p>Пожалуйста, подождите...</p>
    </div>
  );
};

export default PaymentSuccess; 