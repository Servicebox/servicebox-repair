'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './services.module.css';

const categoryIcons = {
  'Ремонт ноутбуков': '/images/notebook.webp',
  'Ремонт телефонов': '/images/android.webp',
  'Ремонт компьютеров': '/images/monoblok.webp',
  'Техника Apple': '/images/apple.webp',
  'Ремонт планшетов': '/images/tablet.webp',
  'Ремонт телевизоров': '/images/tv.webp',
  'Замена стекла': '/images/glass.webp',
  'Ремонт видеокарт': '/images/videocard.webp',
  'Другие услуги': '/images/Devices.webp'
};

const defaultIcon = '/images/Devices.webp';

export default function ServicesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services?tree=true');
      const data = await response.json();

      if (data.success) {
        const rootCategories = data.data.filter(service =>
          service.isCategory && !service.parent
        );
        setCategories(rootCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (categoryName) => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return defaultIcon;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.servicesPage}>
        <div className={styles.contentWrapper}>
          <div className={styles.loadingContainer}>

            <p style={{ color: '#4a5568', fontSize: '1.125rem' }}>Загружаем категории услуг...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.servicesPage}>
      <div className={styles.contentWrapper}>
        {/* Заголовок */}
        <div className={styles.animatedTitle}>
          <h1>Услуги по ремонту техники</h1>
          <p>Профессиональный ремонт любой техники с гарантией качества</p>
        </div>

        {/* Поиск */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Поиск услуги..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Поиск услуги"
            />
          </div>
        </div>

        {/* Сетка категорий */}
        {filteredCategories.length === 0 ? (
          <div className={styles.noResults}>
            <h3>Категории не найдены</h3>
            <p>Попробуйте изменить поисковый запрос</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearSearchButton}
              >
                Очистить поиск
              </button>
            )}
          </div>
        ) : (
          <div className={styles.categoriesGrid}>
            {filteredCategories.map((category) => (
              <Link
                key={category._id}
                href={`/services/${encodeURIComponent(category.slug)}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryIcon}>
                  <Image
                    src={getIconForCategory(category.name)}
                    alt={category.name}
                    width={50}
                    height={50}
                    className={styles.categoryImg}
                  />
                </div>

                <h3 className={styles.categoryName}>
                  {category.name}
                </h3>

                <p className={styles.categoryDescription}>
                  {category.description || 'Профессиональный ремонт и обслуживание'}
                </p>

                <span className={styles.categoryBadge}>
                  {category.children?.length || 0} услуг
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}