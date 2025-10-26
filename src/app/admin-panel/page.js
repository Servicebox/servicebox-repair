// app/admin-panel/page.jsx
'use client';

import Layout from './layout';
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      // Перенаправляем на страницу управления заказами по умолчанию
      router.push('/admin-panel/orders');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className={styles.welcomeMessage}>
        <h2>Добро пожаловать в админ-панель!</h2>
        <p>Происходит перенаправление...</p>
      </div>
    </Layout>
  );
}