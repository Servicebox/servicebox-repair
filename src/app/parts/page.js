// app/parts/page.jsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client';

import { useState, useEffect, useMemo } from 'react';
import Item from '@/components/Item/Item';
import styles from './Parts.module.css';

export default function PartsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Загружаем товары
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/allproducts');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.products)) {
          setAllProducts(data.products);
          setFilteredProducts(data.products);
        } else {
          console.error('Неверный формат данных:', data);
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
        setError(error.message);
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Определяем, мобильное ли устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Строим иерархию категорий
  const categoriesHierarchy = useMemo(() => {
    const hierarchy = {};
    
    allProducts.forEach(product => {
      if (!product.category) return;
      
      if (!hierarchy[product.category]) {
        hierarchy[product.category] = {
          name: product.category,
          subcategories: new Set(),
          icon: getCategoryIcon(product.category),
          count: 0
        };
      }
      
      hierarchy[product.category].count++;
      
      if (product.subcategory && product.subcategory.trim()) {
        hierarchy[product.category].subcategories.add(product.subcategory);
      }
    });
    
    Object.keys(hierarchy).forEach(category => {
      hierarchy[category].subcategories = Array.from(hierarchy[category].subcategories);
    });
    
    return Object.values(hierarchy);
  }, [allProducts]);

  // Функция для получения иконки категории
  function getCategoryIcon(category) {
    const icons = {
      'Флешки': '💾',
      'Жесткие диски': '💽',
      'SSD': '🚀',
      'Оперативная память': '🧠',
      'Процессоры': '⚡',
      'Видеокарты': '🎮',
      'Материнские платы': '🔌',
      'Блоки питания': '🔋',
      'Корпуса': '🏠',
      'Охлаждение': '❄️',
      'Мониторы': '🖥️',
      'Клавиатуры': '⌨️',
      'Мыши': '🐭',
      'Наушники': '🎧',
      'Веб-камеры': '📹',
      'Принтеры': '🖨️',
      'Сканеры': '📄',
      'Кабели и адаптеры': '🔌',
      'Комплектующие': '💻',
      'Запчасти': '📱',
      'Батареи': '🔋',
      'Носители информации': '💿',
      'Аксессуары': '🎯',
      'Сеть': '🌐',
      'Аудио': '🔊',
      'Видео': '📺',
      'Игровое': '🎮',
      'Офисное': '📎',
      'Серверное': '🖥️',
      'Прочее': '📦',
      'Телефоны': '📲',
      'Телефоны б/у': '📲',
      'Аккумуляторы': '🔋',
      'Смартфоны': '📱',
      'Ноутбуки': '💻',
      'Компьютеры': '🖥️',
      'Планшеты': '📟',
      'Телевизоры': '📺',
    };
    
    return icons[category] || '📦';
  }

  // Фильтрация и сортировка товаров
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Применяем фильтры
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }
    
    // Применяем сортировку
    switch(sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.new_price || 0) - (b.new_price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.new_price || 0) - (a.new_price || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        // По умолчанию - как есть
        break;
    }
    
    setFilteredProducts(filtered);
  }, [allProducts, selectedCategory, selectedSubcategory, sortBy]);

  // Обработчики для дерева категорий
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    
    if (!expandedCategories.includes(category)) {
      setExpandedCategories([...expandedCategories, category]);
    }
    
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubcategoryClick = (category, subcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setExpandedCategories([]);
    setFilteredProducts(allProducts);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingAnimation}>
          <div className={styles.loadingCircle}></div>
        </div>
        <div className={styles.loadingText}>Загружаем каталог...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Каталог запчастей</h1>
        <p>Выберите категорию и найдите нужные комплектующие</p>
      </div>
      
      {/* Мобильный оверлей */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Сайдбар */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Категории</h2>
          <div className={styles.sidebarActions}>
            {(selectedCategory || selectedSubcategory) && (
              <button 
                className={styles.resetButton}
                onClick={handleClearFilters}
              >
                Сбросить
              </button>
            )}
            {isMobile && (
              <button 
                className={styles.closeButton}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className={styles.categoriesTree}>
          <button
            className={`${styles.categoryToggle} ${!selectedCategory && !selectedSubcategory ? styles.active : ''}`}
            onClick={handleClearFilters}
          >
            <span className={styles.categoryName}>📦 Все товары ({allProducts.length})</span>
            <span className={styles.categoryArrow}>▼</span>
          </button>
          
          {categoriesHierarchy.map(category => (
            <div key={category.name} className={styles.categoryItem}>
              <button
                className={`${styles.categoryToggle} ${selectedCategory === category.name ? styles.active : ''}`}
                onClick={() => handleCategoryClick(category.name)}
              >
                <span className={styles.categoryContent}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>
                    {category.name}
                    <span className={styles.categoryCount}>({category.count})</span>
                  </span>
                </span>
                {category.subcategories.length > 0 && (
                  <span 
                    className={`${styles.categoryArrow} ${expandedCategories.includes(category.name) ? styles.expanded : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.name);
                    }}
                  >
                    ▼
                  </span>
                )}
              </button>
              
              {expandedCategories.includes(category.name) && category.subcategories.length > 0 && (
                <div className={styles.subcategoriesList}>
                  {category.subcategories.map(subcategory => (
                    <button
                      key={`${category.name}-${subcategory}`}
                      className={`${styles.subcategoryButton} ${selectedSubcategory === subcategory ? styles.active : ''}`}
                      onClick={() => handleSubcategoryClick(category.name, subcategory)}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
      
      {/* Основной контент */}
      <section className={styles.main}>
        <div className={styles.quickFilters}>
          {isMobile && (
            <button
              className={`${styles.filterChip} ${styles.filterToggle}`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰ Фильтры
            </button>
          )}
          <button
            className={`${styles.filterChip} ${!selectedCategory && !selectedSubcategory ? styles.active : ''}`}
            onClick={handleClearFilters}
          >
            Все товары
          </button>
          {selectedCategory && (
            <button
              className={`${styles.filterChip} ${styles.active}`}
              onClick={() => setSelectedSubcategory('')}
            >
              {selectedCategory}
            </button>
          )}
          {selectedSubcategory && (
            <button
              className={`${styles.filterChip} ${styles.active}`}
            >
              {selectedSubcategory}
            </button>
          )}
        </div>
        
        <div className={styles.productsInfo}>
          <div className={styles.productCount}>
            Найдено: <span>{filteredProducts.length}</span> товаров
          </div>
          
          <div className={styles.sortControls}>
            <span className={styles.sortLabel}>Сортировка:</span>
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="default">По умолчанию</option>
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="price-low">Цена: по возрастанию</option>
              <option value="price-high">Цена: по убыванию</option>
              <option value="name-asc">Название: А-Я</option>
              <option value="name-desc">Название: Я-А</option>
            </select>
          </div>
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {filteredProducts.map(product => {
              const plainProduct = {
                ...product,
                _id: product._id ? product._id.toString() : product.slug
              };
              
              return (
                <Item
                  key={plainProduct._id}
                  slug={plainProduct.slug}
                  name={plainProduct.name}
                  images={Array.isArray(plainProduct.images) ? plainProduct.images : []}
                  new_price={plainProduct.new_price}
                  old_price={plainProduct.old_price}
                  description={plainProduct.description}
                  quantity={plainProduct.quantity}
                  category={plainProduct.category}
                  subcategory={plainProduct.subcategory}
                  brand={plainProduct.brand}
                />
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <h3>Товары не найдены</h3>
            <p>
              {selectedCategory || selectedSubcategory 
                ? 'По выбранным фильтрам ничего не найдено'
                : 'В каталоге пока нет товаров'}
            </p>
            <div className={styles.emptyStateActions}>
              {(selectedCategory || selectedSubcategory) && (
                <button 
                  className={styles.emptyStateButton}
                  onClick={handleClearFilters}
                >
                  Показать все товары
                </button>
              )}
              {!isMobile && (
                <button 
                  className={`${styles.emptyStateButton} ${styles.secondary}`}
                  onClick={() => window.location.href = '/'}
                >
                  На главную
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Кнопка мобильного меню */}
      {isMobile && (
        <button 
          className={styles.mobileMenuToggle}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      )}
    </div>
  );
}