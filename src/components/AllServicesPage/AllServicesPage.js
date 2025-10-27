// app/services/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import BookingForm from "../../components/BookingForm/BookingForm";

const AllServicesPage = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Все');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeService, setActiveService] = useState(null);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Данные категорий с абсолютными путями
    const categoryData = {
        'Ноутбук': { icon: "/images/notebook.webp", color: '#4e73df', name: 'Ноутбуки' },
        'Моноблок': { icon: "/images/monoblok.webp", color: '#1cc88a', name: 'Компьютеры и моноблоки' },
        'Аппл': { icon: "/images/apple.webp", color: '#36b9cc', name: 'Apple техника' },
        'Телефон': { icon: "/images/android.webp", color: '#f6c23e', name: 'Телефоны' },
        'Планшеты': { icon: "/images/tablet.webp", color: '#e74a3b', name: 'Планшеты' },
        'Телевизор': { icon: "/images/tv.webp", color: '#6f42c1', name: 'Телевизоры' },
        'Замена стекла': { icon: "/images/glass.webp", color: '#fd7e14', name: 'Замена стекла' },
        'Видеокарты': { icon: "/images/videocard.webp", color: '#20c997', name: 'Видеокарты' },
        'Другие': { icon: "/images/Devices.webp", color: '#6610f2', name: 'Другие устройства' },
        'Замена переднего стекла на телефонах': { icon: "/images/glass.webp", color: '#e83e8c', name: 'Замена стекла' }
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
                const response = await fetch('/api/service');
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
    }, [searchQuery, selectedCategory, services]);

    const handleBookingClick = (service, e) => {
        e.stopPropagation();
        setSelectedService(service);
        setIsBookingFormOpen(true);
    };

    const handleBookingSuccess = (bookingData) => {
        alert(`Запись создана! Ваш код: ${bookingData.trackingCode}`);
        setIsBookingFormOpen(false);
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
                    Цены на услуги
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
                        placeholder="🔍 Поиск услуги..."
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
                                                    width={20}
                                                    height={20}
                                                    unoptimized // Добавляем для WebP
                                                />
                                            ) : (
                                                '📋'
                                            )}
                                        </span>
                                        <span className={styles.categoryText}>
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
                                                    unoptimized // Добавляем для WebP
                                                />
                                            ) : (
                                                <span className={styles.categoryIcon}>📋</span>
                                            )}
                                            <h2 className={styles.categoryTitle}>
                                                {displayData.name || category}
                                            </h2>
                                        </div>
                                        <div 
                                            className={styles.categoryDivider}
                                            style={{ backgroundColor: displayData.color || '#4e73df' }}
                                        ></div>
                                    </div>
                                )}
                                
                                <motion.div 
                                    className={styles.servicesGrid}
                                    variants={container}
                                >
                                    {categoryServices.map(service => (
                                        <motion.div
                                            key={service._id}
                                            className={`${styles.serviceCard} ${activeService === service._id ? styles.active : ''}`}
                                            variants={item}
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
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className={styles.serviceMeta}>
                                                        <span className={styles.categoryBadge}>
                                                            {displayData.icon ? (
                                                                <Image 
                                                                    src={displayData.icon} 
                                                                    alt={category} 
                                                                    className={styles.badgeIcon}
                                                                    width={16}
                                                                    height={16}
                                                                    unoptimized // Добавляем для WebP
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
                                </motion.div>
                            </motion.div>
                        );
                    })}
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

export default AllServicesPage;