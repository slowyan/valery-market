import React from 'react';
import config from '../config';
import '../styles/Cart.css';

const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout, onClose }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getImageUrl = (item) => {
    if (item.images && item.images.length > 0) {
      const imagePath = item.images[0];
      return imagePath.startsWith('http') ? imagePath : `${config.baseUrl}${imagePath}`;
    }
    return '/placeholder.jpg';
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU');
  };

  return (
    <div className="cart-modal">
      <div className="cart-content">
        <div className="cart-header">
          <h2>Корзина</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        {items.length === 0 ? (
          <p className="empty-cart">Корзина пуста</p>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-image">
                    <img 
                      src={getImageUrl(item)} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="item-info">
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <div className="price-info">
                        <p className="item-price">{formatPrice(item.price)} ₽</p>
                        {item.quantity > 1 && (
                          <p className="item-total">Итого: {formatPrice(item.price * item.quantity)} ₽</p>
                        )}
                      </div>
                    </div>
                    <div className="item-controls">
                      <div className="item-quantity">
                        <button 
                          onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="remove-item"
                    onClick={() => onRemoveItem(item._id)}
                    title="Удалить товар"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-total">
              <span>Итого:</span>
              <span className="total-price">{formatPrice(total)} ₽</span>
            </div>
            <button 
              className="checkout-button"
              onClick={onCheckout}
            >
              Оформить заказ
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart; 