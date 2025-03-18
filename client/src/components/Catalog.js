import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import Cart from './Cart';
import CheckoutForm from './CheckoutForm';
import '../styles/catalog.css';
import axios from 'axios';
import config from '../config';
import '../styles/catalog.css';

const CategoryCard = ({ category }) => {
  const [imgSrc, setImgSrc] = useState(
    category.image 
      ? `${config.baseUrl}${category.image.startsWith('/') ? '' : '/'}${category.image}`
      : `${config.baseUrl}/uploads/placeholder.jpg`
  );

  const handleImageError = () => {
    console.log('Image load error for:', imgSrc);
    setImgSrc(`${config.baseUrl}/uploads/placeholder.jpg`);
  };

  return (
    <Link to={`/category/${category._id}`} className="catalog-category-card">
      <div className="catalog-category-image">
        <img 
          src={imgSrc} 
          alt={category.name} 
          onError={handleImageError}
        />
      </div>
      <div className="catalog-category-content">
        <h3>{category.name}</h3>
        {category.description && <p>{category.description}</p>}
      </div>
    </Link>
  );
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');
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

  const getFilteredAndSortedProducts = () => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    if (priceRange.min !== '') {
      filtered = filtered.filter(product => {
        const finalPrice = product.discount 
          ? product.price * (1 - product.discount / 100)
          : product.price;
        return finalPrice >= Number(priceRange.min);
      });
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const finalPrice = product.discount 
          ? product.price * (1 - product.discount / 100)
          : product.price;
        return finalPrice <= Number(priceRange.max);
      });
    }

    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // По умолчанию сортировка по id или дате добавления
        break;
    }

    return filtered;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const filteredProducts = getFilteredAndSortedProducts();

  if (loading) return <div className="loading">Загрузка категорий...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-filters">
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        <div className="price-filters">
          <input
            type="number"
            placeholder="Мин. цена"
            name="min"
            value={priceRange.min}
            onChange={handlePriceChange}
          />
          <input
            type="number"
            placeholder="Макс. цена"
            name="max"
            value={priceRange.max}
            onChange={handlePriceChange}
          />
        </div>
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="sort-select"
        >
          <option value="default">По умолчанию</option>
          <option value="price-asc">Цена: по возрастанию</option>
          <option value="price-desc">Цена: по убыванию</option>
          <option value="name-asc">Название: А-Я</option>
          <option value="name-desc">Название: Я-А</option>
        </select>
      </div>

      <div className="catalog-categories">
        <button className="scroll-button left" onClick={() => scroll('left')}>
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <div className="categories-scroll-container" ref={scrollContainerRef}>
          <div className="categories-row">
            {categories.map(category => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </div>

        <button className="scroll-button right" onClick={() => scroll('right')}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {searchQuery && (
        <div className="results-info">
          <p>Найдено товаров: {filteredProducts.length}</p>
        </div>
      )}

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