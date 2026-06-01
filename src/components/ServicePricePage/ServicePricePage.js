// components/ServicePricePage/ServicePricePage.jsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import styles from './ServicePricePage.module.css';
import BookingForm from "../BookingForm/BookingForm";

// Метаданные для SEO
export const metadata = {
    title: 'Цены на услуги по ремонту техники | Все виды ремонта',
    description: 'Профессиональный ремонт ноутбуков, телефонов, компьютеров и другой техники. Гарантия качества. Запишитесь онлайн!',
};

// Иконки категорий (оптимизированная карта)
const CATEGORY_ICONS = {
    'Ремонт ноутбуков': { icon: '/images/notebook.webp', label: 'Ремонт ноутбуков' },
    'Ремонт телефонов': { icon: '/images/android.webp', label: 'Ремонт телефонов' },
    'Ремонт компьютеров': { icon: '/images/monoblok.webp', label: 'Компьютеры и моноблоки' },
    'Техника Apple': { icon: '/images/apple.webp', label: 'Apple техника' },
    'Ремонт планшетов': { icon: '/images/tablet.webp', label: 'Планшеты' },
    'Ремонт телевизоров': { icon: '/images/tv.webp', label: 'Телевизоры' },
    'Замена стекла': { icon: '/images/glass.webp', label: 'Замена стекла' },
    'Ремонт видеокарт': { icon: '/images/videocard.webp', label: 'Видеокарты' },
};

const DEFAULT_ICON = '/images/Devices.webp';

