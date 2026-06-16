// src/app/admin-panel/layout.js
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
    { href: '/admin-panel/calculator-config', label: 'Цены калькулятора', icon: '🧮' },
    { href: '/admin-panel/imagelist', label: 'Фотогалерея', icon: '🖼️' },
    { href: '/admin-panel/addnews', label: 'Добавить новость', icon: '📝' },
    { href: '/admin-panel/listnews', label: 'Новости', icon: '📰' },
    { href: '/admin-panel/promotions', label: 'Акции', icon: '🔥' },
    { href: '/admin-panel/users', label: 'Пользователи', icon: '👥' },
    { href: '/admin-panel/orders', label: 'Заказы', icon: '📋' },
    { href: '/admin-panel/bookings', label: 'Бронирования', icon: '📅' },
    { href: '/admin-panel/tracking', label: 'Отслеживание', icon: '📍' },
    { href: '/admin-panel/depository', label: 'Файлы', icon: '📁' },
    { href: '/admin-panel/price', label: 'Прайс-лист', icon: '📊' },

    { href: '/admin-panel/ai-traffic', label: 'ИИ-трафик', icon: '🤖' },
  ];

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  // Закрытие меню при смене маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Закрытие по Escape
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
      {/* Мобильный хедер */}
      <div className={styles.mobileHeader}>
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Открыть меню"
        >
          ☰
        </button>
        <div className={styles.mobileTitle}>Админ-панель</div>
        <div style={{ width: '32px' }} /> {/* Пустой элемент для центрирования */}
      </div>

      {/* Сайдбар */}
      <aside
        className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}
        aria-label="Боковое меню администратора"
      >
        <div className={styles.sidebarHeader}>
          <div>
            <div className={styles.sidebarTitle}>Админ-панель</div>
            <div className={styles.adminWelcome}>ServiceBox</div>
          </div>
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
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div>{user.username || 'Администратор'}</div>
          <div style={{ fontSize: '0.75rem', color: '#718096' }}>{user.email}</div>
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
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}