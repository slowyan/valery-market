import React from 'react';
import '../styles/catalog.css';

const ProductCard = ({ product, onAddToCart }) => {
  const { name, description, price, image, discount } = product;

  return (
    <div className="product-card">
      {discount && (
        <div className="product-badge">-{discount}%</div>
      )}
      <div className="product-image">
        <img src={image} alt={name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-description">{description}</p>
        <div className="product-footer">
          <div className="product-price">
            {discount ? (
              <>
                <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                  {price} ₽
                </span>
                <span>{Math.round(price * (1 - discount / 100))} ₽</span>
              </>
            ) : (
              <span>{price} ₽</span>
            )}
          </div>
          <button 
            className="add-to-cart-button"
            onClick={() => onAddToCart(product)}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 