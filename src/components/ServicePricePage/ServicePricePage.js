// src/components/ServicePricePage/ServicePricePage.jsx
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ServicePricePage.module.css';
// Импортируем калькулятор. Убедись, что путь указан верно!
import RepairCalculator from '../RepairCalculator/RepairCalculator';
import BookingForm from "../BookingForm/BookingForm";

export default function ServicePricePage() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Навигация по категориям (из БД)
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryPath, setCategoryPath] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Состояние для калькулятора (если открыт)
    const [activeCalculatorDevice, setActiveCalculatorDevice] = useState(null);

    // Маппинг категорий из БД на типы калькулятора (чтобы показывать нужные эмодзи и открывать нужный калькулятор)
    const CATEGORY_MAP = {
        'Ремонт телефонов': { icon: '📱', type: 'phone' },
        'Техника Apple': { icon: '🍎', type: 'phone' }, // Используем тип phone, так как в калькуляторе это бренды внутри phone
        'Ремонт ноутбуков': { icon: '💻', type: 'laptop' },
        'Ремонт планшетов': { icon: '📲', type: 'tablet' },
        'Ремонт телевизоров': { icon: '📺', type: 'tv' },
        'Ремонт видеокарт': { icon: '🔥', type: 'videocard' },
        // Для остальных можно оставить стандартные
        'Ремонт компьютеров': { icon: '🖥️', type: null },
        'Замена стекла': { icon: '🔨', type: null },
        'Другие услуги': { icon: '⚙️', type: null }
    };

    // Загрузка услуг из БД
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

    // Получение текущих элементов
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

    // Калькулятор доступен как дополнительная опция (не вместо услуг) для веток
    // с маппингом — телефоны/ноутбуки/ТВ/видеокарты, на любом уровне вложенности
    const rootCalculatorType = useMemo(() => {
        const root = categoryPath[0];
        return root ? CATEGORY_MAP[root.name]?.type ?? null : null;
    }, [categoryPath]);

    // Фильтрация
    const filteredItems = useMemo(() => {
        if (!searchQuery) return currentItems;
        const query = searchQuery.toLowerCase();
        return currentItems.filter(item => {
            const name = item.name?.toLowerCase() || '';
            const desc = item.description?.toLowerCase() || '';
            return name.includes(query) || desc.includes(query);
        });
    }, [currentItems, searchQuery]);

    // Обработчики
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
        setActiveCalculatorDevice(null); // Сброс калькулятора
    }, []);

    // Клик по карточке категории всегда открывает её услуги (как и должно быть) —
    // раньше для категорий с маппингом калькулятора (телефоны/ноутбуки/ТВ/видеокарты)
    // клик СРАЗУ открывал калькулятор МИНУЯ список услуг, из-за чего все вручную
    // добавленные услуги в этих категориях были недостижимы через навигацию сайта.
    // Калькулятор для таких категорий доступен отдельной кнопкой внутри списка.
    const handleCardClick = useCallback((category) => {
        handleCategoryClick(category);
    }, [handleCategoryClick]);

    const handleBookingClick = useCallback((service, e) => {
        if (e) e.stopPropagation();
        setSelectedService(service);
        setIsBookingFormOpen(true);
    }, []);

    const handleBookingSuccess = useCallback(() => {
        setIsBookingFormOpen(false);
        setSelectedService(null);
    }, []);

    const formatPrice = useCallback((price) => {
        if (!price || price === '') return 'Уточняйте';
        if (String(price).includes('₽') || String(price).includes('руб')) return price;
        return `${price} ₽`;
    }, []);

    // Анимации
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.section
            id="services"
            className={styles.servicePricePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            aria-label="Список услуг сервисного центра"
        >
            <div className={styles.contentWrapper}>
                {/* Заголовок рендерится всегда, включая состояние загрузки —
                    иначе первый HTML, который видит поисковый бот, содержит
                    только спиннер "Загружаем услуги..." без единого H1 */}
                <header className={styles.animatedTitle}>
                    <motion.h1 initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                        {currentCategory ? currentCategory.name : 'Услуги по ремонту техники в Вологде'}
                    </motion.h1>
                    <motion.p initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                        {currentCategory ? currentCategory.description : 'Ноутбуки, видеокарты, телефоны, планшеты, ТВ, приставки, Apple-техника — ремонт с гарантией и честными ценами'}
                    </motion.p>
                </header>

                {/* Пока данные грузятся */}
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Загружаем услуги...</p>
                    </div>
                ) : activeCalculatorDevice ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.calculatorContainer}
                    >
                        <button
                            onClick={() => setActiveCalculatorDevice(null)}
                            className={styles.backToServicesBtn}
                        >
                            ← Вернуться к списку услуг
                        </button>
                        <RepairCalculator initialDeviceType={activeCalculatorDevice} />
                    </motion.div>
                ) : (
                    // Обычный список услуг
                    <>
                        {/* Крошки и поиск */}
                        <div className={styles.controlsContainer}>
                            <motion.nav className={styles.breadcrumbs} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                {categoryPath.length > 0 && (
                                    <button className={styles.breadcrumbHome} onClick={handleHomeClick} aria-label="Вернуться к корню">🏠</button>
                                )}
                                {categoryPath.map((category, index) => (
                                    <span key={category._id} className={styles.breadcrumbSeparator}>
                                        <span className={styles.chevron}>/</span>
                                        <button className={styles.breadcrumbItem} onClick={() => {
                                            const newPath = categoryPath.slice(0, index + 1);
                                            setCategoryPath(newPath);
                                            setCurrentCategory(category);
                                        }}>{category.name}</button>
                                    </span>
                                ))}
                            </motion.nav>
                        </div>

                        {/* Кнопка назад + калькулятор (доп. опция, не вместо услуг) */}
                        {currentCategory && (
                            <motion.div className={styles.backButtonContainer} initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                <button className={styles.backButton} onClick={handleBackClick}>
                                    <span className={styles.backArrow}>←</span> Назад
                                </button>
                                {rootCalculatorType && (
                                    <button
                                        className={styles.backButton}
                                        onClick={() => setActiveCalculatorDevice(rootCalculatorType)}
                                    >
                                        🧮 Рассчитать стоимость онлайн
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {/* Сетка элементов */}
                        {filteredItems.length === 0 ? (
                            <motion.div className={styles.noResults} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <h3>Ничего не найдено</h3>
                                {searchQuery && <button onClick={() => setSearchQuery('')} className={styles.clearSearchButton}>Очистить поиск</button>}
                            </motion.div>
                        ) : (
                            <motion.div className={styles.itemsContainer} variants={containerVariants} initial="hidden" animate="show">
                                {/* Горизонтальная сетка категорий */}
                                {!currentCategory && (
                                    <div className={styles.categoriesGrid}>
                                        {filteredItems.map((category) => {
                                            // Берем иконку из маппинга или дефолтную
                                            const mapData = CATEGORY_MAP[category.name] || {};
                                            const icon = mapData.icon || '⚙️';
                                            const hasCalculator = !!mapData.type;

                                            return (
                                                <motion.button
                                                    key={category._id}
                                                    className={styles.categoryCard}
                                                    variants={itemVariants}
                                                    whileHover={{ scale: 1.02, y: -3 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleCardClick(category)}
                                                    aria-label={`Открыть категорию: ${category.name}`}
                                                >
                                                    <div className={styles.categoryIcon}>
                                                        <span style={{ fontSize: '4rem', lineHeight: 1 }} role="img" aria-hidden="true">
                                                            {icon}
                                                        </span>
                                                    </div>
                                                    <h2 className={styles.categoryName}>{category.name}</h2>
                                                    <p className={`${styles.categoryDescription} ${styles.textClamp2}`}>{category.description}</p>

                                                    <div className={styles.categoryFooter}>
                                                        <span className={styles.categoryBadge}>{category.children?.length || 0} услуг</span>
                                                        {hasCalculator && (
                                                            <span className={styles.calcBadge}>🧮 Калькулятор</span>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Вертикальная сетка подкатегорий */}
                                {currentCategory && (
                                    <div className={styles.itemsGrid}>
                                        {filteredItems.map((item) => (
                                            <motion.button
                                                key={item._id}
                                                className={`${styles.itemCard} ${item.isCategory ? styles.categoryItem : styles.serviceItem}`}
                                                variants={itemVariants}
                                                whileHover={{ y: -3 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => item.isCategory ? handleCategoryClick(item) : handleBookingClick(item)}
                                                aria-label={item.isCategory ? `Открыть: ${item.name}` : `Записаться: ${item.name}`}
                                            >
                                                <div className={styles.itemHeader}>
                                                    <h3 className={`${styles.itemName} ${styles.textClamp2}`}>{item.name}</h3>
                                                    {!item.isCategory && <span className={styles.priceTag}>{formatPrice(item.price)}</span>}
                                                </div>
                                                <p className={`${styles.itemDescription} ${styles.textClamp3}`}>{item.description}</p>
                                                <div className={styles.itemFooter}>
                                                    <span className={item.isCategory ? styles.itemsCount : styles.serviceTime}>
                                                        {item.isCategory ? `${item.children?.length || 0} услуг` : 'Записаться →'}
                                                    </span>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Модальное окно формы записи */}
            <AnimatePresence>
                {isBookingFormOpen && selectedService && (
                    <BookingForm
                        service={selectedService}
                        onClose={() => { setIsBookingFormOpen(false); setSelectedService(null); }}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}
            </AnimatePresence>
        </motion.section>
    );
};