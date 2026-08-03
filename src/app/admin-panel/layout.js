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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Отслеживаем ширину экрана
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // На мобильных сайдбар по умолчанию закрыт
      if (mobile) setIsSidebarOpen(false);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Закрытие меню при смене маршрута
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSidebarOpen]);

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
        <Link href="/" className={styles.homeLink}>На главную</Link>
      </div>
    );
  }

  // Динамические классы
  const sidebarClass = `${styles.sidebar} ${isMobile ? (isSidebarOpen ? styles['sidebar--open'] : '') : (isSidebarOpen ? '' : styles['sidebar--closed'])}`;
  const mainClass = `${styles.mainContent} ${!isMobile && !isSidebarOpen ? styles['mainContent--expanded'] : ''}`;
  const overlayClass = `${styles.overlay} ${isMobile && isSidebarOpen ? styles['overlay--visible'] : ''}`;

  return (
    <div className={styles.adminContainer}>
      {/* Верхняя панель с кнопкой меню */}
      <header className={styles.topBar}>
        <button className={styles.menuButton} onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Меню">
          {isSidebarOpen && !isMobile ? '✕' : '☰'}
        </button>
        <div className={styles.topTitle}>Админ-панель</div>
        <div style={{ width: '32px' }} />
      </header>

      {/* Сайдбар */}
      <aside className={sidebarClass} aria-label="Боковое меню">
        <div className={styles.sidebarHeader}>
          <div>
            <div className={styles.sidebarTitle}>ServiceBox</div>
            <div className={styles.adminWelcome}>Управление</div>
          </div>
          <button className={styles.closeSidebar} onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>

        <nav className={styles.sidebarNav}>
          {[
            { href: '/admin-panel/orders', label: 'Заказы', icon: '📋' },
            { href: '/admin-panel/bookings', label: 'Бронирования', icon: '📅' },
            { href: '/admin-panel/listservice', label: 'Услуги', icon: '⚙️' },
            { href: '/admin-panel/listproduct', label: 'Товары', icon: '📦' },
            { href: '/admin-panel/listnews', label: 'Новости', icon: '📰' },
            { href: '/admin-panel/addnews', label: 'Добавить новость', icon: '📝' },
            { href: '/admin-panel/promotions', label: 'Акции', icon: '🔥' },
            { href: '/admin-panel/users', label: 'Пользователи', icon: '👥' },
            { href: '/admin-panel/tracking', label: 'Отслеживание', icon: '📍' },
            { href: '/admin-panel/depository', label: 'Файлы', icon: '📁' },
            { href: '/admin-panel/price', label: 'Прайс-лист', icon: '📊' },
            { href: '/admin-panel/calculator-config', label: 'Цены калькулятора (старое)', icon: '🧮' },
            { href: '/admin-panel/pricing-matrix', label: 'Матрица цен', icon: '📐' },
            { href: '/admin-panel/imagelist', label: 'Фотогалерея', icon: '🖼️' },
            { href: '/admin-panel/ai-traffic', label: 'ИИ-трафик', icon: '🤖' },
            { href: '/admin-panel/reviews',  label: 'Отзывы',     icon: '⭐' },
            { href: '/admin-panel/bonuses',  label: 'Бонусы',     icon: '🎁' },
            { href: '/admin-panel/payments', label: 'Оплата',     icon: '💳' },
            { href: '/admin-panel/analytics', label: 'Аналитика',  icon: '📈' },
            { href: '/admin-panel/optfm', label: 'Поставщик OPTFM', icon: '🏭' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
              onClick={() => setIsSidebarOpen(false)}
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

      {/* Оверлей */}
      <div className={overlayClass} onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />

      {/* Основной контент */}
      <main className={mainClass}>{children}</main>
    </div>
  );
}