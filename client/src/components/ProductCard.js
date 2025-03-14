import React from 'react';
import '../styles/catalog.css';

const ProductCard = ({ product, onAddToCart }) => {
  const { name, description, price, image, isAvailable, specifications } = product;

  return (
    <div className="product-card">
      {!isAvailable && (
        <div className="product-badge product-badge-unavailable">Нет в наличии</div>
      )}
      <div className="product-image">
        <img src={image} alt={name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-description">{description}</p>
        {specifications && specifications.length > 0 && (
          <div className="product-specifications">
            {specifications.map((spec, index) => (
              <div key={index} className="specification">
                <span className="spec-name">{spec.name}:</span>
                <span className="spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="product-footer">
          <div className="product-price">
            <span>{price} ₽</span>
          </div>
          <button 
            className={`add-to-cart-button ${!isAvailable ? 'disabled' : ''}`}
            onClick={() => isAvailable && onAddToCart(product)}
            disabled={!isAvailable}
          >
            {isAvailable ? 'В корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 