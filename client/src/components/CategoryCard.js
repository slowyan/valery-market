import React from 'react';
import { Link } from 'react-router-dom';
import config from '../config';
import '../styles/CategoryCard.css';
import { getImageUrl } from '../utils/helpers';

const CategoryCard = ({ category }) => {
  const { _id, name, image, description } = category;

  // Формируем полный путь к изображению
  const imageUrl = image ? `${config.uploadsUrl}/${image}` : '/placeholder.jpg';

  return (
    <Link to={`/category/${_id}`} className="category-card">
      <div className="category-image">
        <img 
          src={getImageUrl(image)} 
          alt={name} 
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
            e.target.onerror = null;
          }}
        />
      </div>
      <div className="category-info">
        <h3>{name}</h3>
        {description && <p>{description}</p>}
      </div>
    </Link>
  );
};

export default CategoryCard; 