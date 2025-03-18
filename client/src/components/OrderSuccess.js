import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="order-success-overlay">
      <div className="order-success-modal">
        <div className="order-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        <h2 className="order-success-title">Спасибо за заказ!</h2>
        <p className="order-success-message">
          В ближайшее время мы с Вами свяжемся для подтверждения заказа.
        </p>
        <button 
          className="order-success-button"
          onClick={handleBackToHome}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess; 