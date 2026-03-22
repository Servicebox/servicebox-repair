// components/ServicePricePage/ServicePricePage.jsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ServicePricePage.module.css';
import BookingForm from "../BookingForm/BookingForm";

// Метаданные (для SEO, если используется App Router с generateMetadata)
export const metadata = {
    title: 'Цены на услуги по ремонту техники | Все виды ремонта',
    description: 'Профессиональный ремонт ноутбуков, телефонов, компьютеров и другой техники. Гарантия качества. Запишитесь онлайн!',
};

// Импорт иконок
const Notebook = "/images/notebook.webp";
const Monoblok = "/images/monoblok.webp";
const Applefon = "/images/apple.webp";
const Android = "/images/android.webp";
const Tablet = "/images/tablet.webp";
const Tv = "/images/tv.webp";
const Glass = "/images/glass.webp";
const Videocard = "/images/videocard.webp";
const Devices = "/images/Devices.webp";

const ServicePricePage = () => {
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Навигация по категориям
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryPath, setCategoryPath] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Категории с иконками и цветами
    const categoryData = useMemo(() => ({
        'Ремонт ноутбуков': { icon: Notebook, color: 'transparent', name: 'Ремонт ноутбуков' },
        'Ремонт телефонов': { icon: Android, color: 'transparent', name: 'Ремонт телефонов' },
        'Ремонт компьютеров': { icon: Monoblok, color: 'transparent', name: 'Компьютеры и моноблоки' },
        'Техника Apple': { icon: Applefon, color: 'transparent', name: 'Apple техника' },
        'Ремонт планшетов': { icon: Tablet, color: 'transparent', name: 'Планшеты' },
        'Ремонт телевизоров': { icon: Tv, color: 'transparent', name: 'Телевизоры' },
        'Замена стекла': { icon: Glass, color: 'transparent', name: 'Замена стекла' },
        'Ремонт видеокарт': { icon: Videocard, color: 'transparent', name: 'Видеокарты' },
        'Другие услуги': { icon: Devices, color: 'transparent', name: 'Другие устройства' }
    }), []);

    // Загрузка услуг
    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services?tree=true');
                const data = await response.json();

                if (isMounted && data.success) {
                    setServices(data.data);
                    const rootCategories = data.data.filter(service =>
                        service.isCategory && !service.parent
                    );
                    setCategories(rootCategories);
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

    // Получение текущих элементов для отображения
    const currentItems = useMemo(() => {
        if (!currentCategory) return categories;

        const findCategoryItems = (categoryId, allServices) => {
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
            return findInTree(allServices, categoryId) || [];
        };

        return findCategoryItems(currentCategory._id, services);
    }, [currentCategory, categories, services]);

    // Фильтрация по поиску
    const filteredItems = useMemo(() => {
        if (!searchQuery) return currentItems;
        const query = searchQuery.toLowerCase();
        return currentItems.filter(item => {
            const name = item.name?.toLowerCase() || '';
            const desc = item.description?.toLowerCase() || '';
            return name.includes(query) || desc.includes(query);
        });
    }, [currentItems, searchQuery]);

    // Обработчики навигации
    const handleCategoryClick = useCallback((category) => {
        if (category.isCategory) {
            setCurrentCategory(category);
            setCategoryPath(prev => [...prev, category]);
        }
    }, []);

    const handleBackClick = useCallback(() => {
        if (categoryPath.length > 0) {
            const newPath = [...categoryPath];
            newPath.pop();
            setCategoryPath(newPath);
            setCurrentCategory(newPath[newPath.length - 1] || null);
        } else {
            setCurrentCategory(null);
        }
    }, [categoryPath]);

    const handleHomeClick = useCallback(() => {
        setCurrentCategory(null);
        setCategoryPath([]);
        setSearchQuery('');
    }, []);

    const handleBookingClick = useCallback((service, e) => {
        if (e) e.stopPropagation();
        setSelectedService(service);
        setIsBookingFormOpen(true);
    }, []);

    const handleBookingSuccess = useCallback((bookingData) => {
        alert(`Запись создана! Ваш код: ${bookingData.trackingCode}`);
        setIsBookingFormOpen(false);
        setSelectedService(null);
    }, []);

    const formatPrice = useCallback((price) => {
        if (!price || price === '') return 'Уточняйте';
        if (String(price).includes('₽') || String(price).includes('руб')) return price;
        return `${price} ₽`;
    }, []);

    // Анимации для framer-motion
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    if (loading) {
        return (
            <motion.div className={styles.servicePricePage}>
                <div className={styles.contentWrapper}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Загружаем услуги...</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.section
            id="services"
            className={styles.servicePricePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className={styles.contentWrapper}>
                {/* Заголовок */}
                <header className={styles.animatedTitle}>
                    <motion.h1
                        initial={{ y: -15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {currentCategory ? currentCategory.name : 'Услуги по ремонту техники'}
                    </motion.h1>
                    <motion.p
                        initial={{ y: -15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        {currentCategory ? currentCategory.description : 'Ремонтируем любую технику с гарантией качества'}
                    </motion.p>
                </header>

                {/* Управление: крошки и поиск */}
                <div className={styles.controlsContainer}>
                    <motion.nav
                        className={styles.breadcrumbs}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        aria-label="Навигация по категориям"
                    >
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
                    </motion.nav>
                </div>

                {/* Кнопка назад */}
                {currentCategory && (
                    <motion.div
                        className={styles.backButtonContainer}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <button
                            className={styles.backButton}
                            onClick={handleBackClick}
                            aria-label="Назад"
                        >
                            <span className={styles.backArrow}>←</span>
                            Назад
                        </button>
                    </motion.div>
                )}

                {/* Сетка элементов */}
                {filteredItems.length === 0 ? (
                    <motion.div
                        className={styles.noResults}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
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
                    </motion.div>
                ) : (
                    <motion.div
                        className={styles.itemsContainer}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Горизонтальная сетка категорий */}
                        {!currentCategory && (
                            <div className={styles.categoriesGrid}>
                                {filteredItems.map((category) => {
                                    const displayData = categoryData[category.name] || {
                                        icon: Devices, name: category.name
                                    };

                                    return (
                                        <motion.button
                                            key={category._id}
                                            className={styles.categoryCard}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.02, y: -3 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleCategoryClick(category)}
                                            type="button"
                                            aria-label={`Открыть категорию: ${category.name}`}
                                        >
                                            <div className={styles.categoryIcon}>
                                                {displayData.icon ? (
                                                    <Image
                                                        src={displayData.icon}
                                                        alt=""
                                                        className={styles.categoryImg}
                                                        width={48}
                                                        height={48}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <span className={styles.defaultIcon}>📋</span>
                                                )}
                                            </div>
                                            <h2 className={styles.categoryName}>
                                                {displayData.name}
                                            </h2>
                                            <p className={`${styles.categoryDescription} ${styles.textClamp2}`}>
                                                {category.description}
                                            </p>
                                            <span className={styles.categoryBadge}>
                                                {category.children?.length || 0} услуг
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Вертикальная сетка подкатегорий и услуг */}
                        {currentCategory && (
                            <div className={styles.itemsGrid}>
                                {filteredItems.map((item) => (
                                    <motion.button
                                        key={item._id}
                                        className={`${styles.itemCard} ${item.isCategory ? styles.categoryItem : styles.serviceItem
                                            }`}
                                        variants={itemVariants}
                                        whileHover={{ y: -3 }}
                                        whileTap={{ scale: 0.99 }}
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
                                        {item.isCategory ? (
                                            // Подкатегория
                                            <>
                                                <div className={styles.itemHeader}>
                                                    <h3 className={`${styles.itemName} ${styles.textClamp2}`}>
                                                        {item.name}
                                                    </h3>
                                                    <span className={styles.itemType}>Категория</span>
                                                </div>
                                                <p className={`${styles.itemDescription} ${styles.textClamp3}`}>
                                                    {item.description}
                                                </p>
                                                <div className={styles.itemFooter}>
                                                    <span className={styles.itemsCount}>
                                                        {item.children?.length || 0} услуг
                                                    </span>
                                                    <span className={styles.arrowIcon}>→</span>
                                                </div>
                                            </>
                                        ) : (
                                            // Услуга
                                            <>
                                                <div className={styles.itemHeader}>
                                                    <h3 className={`${styles.itemName} ${styles.textClamp2}`}>
                                                        {item.name}
                                                    </h3>
                                                    <span className={styles.priceTag}>
                                                        {formatPrice(item.price)}
                                                    </span>
                                                </div>
                                                <p className={`${styles.itemDescription} ${styles.textClamp3}`}>
                                                    {item.description}
                                                </p>
                                                <div className={styles.itemFooter}>
                                                    <span className={styles.serviceTime}>
                                                        {item.description?.includes('день') ? 'В течение дня' : 'Уточняйте'}
                                                    </span>
                                                    <span className={styles.bookButton}>
                                                        Записаться
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Модальное окно формы записи */}
            <AnimatePresence>
                {isBookingFormOpen && selectedService && (
                    <BookingForm
                        service={selectedService}
                        onClose={() => {
                            setIsBookingFormOpen(false);
                            setSelectedService(null);
                        }}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}
            </AnimatePresence>
        </motion.section>
    );
};

export default ServicePricePage;