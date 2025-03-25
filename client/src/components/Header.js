import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../images/logo.png';
import AuthModal from './AuthModal';
import '../styles/main.css';

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Проверяем валидность токена
      fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data && !data.error) {
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
  }, []);

  const handleAuthClick = () => {
    if (token) {
      navigate('/profile');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header>
      <div className="head">
        <div className="top-row">
          <Link to="/" className="logo">
            <img src={logoImage} alt="Logo" className="logo-image" />
          </Link>
          <button className="auth" onClick={handleAuthClick}>
            {token ? 'Профиль' : 'Войти'}
            <img src="/person.svg" alt="person" />
          </button>
        </div>
        <div className="bottom-row">
          <nav>
            <ul>
              <li>
                <Link to="/catalog" className="navlinks">Каталог</Link>
              </li>
              <li className="menu-container">
                <a href="#" className="navlinks">Наши услуги <span className="arrow">▼</span></a>
                <ul className="dropdown">
                  <li><a href="https://valery-pools.ru/plastering.php" className="navlinks">Оштукатуривание</a></li>
                  <li><a href="#" className="navlinks">Укладка мозаики</a></li>
                  <li><a href="https://valery-pools.ru/film_coating_pool.php" className="navlinks">Сварка плёнки</a></li>
                  <li><a href="https://valery-pools.ru/hydroinsulation.php" className="navlinks">Гидроизоляция</a></li>
                  <li><a href="https://valery-pools.ru/zakladnaya.php" className="navlinks">Установка закладных</a></li>
                  <li><a href="https://valery-pools.ru/montage.php" className="navlinks">Монтаж оборудования</a></li>
                  <li><a href="https://valery-pools.ru/overflow_tunnels.php" className="navlinks">Переливные лотки</a></li>
                  <li><a href="#" className="navlinks">Обслуживание</a></li>
                  <li><a href="#" className="navlinks">Реконструкция</a></li>
                  <li><a href="https://valery-pools.ru/pool_repair.php" className="navlinks">Ремонт</a></li>
                </ul>
              </li>
              <li><Link to="/portfolio" className="navlinks">Наши работы</Link></li>
              <li><Link to="/contract" className="navlinks">Договор</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};

export default Header; 