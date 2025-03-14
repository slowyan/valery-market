import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import '../styles/adminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = `${config.apiUrl}/auth/admin/login`;
      console.log('Отправка запроса на:', url);
      const response = await axios.post(url, {
        email,
        password
      });

      console.log('Ответ сервера:', response.data);

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || 'Неизвестная ошибка');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err.response?.data || err);
      setError(
        err.response?.data?.message || 
        'Ошибка при входе в систему. Проверьте правильность введенных данных.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>Вход в админ-панель</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Введите email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 