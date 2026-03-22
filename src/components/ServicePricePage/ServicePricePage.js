'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ServicePricePage.module.css';
import BookingForm from "../BookingForm/BookingForm";

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
    
    // Новые состояния для навигации по категориям
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryPath, setCategoryPath] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Категории с иконками и цветами
    const categoryData = {
        'Ремонт ноутбуков': { icon: Notebook, color: 'transparent', name: 'Ремонт ноутбуков' },
        'Ремонт телефонов': { icon: Android, color: 'transparent', name: 'Ремонт телефонов' },
        'Ремонт компьютеров': { icon: Monoblok, color: 'transparent', name: 'Компьютеры и моноблоки' },
        'Техника Apple': { icon: Applefon, color: 'transparent', name: 'Apple техника' },
        'Ремонт планшетов': { icon: Tablet, color: 'transparent', name: 'Планшеты' },
        'Ремонт телевизоров': { icon: Tv, color: 'transparent', name: 'Телевизоры' },
        'Замена стекла': { icon: Glass, color: 'transparent', name: 'Замена стекла' },
        'Ремонт видеокарт': { icon: Videocard, color: 'transparent', name: 'Видеокарты' },
        'Другие услуги': { icon: Devices, color: 'transparent', name: 'Другие устройства' }
    };

    // Загрузка услуг
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services?tree=true');
                const data = await response.json();
                
                if (data.success) {
                    setServices(data.data);
                    
                    // Извлекаем корневые категории (без родителя)
                    const rootCategories = data.data.filter(service => 
                        service.isCategory && !service.parent
                    );
                    setCategories(rootCategories);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Получение текущих элементов для отображения
    const currentItems = useMemo(() => {
        if (!currentCategory) {
            // Показываем корневые категории
            return categories;
        }

        // Показываем подкатегории и услуги текущей категории
        const findCategoryItems = (categoryId, allServices) => {
            let items = [];
            
            const findInTree = (services, targetId) => {
                for (const service of services) {
                    if (service._id === targetId) {
                        return service.children || [];
                    }
                    if (service.children) {
                        const found = findInTree(service.children, targetId);
                        if (found) return found;
                    }
                }
                return null;
            };

            return findInTree(allServices, categoryId) || [];
        };

        return findCategoryItems(currentCategory._id, services);
    }, [currentCategory, categories, services]);

    // Фильтрация по поисковому запросу
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
    const handleCategoryClick = (category) => {
        if (category.isCategory) {
            setCurrentCategory(category);
            setCategoryPath(prev => [...prev, category]);
        }
    };

    const handleBackClick = () => {
        if (categoryPath.length > 0) {
            const newPath = [...categoryPath];
            newPath.pop();
            setCategoryPath(newPath);
            setCurrentCategory(newPath[newPath.length - 1] || null);
        } else {
            setCurrentCategory(null);
        }
    };

    const handleHomeClick = () => {
        setCurrentCategory(null);
        setCategoryPath([]);
        setSearchQuery('');
    };

    const handleBookingClick = (service, e) => {
        if (e) e.stopPropagation();
        setSelectedService(service);
        setIsBookingFormOpen(true);
    };

    const handleBookingSuccess = (bookingData) => {
        alert(`Запись создана! Ваш код: ${bookingData.trackingCode}`);
        setIsBookingFormOpen(false);
    };

    const formatPrice = (price) => {
        if (!price || price === '') return 'Уточняйте';
        if (price.includes('₽') || price.includes('руб')) return price;
        return `${price} ₽`;
    };

    if (loading) {
        return (
            <motion.div className={styles.servicePricePage}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Загружаем услуги...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
        id="services" 
            className={styles.servicePricePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Заголовок */}
            <div className={styles.animatedTitle}>
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {currentCategory ? currentCategory.name : 'Услуги по ремонту техники'}
                </motion.h1>
                <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {currentCategory ? currentCategory.description : 'Ремонтируем любую технику с гарантией качества'}
                </motion.p>
            </div>

            {/* Навигация и поиск */}
            <div className={styles.controlsContainer}>
                {/* Хлебные крошки */}
                <motion.div
                    className={styles.breadcrumbs}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                  
                    
                    {categoryPath.map((category, index) => (
                        <span key={category._id} className={styles.breadcrumbSeparator}>
                            <span className={styles.chevron}></span>
                            <button 
                                className={styles.breadcrumbItem}
                                onClick={() => {
                                    const newPath = categoryPath.slice(0, index + 1);
                                    setCategoryPath(newPath);
                                    setCurrentCategory(category);
                                }}
                            >
                                {category.name}
                            </button>
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Кнопка назад */}
            {currentCategory && (
                <motion.div
                    className={styles.backButtonContainer}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <button 
                        className={styles.backButton}
                        onClick={handleBackClick}
                    >
                        <span className={styles.backArrow}>←</span>
                        Назад к {categoryPath.length > 1 ? categoryPath[categoryPath.length - 2]?.name : 'категориям'}
                    </button>
                </motion.div>
            )}

            {/* Сетка элементов */}
            {filteredItems.length === 0 ? (
                <motion.div
                    className={styles.noResults}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
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
                <div className={styles.itemsContainer}>
                    {/* Горизонтальная сетка для категорий */}
                    {!currentCategory && (
                        <motion.div 
                            className={styles.categoriesGrid}
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                        >
                            {filteredItems.map((category) => {
                                const displayData = categoryData[category.name] || {
                                    icon: Devices,
                                    
                                    name: category.name
                                };
                                
                                return (
                                    <motion.div
                                        key={category._id}
                                        className={styles.categoryCard}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                        whileHover={{ 
                                            scale: 1.05,
                                            y: -5
                                        }}
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        <div 
                                            className={styles.categoryIcon}
                                            style={{ backgroundColor: displayData.color }}
                                        >
                                            {displayData.icon ? (
                                                <Image 
                                                    src={displayData.icon} 
                                                    alt={category.name} 
                                                    className={styles.categoryImg}
                                                    width={48}
                                                    height={48}
                                                />
                                            ) : (
                                                <span className={styles.defaultIcon}>📋</span>
                                            )}
                                        </div>
                                        <h2 className={styles.categoryName}>
                                            {displayData.name}
                                        </h2>
                                        <p className={styles.categoryDescription}>
                                            {category.description}
                                        </p>
                                        <div className={styles.categoryBadge}>
                                            {category.children?.length || 0} услуг
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Вертикальная сетка для подкатегорий и услуг */}
                    {currentCategory && (
                        <motion.div 
                            className={styles.itemsGrid}
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                        >
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item._id}
                                    className={`${styles.itemCard} ${
                                        item.isCategory ? styles.categoryItem : styles.serviceItem
                                    }`}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ y: -2 }}
                                    onClick={() => item.isCategory ? handleCategoryClick(item) : handleBookingClick(item)}
                                >
                                    {item.isCategory ? (
                                        // Отображение подкатегории
                                        <>
                                            <div className={styles.itemHeader}>
                                                <h3 className={styles.itemName}>
                                                    {item.name}
                                                </h3>
                                                <span className={styles.itemType}>
                                                    Категория
                                                </span>
                                            </div>
                                            <p className={styles.itemDescription}>
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
                                        // Отображение услуги
                                        <>
                                            <div className={styles.itemHeader}>
                                                <h3 className={styles.itemName}>
                                                    {item.name}
                                                </h3>
                                                <span className={styles.priceTag}>
                                                    {formatPrice(item.price)}
                                                </span>
                                            </div>
                                            <p className={styles.itemDescription}>
                                                {item.description}
                                            </p>
                                            <div className={styles.itemFooter}>
                                                <span className={styles.serviceTime}>
                                                    {item.description.includes('день') ? 'В течение дня' : 'Уточняйте'}
                                                </span>
                                                <button 
                                                    className={styles.bookButton}
                                                    onClick={(e) => handleBookingClick(item, e)}
                                                >
                                                    Записаться
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            )}

            {/* Модальное окно формы записи */}
            <AnimatePresence>
                {isBookingFormOpen && selectedService && (
                    <BookingForm 
                        service={selectedService}
                        onClose={() => setIsBookingFormOpen(false)}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ServicePricePage;