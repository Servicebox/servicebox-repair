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
    { href: '/admin-panel/listservice', label: 'Услуги', icon: '⚙️' },
    { href: '/admin-panel/listproduct', label: 'Товары', icon: '📦' },
    { href: '/admin-panel/imagelist', label: 'Фотогалерея', icon: '🖼️' },
    { href: '/admin-panel/addnews', label: 'Добавить новость', icon: '📝' },
    { href: '/admin-panel/listnews', label: 'Новости', icon: '📰' },
    { href: '/admin-panel/promotions', label: 'Акции', icon: '🔥' },
    { href: '/admin-panel/users', label: 'Пользователи', icon: '👥' },
    { href: '/admin-panel/orders', label: 'Заказы', icon: '📋' },
    { href: '/admin-panel/bookings', label: 'Бронирования', icon: '📅' },
    { href: '/admin-panel/tracking', label: 'Отслеживание', icon: '📍' },
    { href: '/admin-panel/depository', label: 'Файлы', icon: '📁' },
    { href: '/admin-panel/price', label: 'Прайс-лист', icon: '📊' }
  ];

  // Проверка доступа
  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  // Закрытие мобильного меню при изменении маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Закрытие меню при нажатии ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка админ-панели...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className={styles.accessDenied}>
        <h1>Доступ запрещен</h1>
        <p>Требуются права администратора</p>
        <Link href="/" className={styles.homeLink}>
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Кнопка открытия меню (плавающая, только на мобильных) */}
      <div className={styles.mainNavMenu}>
        <button
          className={styles.menuToggleButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Открыть меню"
          aria-expanded={isMobileMenuOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Сайдбар */}
      <aside
        className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className={styles.sidebarHeader}>
          <div>
            <h2 className={styles.sidebarTitle}>Админ-панель</h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              ServiceBox
            </p>
          </div>
          <button
            className={styles.closeSidebar}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Закрыть меню"
          >
            ×
          </button>
        </div>

        <div className={styles.sidebarContent}>
          <nav className={styles.sidebarNav}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <p style={{ fontWeight: '500', color: '#111827' }}>
            👤 {user.username || 'Администратор'}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {user.email || 'admin@servicebox.com'}
          </p>
        </div>
      </aside>

      {/* Оверлей для мобильных */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Основной контент */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}