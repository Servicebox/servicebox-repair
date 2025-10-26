// app/components/Admin/AdminLayout.jsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './AdminPanel.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin-panel/listservice', label: 'Услуги список' },
    { href: '/admin-panel/listproduct', label: 'Товары список' },
    { href: '/admin-panel/imagelist', label: 'Фото все' },
    { href: '/admin-panel/addnews', label: 'Добавить новость' },
    { href: '/admin-panel/listnews', label: 'Список новостей' },
    { href: '/admin-panel/promotions', label: 'Акции' },
    { href: '/admin-panel/users', label: 'Пользователи' },
    { href: '/admin-panel/orders', label: 'Заказы' }, // Добавьте эту строку
    { href: '/admin-panel/bookings', label: 'Бронирования' },
    { href: '/admin-panel/tracking', label: 'Отслеживание' },
    { href: '/admin-panel/depository', label: 'Депозиторий файлов' }
  ];

  // Проверка доступа
  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Проверка доступа...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className={styles.accessDenied}>
        <h1>Доступ запрещен</h1>
        <p>У вас нет прав для доступа к админ-панели</p>
        <Link href="/" className={styles.homeLink}>
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Открыть меню"
        >
          ☰
        </button>
        <h1 className={styles.mobileTitle}>Админ Панель</h1>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Админ Панель</h2>
          <button 
            className={styles.closeSidebar}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className={styles.sidebarFooter}>
          <p>Добро пожаловать, {user.username || 'Админ'}!</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1>Панель управления</h1>
          <p>Добро пожаловать в админ-панель ServiceBox</p>
        </div>
        {children}
      </main>
    </div>
  );
}