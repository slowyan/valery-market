import React, { useState } from 'react';
import OrdersManagement from './OrdersManagement';
import '../styles/adminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <h2>Админ панель</h2>
        <nav>
          <button 
            className={`nav-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Заказы
          </button>
          {/* Здесь можно добавить другие разделы админки */}
        </nav>
      </div>
      
      <div className="admin-content">
        {activeTab === 'orders' && <OrdersManagement />}
      </div>
    </div>
  );
};

export default AdminPanel; 