// app/admin/page.js
'use client';

import { useState } from 'react';
import UsersManagement from '@/components/Admin/UsersManagement/UsersManagement';
import OrdersManagement from '@/components/Admin/OrdersManagement/OrdersManagement';
import styles from './admin.module.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Панель администратора</h1>
      </div>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Управление заказами
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Управление пользователями
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {activeTab === 'orders' && <OrdersManagement />}
        {activeTab === 'users' && <UsersManagement />}
      </div>
    </div>
  );
}