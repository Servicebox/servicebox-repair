'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './ServicePricePage.module.css';
import BookingForm from "../BookingForm/BookingForm";

// Импорт иконок
import Notebook from "../../../public/images/notebook.webp";
import Monoblok from "../../../public/images/monoblok.webp";
import Applefon from "../../../public/images/apple.webp";
import Android from "../../../public/images/android.webp";
import Tablet from "../../../public/images/tablet.webp";
import Tv from "../../../public/images/tv.webp";
import Glass from "../../../public/images/glass.webp";
import Videocard from "../../../public/images/videocard.webp";
import Devices from "../../../public/images/Devices.webp";

const ServicePricePage = () => {
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeService, setActiveService] = useState(null);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [visibleServices, setVisibleServices] = useState(6); // Начальное количество видимых услуг

    // Категории с иконками и цветами
    const categoryData = {
        'Ноутбук': { icon: Notebook, color: '#4e73df', name: 'Ноутбуки' },
        'Моноблок': { icon: Monoblok, color: '#1cc88a', name: 'Компьютеры и моноблоки' },
        'Аппл': { icon: Applefon, color: '#36b9cc', name: 'Apple техника' },
        'Телефон': { icon: Android, color: '#f6c23e', name: 'Телефоны' },
        'Планшеты': { icon: Tablet, color: '#e74a3b', name: 'Планшеты' },
        'Телевизор': { icon: Tv, color: '#6f42c1', name: 'Телевизоры' },
        'Замена стекла': { icon: Glass, color: '#fd7e14', name: 'Замена стекла' },
        'Видеокарты': { icon: Videocard, color: '#20c997', name: 'Видеокарты' },
        'Другие': { icon: Devices, color: '#6610f2', name: 'Другие устройства' },
        'Замена переднего стекла на телефонах': { icon: Glass, color: '#e83e8c', name: 'Замена стекла' }
    };

    // Группировка услуг по категориям
    const groupedServices = useMemo(() => {
        const groups = {};
        
        filteredServices.forEach(service => {
            const category = service.category || 'Другие';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(service);
        });
        
        return groups;
    }, [filteredServices]);

    // Загрузка услуг
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services');
                const data = await response.json();
                
                // Фильтрация невалидных услуг
                const validServices = data.filter(service => 
                    service.serviceName && service.description
                );
                
                setServices(validServices);
                setFilteredServices(validServices);
                
                // Извлечение уникальных категорий
                const uniqueCategories = [...new Set(validServices.map(s => s.category || 'Другие'))];
                setCategories(['Все', ...uniqueCategories]);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching services:', error);
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Обработка фильтрации
    useEffect(() => {
        let result = services;
        
        if (selectedCategory !== 'Все') {
            result = result.filter(service => 
                service.category === selectedCategory
            );
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(service => {
                const name = service.serviceName?.toLowerCase() || '';
                const desc = service.description?.toLowerCase() || '';
                return name.includes(query) || desc.includes(query);
            });
        }
        
        setFilteredServices(result);
        // Сброс состояния при изменении фильтров
        setExpandedCategories({});
    }, [searchQuery, selectedCategory, services]);

    const handleBookingClick = (service, e) => {
        if (e) e.stopPropagation();
        setSelectedService(service);
        setIsBookingFormOpen(true);
        setActiveService(null);
    };

    const handleBookingSuccess = (bookingData) => {
        alert(`Запись создана! Ваш код: ${bookingData.trackingCode}`);
        setIsBookingFormOpen(false);
    };

    const toggleCategoryExpansion = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const showMoreServices = () => {
        setVisibleServices(prev => prev + 6);
    };

    const showLessServices = () => {
        setVisibleServices(6);
    };

    const formatPrice = (price) => {
        if (!price) return '';
        if (price.includes('₽') || price.includes('руб')) return price;
        return `${price} ₽`;
    };

    // Анимации
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
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
            className={styles.servicePricePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.animatedTitle}>
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    Цены на услуги наши
                </motion.h1>
                <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Прозрачное ценообразование без скрытых платежей
                </motion.p>
            </div>

            <div className={styles.controlsContainer}>
                <motion.div
                    className={styles.searchContainer}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <input
                        type="text"
                        placeholder="Поиск услуги..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </motion.div>

                <motion.div
                    className={styles.categoryFilter}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {categories.map(category => {
                        const displayData = categoryData[category] || {};
                        
                        return (
                            <motion.button
                                key={category}
                                className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
                                onClick={() => setSelectedCategory(category)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ 
                                    backgroundColor: selectedCategory === category 
                                        ? displayData.color || '#4e73df' 
                                        : 'transparent',
                                    borderColor: displayData.color || '#4e73df'
                                }}
                            >
                                {category === 'Все' ? 'Все' : (
                                    <>
                                        <span className={styles.categoryIcon}>
                                            {displayData.icon ? (
                                                <Image 
                                                    src={displayData.icon} 
                                                    alt={category} 
                                                    className={styles.categoryImg}
                                                    width={24}
                                                    height={24}
                                                />
                                            ) : (
                                                '📋'
                                            )}
                                        </span>
                                        <span className={styles.categoryName}>
                                            {displayData.name || category}
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {filteredServices.length === 0 ? (
                <motion.div
                    className={styles.noResults}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <h3>Услуги не найдены</h3>
                    <p>Попробуйте изменить критерии поиска или выбрать другую категорию</p>
                </motion.div>
            ) : (
                <div className={styles.servicesContainer}>
                    {Object.keys(groupedServices).map(category => {
                        const categoryServices = groupedServices[category];
                        const displayData = categoryData[category] || {};
                        const isExpanded = expandedCategories[category];
                        const servicesToShow = isExpanded ? categoryServices : categoryServices.slice(0, visibleServices);
                        const hasMoreServices = categoryServices.length > visibleServices && !isExpanded;
                        
                        return (
                            <motion.div 
                                key={category}
                                className={styles.categoryGroup}
                                variants={container}
                                initial="hidden"
                                animate="show"
                            >
                                {selectedCategory === 'Все' && (
                                    <div className={styles.categoryHeader}>
                                        <div className={styles.categoryIconTitle}>
                                            {displayData.icon ? (
                                                <Image 
                                                    src={displayData.icon} 
                                                    alt={category} 
                                                    className={styles.categoryTitleImg}
                                                    width={32}
                                                    height={32}
                                                />
                                            ) : (
                                                <span className={styles.categoryIcon}>📋</span>
                                            )}
                                            <h2 className={styles.categoryTitle}>
                                                {displayData.name || category}
                                                <span className={styles.servicesCount}>
                                                    ({categoryServices.length})
                                                </span>
                                            </h2>
                                        </div>
                                        <div 
                                            className={styles.categoryDivider}
                                            style={{ backgroundColor: displayData.color || '#4e73df' }}
                                        ></div>
                                    </div>
                                )}
                                
                                <motion.div 
                                    className={`${styles.servicesGrid} ${!isExpanded ? styles.collapsed : ''}`}
                                    variants={container}
                                >
                                    <AnimatePresence>
                                        {servicesToShow.map(service => (
                                            <motion.div
                                                key={service._id}
                                                className={`${styles.serviceCard} ${activeService === service._id ? styles.active : ''}`}
                                                variants={item}
                                                layout
                                                whileHover={{ y: -5 }}
                                                onClick={() => setActiveService(activeService === service._id ? null : service._id)}
                                            >
                                                <div className={styles.cardHeader}>
                                                    <h3>{service.serviceName}</h3>
                                                    <span className={styles.priceTag}>
                                                        {formatPrice(service.price)}
                                                    </span>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <p className={styles.description}>{service.description}</p>
                                                </div>
                                                
                                                {activeService === service._id && (
                                                    <motion.div 
                                                        className={styles.serviceDetails}
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className={styles.serviceMeta}>
                                                            <span className={styles.categoryBadge}>
                                                                {displayData.icon ? (
                                                                    <Image 
                                                                        src={displayData.icon} 
                                                                        alt={category} 
                                                                        className={styles.badgeIcon}
                                                                        width={20}
                                                                        height={20}
                                                                    />
                                                                ) : (
                                                                    '📋'
                                                                )}
                                                                {displayData.name || service.category}
                                                            </span>
                                                        </div>
                                                        <div className={styles.serviceActions}>
                                                            <button 
                                                                className={styles.btnBook}
                                                                onClick={(e) => handleBookingClick(service, e)}
                                                            >
                                                                Записаться
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                                {hasMoreServices && (
                                    <div className={styles.showMoreContainer}>
                                        <button 
                                            className={styles.showMoreBtn}
                                            onClick={() => toggleCategoryExpansion(category)}
                                        >
                                            Показать еще {categoryServices.length - visibleServices} услуг
                                            <span className={styles.chevron}>▼</span>
                                        </button>
                                    </div>
                                )}

                                {/* Кнопка "Скрыть" когда категория раскрыта */}
                                {isExpanded && categoryServices.length > visibleServices && (
                                    <div className={styles.showMoreContainer}>
                                        <button 
                                            className={styles.showMoreBtn}
                                            onClick={() => toggleCategoryExpansion(category)}
                                        >
                                            Скрыть
                                            <span className={`${styles.chevron} ${styles.chevronUp}`}>▲</span>
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                    {selectedCategory === 'Все' && filteredServices.length > visibleServices && !Object.values(expandedCategories).some(Boolean) && (
                        <div className={styles.globalShowMore}>
                            <button 
                                className={styles.globalShowMoreBtn}
                                onClick={showMoreServices}
                            >
                                Показать еще услуг
                                <span className={styles.chevron}>▼</span>
                            </button>
                        </div>
                    )}
                    {selectedCategory === 'Все' && visibleServices > 6 && (
                        <div className={styles.globalShowMore}>
                            <button 
                                className={styles.globalShowMoreBtn}
                                onClick={showLessServices}
                            >
                                Скрыть
                                <span className={`${styles.chevron} ${styles.chevronUp}`}>▲</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isBookingFormOpen && (
                <BookingForm 
                    service={selectedService}
                    onClose={() => setIsBookingFormOpen(false)}
                    onBookingSuccess={handleBookingSuccess}
                />
            )}
        </motion.div>
    );
};

export default ServicePricePage;