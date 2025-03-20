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
    inStock: true,
    infiniteStock: false,
    discount: 0,
    specifications: [],
    quantity: 1
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageToDelete, setImageToDelete] = useState(false);
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
        inStock: initialData.inStock ?? true,
        infiniteStock: initialData.infiniteStock ?? false,
        discount: initialData.discount || 0,
        specifications: initialData.specifications || [],
        quantity: initialData.quantity || 0
      });

      // Если есть изображение, устанавливаем его предпросмотр
      if (initialData.image) {
        const imagePath = initialData.image.startsWith('http') 
          ? initialData.image 
          : `${config.baseUrl}${initialData.image}`;
        setImagePreviews([imagePath]);
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
    // Если это существующее изображение продукта
    if (initialData && initialData.image) {
      setImageToDelete(true);
      setImagePreviews([]); // Очищаем превью
      setImageFiles([]); // Очищаем файлы
    } else {
      // Если это новое изображение
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

      setImageFiles(prev => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
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
    setError('');
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!isAuthenticated()) {
        throw new Error('Необходима авторизация');
      }

      // Проверяем обязательные поля
      if (!formData.name.trim()) {
        setError('Название продукта обязательно');
        setLoading(false);
        return;
      }

      if (!formData.price) {
        setError('Цена продукта обязательна');
        setLoading(false);
        return;
      }

      if (!formData.category) {
        setError('Категория продукта обязательна');
        setLoading(false);
        return;
      }

      // Если это новый продукт и нет изображения
      if (!initialData && imageFiles.length === 0) {
        setError('Изображение продукта обязательно');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('inStock', formData.inStock);
      submitData.append('infiniteStock', formData.infiniteStock);
      submitData.append('discount', formData.discount);
      submitData.append('specifications', JSON.stringify(formData.specifications));
      submitData.append('quantity', formData.quantity);

      // Если нужно удалить существующее изображение
      if (imageToDelete) {
        try {
          const token = localStorage.getItem('adminToken');
          if (!token) {
            throw new Error('Необходима авторизация');
          }

          await axios.delete(
            `${config.apiUrl}/products/${initialData._id}/image`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
        } catch (error) {
          console.error('Ошибка при удалении изображения:', error);
          // Продолжаем выполнение, даже если удаление не удалось
        }
      }

      // Добавляем новое изображение, если оно есть
      if (imageFiles.length > 0) {
        submitData.append('image', imageFiles[0]);
      }

      // Отправляем данные через колбэк
      await onSubmit(submitData, setUploadProgress);

      // Очищаем форму после успешного сохранения
      if (!initialData) {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          inStock: true,
          infiniteStock: false,
          discount: 0,
          specifications: [],
          quantity: 0
        });
        setSelectedFiles([]);
        setImagePreviews([]);
        setImageFiles([]);
        setImageToDelete(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setError(error.message || 'Произошла ошибка при сохранении продукта');
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
          step="1"
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

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="inStock"
            checked={formData.inStock}
            onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
          />
          <span>В наличии</span>
        </label>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="infiniteStock"
            checked={formData.infiniteStock}
            onChange={(e) => setFormData({ ...formData, infiniteStock: e.target.checked })}
          />
          <span>Бесконечное количество</span>
        </label>
      </div>

      {formData.inStock && !formData.infiniteStock && (
        <div className="form-group">
          <label htmlFor="quantity">Количество товара</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setFormData({ 
                ...formData, 
                quantity: Math.max(1, value),
                inStock: value > 0
              });
            }}
            min="1"
            required
          />
        </div>
      )}

      <div className="form-group">
        <label>
          Скидка (%)
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            min="0"
            max="100"
          />
        </label>
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