import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import ProductForm from './ProductForm';
import { formatPrice } from '../utils/format';
import '../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      const response = await axios.get(
        `${config.apiUrl}/products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setProducts(response.data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      if (error.response?.status === 401) {
        setError('Необходима авторизация. Пожалуйста, войдите снова.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        setError(error.response?.data?.message || 'Не удалось загрузить товары');
      }
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      await axios.post(`${config.apiUrl}/products`, productData);
      fetchProducts();
      setShowForm(false);
    } catch (error) {
      console.error('Ошибка при создании товара:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      console.log('Отправка данных для обновления:', productData);

      const response = await axios.put(
        `${config.apiUrl}/products/${selectedProduct._id}`,
        productData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        console.log('Товар успешно обновлен:', response.data);
        await fetchProducts();
        setShowForm(false);
        setSelectedProduct(null);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Ошибка при обновлении товара');
      }
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      if (error.response?.status === 401) {
        setError('Необходима авторизация. Пожалуйста, войдите снова.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        setError(error.response?.data?.message || 'Не удалось обновить товар');
      }
      throw error;
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) {
      setError('Ошибка: ID товара не указан');
      return;
    }

    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('Необходима авторизация');
        }

        console.log('Удаление товара с ID:', productId);

        const response = await axios.delete(
          `${config.apiUrl}/products/${productId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          console.log('Товар успешно удален');
          await fetchProducts();
          setError(null);
        } else {
          throw new Error(response.data.message || 'Ошибка при удалении товара');
        }
      } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        if (error.response?.status === 401) {
          setError('Необходима авторизация. Пожалуйста, войдите снова.');
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        } else {
          setError(error.response?.data?.message || 'Не удалось удалить товар');
        }
      }
    }
  };

  if (loading) return <div className="loading">Загрузка товаров...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="products-section">
      <div className="section-header">
        <h2>Управление товарами</h2>
        <button onClick={() => setShowForm(true)} className="add-button">
          Добавить товар
        </button>
      </div>

      {showForm && (
        <ProductForm
          onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          initialData={selectedProduct}
        />
      )}

      <div className="products-list">
        {products.length === 0 ? (
          <p className="no-items">Товары отсутствуют</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="product-image-container">
                      <img
                        src={product.image ? `${config.baseUrl}${product.image}` : '/placeholder.jpg'}
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category?.name || 'Без категории'}</td>
                  <td>{formatPrice(product.price)} ₽</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowForm(true);
                      }}
                      className="edit-button"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="delete-button"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList; 
 