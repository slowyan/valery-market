import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import ProductForm from './ProductForm';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';
import ProductList from './ProductList';
import OrdersList from './OrdersList';
import '../styles/adminPanel.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/products`);
      setProducts(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить продукты');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/categories`);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await axios.delete(`${config.apiUrl}/products/${productId}`);
      await fetchProducts();
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      setError('Не удалось удалить товар');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        // Редактирование существующего товара
        await axios.put(`${config.apiUrl}/products/${selectedProduct._id}`, formData);
      } else {
        // Создание нового товара
        await axios.post(`${config.apiUrl}/products`, formData);
      }
      
      setShowForm(false);
      await fetchProducts();
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      await axios.post(`${config.apiUrl}/categories`, categoryData);
      fetchCategories();
      setShowCategoryForm(false);
    } catch (err) {
      console.error('Ошибка при создании категории:', err);
      throw err;
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      await axios.put(`${config.apiUrl}/categories/${editingCategory._id}`, categoryData);
      fetchCategories();
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Ошибка при обновлении категории:', err);
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await axios.delete(`${config.apiUrl}/categories/${categoryId}`);
        fetchCategories();
      } catch (err) {
        console.error('Ошибка при удалении категории:', err);
      }
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-logo">
          Valery Pools
        </div>
        <nav className="admin-nav">
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            <i className="fas fa-box"></i>
            Товары
          </button>
          <button
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            <i className="fas fa-tags"></i>
            Категории
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-shopping-cart"></i>
            Заказы
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'categories' && <CategoryList />}
        {activeTab === 'orders' && <OrdersList />}
      </div>
    </div>
  );
};

export default AdminPanel; 