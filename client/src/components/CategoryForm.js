import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/CategoryForm.css';
import { isAuthenticated, isAdmin } from '../utils/auth';

const CategoryForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Инициализация формы начальными данными при редактировании
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || ''
      });
      
      // Если есть изображение, устанавливаем его предпросмотр
      if (initialData.image) {
        setImagePreview(`${config.baseUrl}${initialData.image}`);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите изображение');
        return;
      }

      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      // Создаем URL для предпросмотра
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Очистка URL предпросмотра при размонтировании компонента
  useEffect(() => {
    return () => {
      if (imagePreview && !imagePreview.startsWith(config.baseUrl)) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!isAuthenticated()) {
        throw new Error('Необходима авторизация');
      }

      if (!isAdmin()) {
        throw new Error('У вас нет прав администратора');
      }

      // Проверяем название
      if (!formData.name.trim()) {
        setError('Название категории обязательно');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      if (formData.description) {
        submitData.append('description', formData.description.trim());
      }
      
      // Добавляем изображение только если оно было выбрано
      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      // Вызываем колбэк с данными формы
      await onSubmit(submitData);

      // Очищаем форму после успешного сохранения
      setFormData({
        name: '',
        description: ''
      });
      setSelectedFile(null);
      setImagePreview(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
          (error.response.status === 500 ? 'Внутренняя ошибка сервера' : 'Ошибка при сохранении категории');
        setError(errorMessage);
        
        if (error.response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      } else if (error.request) {
        setError('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
      } else {
        setError(error.message || 'Произошла неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Название категории *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">
          {initialData ? 'Изменить изображение' : 'Изображение'} (макс. 5MB)
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
        />
        {imagePreview && (
          <div className="image-preview">
            <img 
              src={imagePreview} 
              alt="Превью" 
            />
          </div>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Сохранение...' : (initialData ? 'Обновить' : 'Создать')}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
};

export default CategoryForm; 