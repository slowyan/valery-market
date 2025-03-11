import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import Cart from './Cart';
import CheckoutForm from './CheckoutForm';
import '../styles/catalog.css';

// Примерные данные для тестирования
const sampleCategories = [
  { id: 1, name: 'Оборудование', image: 'https://via.placeholder.com/300x200?text=Оборудование' },
  { id: 2, name: 'Химия', image: 'https://via.placeholder.com/300x200?text=Химия' },
  { id: 3, name: 'Аксессуары', image: 'https://via.placeholder.com/300x200?text=Аксессуары' },
];

const sampleProducts = [
  {
    id: 1,
    name: 'Фильтр для бассейна',
    description: 'Высокоэффективный фильтр для очистки воды в бассейне. Подходит для бассейнов объемом до 50 000 литров.',
    price: 15000,
    image: 'https://via.placeholder.com/300x200?text=Фильтр',
    category: 1,
    discount: 10
  },
  {
    id: 2,
    name: 'Хлор для бассейна',
    description: 'Дезинфицирующее средство для обработки воды. Эффективно уничтожает бактерии и водоросли.',
    price: 2500,
    image: 'https://via.placeholder.com/300x200?text=Хлор',
    category: 2
  },
  {
    id: 3,
    name: 'Термометр для воды',
    description: 'Плавающий термометр для измерения температуры воды в бассейне.',
    price: 800,
    image: 'https://via.placeholder.com/300x200?text=Термометр',
    category: 3,
    discount: 15
  },
  {
    id: 4,
    name: 'Насос для бассейна',
    description: 'Мощный насос для циркуляции воды. Обеспечивает эффективную фильтрацию.',
    price: 20000,
    image: 'https://via.placeholder.com/300x200?text=Насос',
    category: 1
  },
  {
    id: 5,
    name: 'pH минус',
    description: 'Средство для снижения уровня pH воды в бассейне.',
    price: 1200,
    image: 'https://via.placeholder.com/300x200?text=pH-минус',
    category: 2,
    discount: 5
  },
  {
    id: 6,
    name: 'Сачок для бассейна',
    description: 'Сачок для очистки поверхности воды от мусора.',
    price: 1500,
    image: 'https://via.placeholder.com/300x200?text=Сачок',
    category: 3
  }
];

const Catalog = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(sampleCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: ''
  });

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

  // Фильтрация и сортировка товаров
  useEffect(() => {
    let filteredProducts = selectedCategory
      ? sampleProducts.filter(p => p.category === selectedCategory)
      : sampleProducts;

    // Поиск по названию
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Фильтрация по цене
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(filters.maxPrice));
    }

    // Сортировка
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }

    setProducts(filteredProducts);
  }, [selectedCategory, filters]);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSuccess = (order) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    localStorage.removeItem('cart');
    navigate('/order-success');
  };

  return (
    <div className="catalog-container">
      <div className="catalog-filters">
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={filters.search}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="price-filters">
          <input
            type="number"
            placeholder="Мин. цена"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            placeholder="Макс. цена"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className="sort-select"
        >
          <option value="">Сортировка</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="name_asc">Название: А-Я</option>
          <option value="name_desc">Название: Я-А</option>
        </select>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div
            key={category.id}
            className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className="category-image">
              <img src={category.image} alt={category.name} />
            </div>
            <h2 className="category-name">{category.name}</h2>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-products">
          <h3>Товары не найдены</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="cart-preview" onClick={() => setIsCartOpen(true)}>
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

      {isCartOpen && (
        <Cart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => setIsCheckoutOpen(true)}
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