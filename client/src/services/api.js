const API_URL = 'http://localhost:5000/api';

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/products/categories`);
    if (!response.ok) throw new Error('Ошибка при получении категорий');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...filters,
      categoryId
    }).toString();
    
    const response = await fetch(`${API_URL}/products/category/${categoryId}?${queryParams}`);
    if (!response.ok) throw new Error('Ошибка при получении товаров');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await fetch(`${API_URL}/products/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Ошибка при поиске товаров');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

export const getProductDetails = async (productId) => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    if (!response.ok) throw new Error('Ошибка при получении информации о товаре');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

// Создание заказа
export const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) throw new Error('Ошибка при создании заказа');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

// Получение заказов пользователя
export const getUserOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/my`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Ошибка при получении заказов');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

// Получение деталей заказа
export const getOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Ошибка при получении информации о заказе');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};

// Отмена заказа
export const cancelOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Ошибка при отмене заказа');
    return await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
}; 