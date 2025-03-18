import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import Cart from './Cart';
import CheckoutForm from './CheckoutForm';
import '../styles/catalog.css';
import axios from 'axios';
import config from '../config';
import '../styles/catalog.css';

const Catalog = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const categoriesRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/categories`);
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      setError('Не удалось загрузить категории');
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      setError('Не удалось загрузить товары');
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      const newScrollPosition = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = (event) => {
    // Реализация поиска
  };

  const handlePriceChange = (event) => {
    const { name, value } = event.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Загрузка корзины из localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
      }
    }
  }, []);

  // Сохранение корзины в localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item._id === product._id);
      if (existingItem) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prev => prev.filter(item => item._id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const handleCheckoutSuccess = (order) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    localStorage.removeItem('cart');
    navigate('/order-success');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => {
        // Проверяем все возможные варианты хранения ID категории
        const productCategoryId = 
          product.category?._id || // если категория - это объект
          product.category || // если категория - это просто ID
          product.categoryId; // если мы храним ID отдельно
        return productCategoryId === selectedCategory;
      })
    : products;

  if (loading) return <div className="loading">Загрузка категорий...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-filters">
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={priceRange.search}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="price-filters">
          <input
            type="number"
            placeholder="Мин. цена"
            name="minPrice"
            value={priceRange.min}
            onChange={handlePriceChange}
          />
          <input
            type="number"
            placeholder="Макс. цена"
            name="maxPrice"
            value={priceRange.max}
            onChange={handlePriceChange}
          />
        </div>
        <select
          name="sort"
          value={priceRange.sort}
          onChange={handlePriceChange}
          className="sort-select"
        >
          <option value="">Сортировка</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="name_asc">Название: А-Я</option>
          <option value="name_desc">Название: Я-А</option>
        </select>
      </div>

      <div className="catalog-categories">
        <button className="scroll-button left" onClick={() => scroll('left')}>
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <div className="categories-scroll-container" ref={scrollContainerRef}>
          <div className="categories-row">
            {categories.map(category => (
              <div
                key={category._id}
                className={`catalog-category-card ${selectedCategory === category._id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category._id)}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="catalog-category-image"
                />
                <div className="catalog-category-content">
                  <h3 className="catalog-category-name">{category.name}</h3>
                  <p className="catalog-category-description">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="scroll-button right" onClick={() => scroll('right')}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-products">
          <h3>Товары не найдены</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="cart-preview" onClick={() => setShowCart(true)}>
          <h3>Корзина ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</h3>
          <button 
            className="checkout-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCheckoutOpen(true);
            }}
          >
            Оформить заказ
          </button>
        </div>
      )}

      {showCart && (
        <Cart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={() => setIsCheckoutOpen(true)}
          onClose={() => setShowCart(false)}
          clearCart={clearCart}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutForm
          items={cartItems}
          onSuccess={handleCheckoutSuccess}
          onCancel={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
};

export default Catalog; 