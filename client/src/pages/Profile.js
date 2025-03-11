import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Необходима авторизация');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:5000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok && data) {
                    setUser(data);
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || ''
                    });
                } else {
                    setError(data.message || 'Ошибка загрузки профиля');
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            } catch (err) {
                console.error('Ошибка загрузки профиля:', err);
                setError('Ошибка сервера при загрузке профиля');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setIsEditing(false);
            } else {
                const error = await response.json();
                alert(error.message || 'Ошибка обновления профиля');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка сервера');
        }
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h1>Загрузка...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h1>Ошибка</h1>
                    <p className="error-message">{error}</p>
                    <button 
                        className="auth-button"
                        onClick={() => navigate('/')}
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-container">
                <div className="profile-card">
                    <h1>Профиль не найден</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h1>Профиль</h1>
                
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label>Имя:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Введите имя"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Введите email"
                            />
                        </div>

                        <div className="form-group">
                            <label>Телефон:</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                disabled
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="save-button">
                                Сохранить
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={handleCancel}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-info">
                        <div className="info-group">
                            <label>Имя:</label>
                            <p>{user.name || 'Не указано'}</p>
                        </div>

                        <div className="info-group">
                            <label>Email:</label>
                            <p>{user.email || 'Не указано'}</p>
                        </div>

                        <div className="info-group">
                            <label>Телефон:</label>
                            <p>{user.phone}</p>
                        </div>

                        <div className="profile-actions">
                            <button 
                                className="edit-button"
                                onClick={handleEdit}
                            >
                                Редактировать
                            </button>
                            <button 
                                className="logout-button"
                                onClick={handleLogout}
                            >
                                Выйти из аккаунта
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile; 