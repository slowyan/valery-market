import React from 'react';
import { Link } from 'react-router-dom';
import config from '../config';
import '../styles/CategoryCard.css';

const CategoryCard = ({ category }) => {
  const { _id, name, image, description } = category;

  // Формируем полный путь к изображению
  const imageUrl = image 
    ? (image.startsWith('http') ? image : `${config.baseUrl}${image}`)
    : `${config.baseUrl}/uploads/placeholder.jpg`;
  
  // Отладочная информация
  console.log('Config:', config);
  console.log('Image path:', image);
  console.log('Full image URL:', imageUrl);

  return (
    <Link to={`/category/${_id}`} className="category-card">
      <div className="category-image">
        <img 
          src={imageUrl} 
          alt={name} 
          onError={(e) => {
            console.log('Image load error for:', e.target.src);
            e.target.src = `${config.baseUrl}/uploads/placeholder.jpg`;
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