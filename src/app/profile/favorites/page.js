'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import { Trash2, Package, Newspaper, Image as ImageIcon, Tag } from 'lucide-react';
import styles from './favorites.module.css';

const TABS = [
  { key: 'product',   label: 'Товары',   icon: Package },
  { key: 'news',      label: 'Новости',  icon: Newspaper },
  { key: 'photo',     label: 'Фото',     icon: ImageIcon },
  { key: 'promotion', label: 'Акции',    icon: Tag },
];

export default function FavoritesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('product');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async (tab, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/favorites?itemType=${tab}&page=${page}&limit=12`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();
      setItems(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites(activeTab, 1);
  }, [activeTab, fetchFavorites]);

  const handleRemove = async (item) => {
    setItems(prev => prev.filter(i => i._id !== item._id));

    const res = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ itemId: item._id, itemType: activeTab })
    });

    if (!res.ok) {
      // Rollback
      fetchFavorites(activeTab, pagination.page);
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Моё избранное</h1>
          <Link href="/profile" className={styles.backLink}>← Вернуться в профиль</Link>
        </div>

        {/* Вкладки */}
        <nav className={styles.tabs} aria-label="Категории избранного">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
              aria-selected={activeTab === key}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        {/* Контент */}
        {loading ? (
          <div className={styles.skeleton}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <p>В этой категории пока ничего нет</p>
            <Link href="/" className={styles.browseLink}>Перейти на главную</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <FavoriteCard
                key={item._id}
                item={item}
                tab={activeTab}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* Пагинация */}
        {pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchFavorites(activeTab, pagination.page - 1)}
              className={styles.pageBtn}
            >
              ← Назад
            </button>
            <span className={styles.pageInfo}>
              {pagination.page} / {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => fetchFavorites(activeTab, pagination.page + 1)}
              className={styles.pageBtn}
            >
              Далее →
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function FavoriteCard({ item, tab, onRemove }) {
  const href = {
    product:   `/product/${item.slug}`,
    news:      `/news/${item.slug}`,
    photo:     `/gallery`,
    promotion: `/promotions`,
  }[tab] ?? '/';

  const thumb =
    item.images?.[0] ||
    item.featuredImage ||
    item.filePath ||
    item.image ||
    null;

  return (
    <article className={styles.card}>
      {thumb && (
        <Link href={href} className={styles.cardThumb}>
          <Image
            src={thumb}
            alt={item.name || item.title || 'Фото'}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className={styles.cardImg}
          />
        </Link>
      )}
      <div className={styles.cardBody}>
        <Link href={href} className={styles.cardTitle}>
          {item.name || item.title || 'Без названия'}
        </Link>
        {item.new_price != null && (
          <p className={styles.price}>{item.new_price.toLocaleString('ru-RU')} ₽</p>
        )}
        {item.excerpt && (
          <p className={styles.excerpt}>{item.excerpt}</p>
        )}
        <button
          className={styles.removeBtn}
          onClick={() => onRemove(item)}
          aria-label="Удалить из избранного"
        >
          <Trash2 size={15} />
          Удалить
        </button>
      </div>
    </article>
  );
}
