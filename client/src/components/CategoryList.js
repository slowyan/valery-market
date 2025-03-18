import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/CategoryList.css';
import CategoryForm from './CategoryForm';

// Мемоизированная карточка категории
const CategoryCard = memo(({ category, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast, index }) => {
  const [imgSrc, setImgSrc] = useState(
    category.image 
      ? `${config.baseUrl}${category.image.startsWith('/') ? '' : '/'}${category.image}`
      : `${config.baseUrl}/uploads/placeholder.jpg`
  );

  const handleImageError = useCallback(() => {
    console.log('Image load error for:', imgSrc);
    setImgSrc(`${config.baseUrl}/uploads/placeholder.jpg`);
  }, [imgSrc]);

  // Используем простой строковый ID
  const id = category._id;
  console.log('Rendering card with ID:', id, 'Image URL:', imgSrc);

  return (
    <div className="admin-category-card">
      <div className="admin-category-image-container">
        <img
          src={imgSrc}
          alt={category.name}
          className="admin-category-image"
          onError={handleImageError}
          draggable={false}
        />
      </div>
      <div className="admin-category-content">
        <div className="admin-category-header">
          <h3 className="admin-category-name">{category.name}</h3>
          <div className="admin-category-order">
            <button
              className="order-button"
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
              title="Переместить вверх"
            >
              ↑
            </button>
            <span className="order-number">#{index + 1}</span>
            <button
              className="order-button"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
              title="Переместить вниз"
            >
              ↓
            </button>
          </div>
        </div>
        <p className="admin-category-description">
          {category.description || 'Нет описания'}
        </p>
        <div className="admin-category-actions">
          <button
            className="admin-edit-button"
            onClick={() => onEdit(category)}
          >
            Редактировать
          </button>
          <button
            className="admin-delete-button"
            onClick={() => onDelete(category._id)}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
});

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/categories`);
      const data = response.data;
      setCategories(data);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      setError('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateOrder = useCallback(async (newCategories) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Необходима авторизация');

      // Изменяем формат данных для соответствия ожиданиям сервера
      const categories = newCategories.map(cat => ({
        _id: cat._id
      }));

      console.log('Отправляем данные для обновления порядка:', { categories });

      await axios.put(
        `${config.apiUrl}/categories/order`,
        { categories },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // После успешного обновления на сервере обновляем локальное состояние
      setCategories(newCategories);
    } catch (error) {
      console.error('Ошибка при обновлении порядка:', error);
      // В случае ошибки возвращаем исходный порядок
      fetchCategories();
    }
  }, [fetchCategories]);

  const handleMoveUp = useCallback(async (index) => {
    if (index <= 0) return;
    console.log('Перемещение категории вверх:', index);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Необходима авторизация');

      // Создаем новый массив категорий с обновленным порядком
      const newCategories = [...categories];
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];

      // Подготавливаем данные для отправки
      const updatedCategories = newCategories.map(cat => ({
        _id: cat._id // Используем _id вместо id
      }));

      console.log('Отправляемые данные:', { categories: updatedCategories });

      const response = await axios.put(
        `${config.apiUrl}/categories/order`,
        { categories: updatedCategories },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Ответ сервера:', response.data);

      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        throw new Error(response.data.message || 'Ошибка при обновлении порядка');
      }
    } catch (error) {
      console.error('Ошибка при перемещении категории вверх:', error.response?.data || error.message);
      fetchCategories();
    }
  }, [categories, fetchCategories]);

  const handleMoveDown = useCallback(async (index) => {
    if (index >= categories.length - 1) return;
    console.log('Перемещение категории вниз:', index);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Необходима авторизация');

      // Создаем новый массив категорий с обновленным порядком
      const newCategories = [...categories];
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];

      // Подготавливаем данные для отправки
      const updatedCategories = newCategories.map(cat => ({
        _id: cat._id // Используем _id вместо id
      }));

      console.log('Отправляемые данные:', { categories: updatedCategories });

      const response = await axios.put(
        `${config.apiUrl}/categories/order`,
        { categories: updatedCategories },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Ответ сервера:', response.data);

      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        throw new Error(response.data.message || 'Ошибка при обновлении порядка');
      }
    } catch (error) {
      console.error('Ошибка при перемещении категории вниз:', error.response?.data || error.message);
      fetchCategories();
    }
  }, [categories, fetchCategories]);

  const handleCreateCategory = useCallback(async (categoryData) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      const response = await axios.post(
        `${config.apiUrl}/categories`, 
        categoryData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.success) {
        await fetchCategories();
        setShowForm(false);
        return response.data.category;
      } else {
        throw new Error(response.data.message || 'Ошибка при создании категории');
      }
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
      throw error;
    }
  }, [fetchCategories]);

  const handleUpdateCategory = useCallback(async (categoryData) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      const formData = new FormData();
      Object.keys(categoryData).forEach(key => {
        if (key === 'image' && categoryData[key] instanceof File) {
          formData.append(key, categoryData[key]);
        } else if (key !== 'image') {
          formData.append(key, categoryData[key]);
        }
      });

      await axios.put(
        `${config.apiUrl}/categories/${editingCategory._id}`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      await fetchCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      throw error;
    }
  }, [editingCategory, fetchCategories]);

  const handleDeleteCategory = useCallback(async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Необходима авторизация');
        }

        await axios.delete(
          `${config.apiUrl}/categories/${categoryId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        await fetchCategories();
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        setError('Не удалось удалить категорию');
      }
    }
  }, [fetchCategories]);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setShowForm(true);
  }, []);

  if (loading) return <div className="loading">Загрузка категорий...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-categories-list">
      <div className="section-header">
        <h2>Управление категориями</h2>
        <button onClick={() => setShowForm(true)} className="add-button">
          Добавить категорию
        </button>
      </div>

      {showForm && (
        <CategoryForm
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          initialData={editingCategory}
        />
      )}

      <div className="admin-categories-grid">
        {categories.map((category, index) => (
          <CategoryCard
            key={category._id}
            category={category}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDeleteCategory}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryList; 