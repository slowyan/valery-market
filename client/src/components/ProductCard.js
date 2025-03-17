import React from 'react';
import { formatPrice } from '../utils/format';
import config from '../config';
import '../styles/catalog.css';
import placeholderImage from '../assets/i.webp';

const ProductCard = ({ product, onAddToCart }) => {
  const { _id, name, description, price, image, inStock, specifications, discount } = product;

  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${config.baseUrl}${image}`
    : placeholderImage;

  const discountedPrice = discount ? Math.round(price * (1 - discount / 100)) : price;

  const handleAddToCart = () => {
    if (inStock) {
      onAddToCart({
        _id,
        name,
        description,
        price: discountedPrice,
        originalPrice: price,
        discount,
        image,
        quantity: 1
      });
    }
  };

  return (
    <div className="product-card">
      {discount > 0 && (
        <div className="product-badge discount">-{discount}%</div>
      )}
      <div className="product-image">
        <img 
          src={imageUrl} 
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderImage;
          }}
        />
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
            {discount > 0 ? (
              <>
                <span className="original-price">{formatPrice(price)} ₽</span>
                <span className="discounted-price">{formatPrice(discountedPrice)} ₽</span>
              </>
            ) : (
              <span>{formatPrice(price)} ₽</span>
            )}
          </div>
          <button 
            className={`add-to-cart-button ${!inStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {inStock ? 'В корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 