const ServicePricePage = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryPath, setCategoryPath] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Загрузка услуг
    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services?tree=true');
                const data = await response.json();

                if (isMounted && data.success) {
                    setServices(data.data);
                    setCategories(data.data.filter(s => s.isCategory && !s.parent));
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchServices();
        return () => { isMounted = false; };
    }, []);

    // Получение элементов текущей категории
    const currentItems = useMemo(() => {
        if (!currentCategory) return categories;

        const findInTree = (items, targetId) => {
            for (const item of items) {
                if (item._id === targetId) return item.children || [];
                if (item.children) {
                    const found = findInTree(item.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        return findInTree(services, currentCategory._id) || [];
    }, [currentCategory, categories, services]);

    // Фильтрация по поиску
    const filteredItems = useMemo(() => {
        if (!searchQuery) return currentItems;
        const query = searchQuery.toLowerCase();
        return currentItems.filter(item =>
            item.name?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        );
    }, [currentItems, searchQuery]);

    // Обработчики навигации
    const handleCategoryClick = useCallback((category) => {
        if (!category.isCategory) return;
        setCurrentCategory(category);
        setCategoryPath(prev => [...prev, category]);
    }, []);

    const handleBackClick = useCallback(() => {
        setCategoryPath(prev => {
            const newPath = prev.slice(0, -1);
            setCurrentCategory(newPath[newPath.length - 1] || null);
            return newPath;
        });
    }, []);

    const handleHomeClick = useCallback(() => {
        setCurrentCategory(null);
        setCategoryPath([]);
        setSearchQuery('');
    }, []);

    const handleBookingClick = useCallback((service, e) => {
        e?.stopPropagation();
        setSelectedService(service);
        setIsBookingFormOpen(true);
    }, []);

    const handleBookingSuccess = useCallback((bookingData) => {
        alert(`Запись создана! Ваш код: ${bookingData.trackingCode}`);
        setIsBookingFormOpen(false);
        setSelectedService(null);
    }, []);

    const handleCloseBooking = useCallback(() => {
        setIsBookingFormOpen(false);
        setSelectedService(null);
    }, []);

    // Форматирование цены
    const formatPrice = useCallback((price) => {
        if (!price || price === '') return 'Уточняйте';
        const priceStr = String(price);
        if (priceStr.includes('₽') || priceStr.includes('руб')) return priceStr;
        return `${price} ₽`;
    }, []);

    // Получение данных категории
    const getCategoryDisplay = (name) =>
        CATEGORY_ICONS[name] || { icon: DEFAULT_ICON, label: name };

    // Состояние загрузки
    if (loading) {
        return (
            <div className={styles.servicePricePage}>
                <div className={styles.contentWrapper}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p>Загружаем услуги...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section id="services" className={styles.servicePricePage}>
            <div className={styles.contentWrapper}>
                {/* Заголовок */}
                <header className={styles.animatedTitle}>
                    <h1>{currentCategory?.name || 'Услуги по ремонту техники rb'}</h1>
                    <p>{currentCategory?.description || 'Ремонтируем любую технику с гарантией качества'}</p>
                </header>

                {/* Управление */}
                <div className={styles.controlsContainer}>
                    <nav className={styles.breadcrumbs} aria-label="Навигация по категориям">
                        {categoryPath.length > 0 && (
                            <button
                                className={styles.breadcrumbHome}
                                onClick={handleHomeClick}
                                aria-label="Вернуться к корню"
                            >
                                🏠
                            </button>
                        )}
                        {categoryPath.map((category, index) => (
                            <span key={category._id} className={styles.breadcrumbSeparator}>
                                <span className={styles.chevron}>/</span>
                                <button
                                    className={styles.breadcrumbItem}
                                    onClick={() => {
                                        const newPath = categoryPath.slice(0, index + 1);
                                        setCategoryPath(newPath);
                                        setCurrentCategory(category);
                                    }}
                                    aria-label={`Перейти к ${category.name}`}
                                >
                                    {category.name}
                                </button>
                            </span>
                        ))}
                    </nav>
                </div>

                {/* Кнопка назад */}
                {currentCategory && (
                    <div className={styles.backButtonContainer}>
                        <button
                            className={styles.backButton}
                            onClick={handleBackClick}
                            aria-label="Назад"
                        >
                            <span className={styles.backArrow}>←</span>
                            Назад
                        </button>
                    </div>
                )}

                {/* Контент */}
                {filteredItems.length === 0 ? (
                    <div className={styles.noResults}>
                        <h3>Ничего не найдено</h3>
                        <p>Попробуйте изменить запрос или выбрать другую категорию</p>
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
                    <div className={styles.itemsContainer}>
                        {/* Сетка категорий */}
                        {!currentCategory ? (
                            <div className={styles.categoriesGrid}>
                                {filteredItems.map((category) => {
                                    const displayData = getCategoryDisplay(category.name);
                                    return (
                                        <button
                                            key={category._id}
                                            className={styles.categoryCard}
                                            onClick={() => handleCategoryClick(category)}
                                            type="button"
                                            aria-label={`Открыть категорию: ${category.name}`}
                                        >
                                            <div className={styles.categoryIcon}>
                                                <Image
                                                    src={displayData.icon}
                                                    alt=""
                                                    className={styles.categoryImg}
                                                    width={48}
                                                    height={48}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <h2 className={styles.categoryName}>
                                                {displayData.label}
                                            </h2>
                                            <p className={styles.categoryDescription}>
                                                {category.description}
                                            </p>
                                            <span className={styles.categoryBadge}>
                                                {category.children?.length || 0} услуг
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Сетка подкатегорий и услуг */
                            <div className={styles.itemsGrid}>
                                {filteredItems.map((item) => (
                                    <button
                                        key={item._id}
                                        className={`${styles.itemCard} ${item.isCategory ? styles.categoryItem : styles.serviceItem
                                            }`}
                                        onClick={() => item.isCategory
                                            ? handleCategoryClick(item)
                                            : handleBookingClick(item)
                                        }
                                        type="button"
                                        aria-label={item.isCategory
                                            ? `Открыть: ${item.name}`
                                            : `Записаться: ${item.name}, ${formatPrice(item.price)}`
                                        }
                                    >
                                        <div className={styles.itemHeader}>
                                            <h3 className={styles.itemName}>{item.name}</h3>
                                            {item.isCategory ? (
                                                <span className={styles.itemType}>Категория</span>
                                            ) : (
                                                <span className={styles.priceTag}>
                                                    {formatPrice(item.price)}
                                                </span>
                                            )}
                                        </div>

                                        <p className={styles.itemDescription}>
                                            {item.description}
                                        </p>

                                        <div className={styles.itemFooter}>
                                            {item.isCategory ? (
                                                <>
                                                    <span className={styles.itemsCount}>
                                                        {item.children?.length || 0} услуг
                                                    </span>
                                                    <span className={styles.arrowIcon}>→</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className={styles.serviceTime}>
                                                        {item.description?.includes('день')
                                                            ? 'В течение дня'
                                                            : 'Уточняйте'}
                                                    </span>
                                                    <span className={styles.bookButton}>
                                                        Записаться
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Модальное окно */}
            {isBookingFormOpen && selectedService && (
                <BookingForm
                    service={selectedService}
                    onClose={handleCloseBooking}
                    onBookingSuccess={handleBookingSuccess}
                />
            )}
        </section>
    );
};

export default ServicePricePage;