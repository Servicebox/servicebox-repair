'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    }, [searchQuery, selectedCategory, services]);

    const handleBookingClick = (service, e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedService(service);
        setIsBookingFormOpen(true);
        setActiveService(null); // Закрываем детали услуги при открытии формы
    };

    const handleBookingSuccess = (bookingData) => {
        console.log('Booking created:', bookingData);
        setIsBookingFormOpen(false);
        setSelectedService(null);
        // Можно добавить уведомление об успехе
    };

    const handleBookingClose = () => {
        setIsBookingFormOpen(false);
        setSelectedService(null);
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
            <motion.div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600">Загружаем услуги...</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gray-50 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-4">
                {/* Заголовок */}
                <div className="text-center mb-12">
                    <motion.h1
                        className="text-4xl font-bold text-gray-900 mb-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        Цены на услуги
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Прозрачное ценообразование без скрытых платежей
                    </motion.p>
                </div>

                {/* Поиск и фильтры */}
                <div className="mb-8 space-y-4">
                    <motion.div
                        className="max-w-md mx-auto"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔍 Поиск услуги..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex flex-wrap gap-2 justify-center"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {categories.map(category => {
                            const displayData = categoryData[category] || {};
                            
                            return (
                                <motion.button
                                    key={category}
                                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                                        selectedCategory === category 
                                            ? 'text-white' 
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
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
                                            <span className="mr-2">
                                                {displayData.icon ? (
                                                    <Image 
                                                        src={displayData.icon} 
                                                        alt={category} 
                                                        className="inline-block w-5 h-5"
                                                        width={20}
                                                        height={20}
                                                        unoptimized
                                                    />
                                                ) : (
                                                    '📋'
                                                )}
                                            </span>
                                            {displayData.name || category}
                                        </>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Услуги */}
                {filteredServices.length === 0 ? (
                    <motion.div
                        className="text-center py-12"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Услуги не найдены</h3>
                        <p className="text-gray-600 mb-6">Попробуйте изменить критерии поиска или выбрать другую категорию</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('Все');
                            }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Сбросить фильтры
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {Object.keys(groupedServices).map(category => {
                            const categoryServices = groupedServices[category];
                            const displayData = categoryData[category] || {};
                            
                            return (
                                <motion.div 
                                    key={category}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {selectedCategory === 'Все' && (
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                                            <div className="flex items-center">
                                                {displayData.icon ? (
                                                    <Image 
                                                        src={displayData.icon} 
                                                        alt={category} 
                                                        className="w-8 h-8 mr-3"
                                                        width={32}
                                                        height={32}
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="text-2xl mr-3">📋</span>
                                                )}
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {displayData.name || category}
                                                    <span className="text-sm text-gray-600 ml-2">
                                                        ({categoryServices.length})
                                                    </span>
                                                </h2>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {categoryServices.map(service => (
                                            <motion.div
                                                key={service._id}
                                                className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                                                    activeService === service._id 
                                                        ? 'border-blue-500 shadow-lg' 
                                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                }`}
                                                variants={item}
                                                whileHover={{ y: -5 }}
                                                onClick={() => setActiveService(activeService === service._id ? null : service._id)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="font-semibold text-lg text-gray-900 pr-4">{service.serviceName}</h3>
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                                                        {formatPrice(service.price)}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                                                
                                                {activeService === service._id && (
                                                    <motion.div 
                                                        className="border-t pt-4 mt-4"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                {displayData.icon ? (
                                                                    <Image 
                                                                        src={displayData.icon} 
                                                                        alt={category} 
                                                                        className="w-4 h-4 mr-1"
                                                                        width={16}
                                                                        height={16}
                                                                        unoptimized
                                                                    />
                                                                ) : (
                                                                    '📋'
                                                                )}
                                                                {displayData.name || service.category}
                                                            </span>
                                                        </div>
                                                        
                                                        <button 
                                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                                                            onClick={(e) => handleBookingClick(service, e)}
                                                        >
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            Записаться на услугу
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Модальное окно формы записи */}
            <AnimatePresence>
                {isBookingFormOpen && selectedService && (
                    <BookingForm 
                        service={selectedService}
                        onClose={handleBookingClose}
                        onBookingSuccess={handleBookingSuccess}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AllServicesPage;