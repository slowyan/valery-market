import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { isAuthenticated } from '../utils/auth';
import '../styles/ProductForm.css';

const ProductForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    specifications: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Загружаем список категорий при монтировании
  useEffect(() => {
    fetchCategories();
  }, []);

  // Инициализация формы начальными данными при редактировании
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category?._id || initialData.category || '',
        specifications: initialData.specifications || []
      });

      // Если есть изображения, устанавливаем их предпросмотр
      if (initialData.images && initialData.images.length > 0) {
        const previews = initialData.images.map(image => 
          image.startsWith('http') ? image : `${config.baseUrl}${image}`
        );
        setImagePreviews(previews);
        setExistingImages(previews.filter(preview => preview.startsWith(config.baseUrl)));
      }
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      setError('Не удалось загрузить категории');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    setFormData(prev => {
      const newSpecs = [...prev.specifications];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prev, specifications: newSpecs };
    });
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Проверяем каждый файл
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите только изображения');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер каждого файла не должен превышать 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Создаем URL для предпросмотра новых изображений
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setImageFiles(prev => [...prev, ...validFiles]);
      setError('');
    }
  };

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      const removedPreview = newPreviews[index];
      
      // Если это локальный URL, освобождаем его
      if (removedPreview && !removedPreview.startsWith(config.baseUrl)) {
        URL.revokeObjectURL(removedPreview);
      }
      
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    // Удаляем из списка существующих изображений, если это существующее изображение
    setExistingImages(prev => {
      const newExistingImages = [...prev];
      const removedImage = imagePreviews[index];
      const existingIndex = newExistingImages.indexOf(removedImage);
      if (existingIndex !== -1) {
        newExistingImages.splice(existingIndex, 1);
      }
      return newExistingImages;
    });

    // Удаляем из списка новых файлов, если это новое изображение
    setImageFiles(prev => {
      const newFiles = [...prev];
      const removedPreview = imagePreviews[index];
      if (!removedPreview.startsWith(config.baseUrl)) {
        const fileIndex = prev.findIndex(file => 
          URL.createObjectURL(file) === removedPreview
        );
        if (fileIndex !== -1) {
          newFiles.splice(fileIndex, 1);
        }
      }
      return newFiles;
    });

    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Очистка URL предпросмотров при размонтировании
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview && !preview.startsWith(config.baseUrl)) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isAuthenticated()) {
        throw new Error('Необходима авторизация');
      }

      // Валидация
      if (!formData.name.trim()) {
        throw new Error('Название товара обязательно');
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error('Укажите корректную цену');
      }
      if (!formData.category) {
        throw new Error('Выберите категорию');
      }

      const submitFormData = new FormData();
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('description', formData.description.trim());
      submitFormData.append('price', formData.price);
      submitFormData.append('category', formData.category);
      
      // Добавляем существующие изображения
      if (existingImages.length > 0) {
        submitFormData.append('existingImages', JSON.stringify(existingImages));
      }

      // Добавляем новые изображения
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          submitFormData.append('image', file);
        });
      }

      // Добавляем характеристики
      if (formData.specifications.length > 0) {
        submitFormData.append('specifications', JSON.stringify(formData.specifications));
      }

      await onSubmit(submitFormData);

      // Очищаем форму после успешного сохранения
      if (!initialData) {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          specifications: []
        });
        setSelectedFiles([]);
        setImagePreviews([]);
        setImageFiles([]);
        setExistingImages([]);
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setError(error.response?.data?.message || 'Произошла ошибка при сохранении товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Название товара *</label>
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
        <label htmlFor="price">Цена *</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Категория *</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Выберите категорию</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Спецификации</label>
        {formData.specifications.map((spec, index) => (
          <div key={index} className="specification-item">
            <input
              type="text"
              placeholder="Название"
              value={spec.name}
              onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Значение"
              value={spec.value}
              onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
            />
            <button
              type="button"
              className="remove-spec-button"
              onClick={() => removeSpecification(index)}
            >
              Удалить
            </button>
          </div>
        ))}
        <button
          type="button"
          className="add-spec-button"
          onClick={addSpecification}
        >
          Добавить спецификацию
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="images">
          {initialData ? 'Добавить изображения' : 'Изображения'} (макс. 5MB каждое)
        </label>
        <input
          type="file"
          id="images"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        <div className="image-previews">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="image-preview-container">
              <img
                src={preview}
                alt={`Превью ${index + 1}`}
                className="image-preview"
              />
              <button
                type="button"
                className="remove-image-button"
                onClick={() => removeImage(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
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

export default ProductForm; 