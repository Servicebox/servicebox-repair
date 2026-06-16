'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NewsBlock = ({ limit = 3 }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(`/api/news?limit=${limit}&published=true`);
                const data = await response.json();
                if (data.success) {
                    setNews(data.data.slice(0, limit));
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [limit]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Сегодня';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const getBadge = (news) => {
        if (news.isPromotion) return { text: '🎁 Акция', color: 'bg-gradient-to-r from-pink-500 to-rose-500' };
        if (news.isImportant) return { text: '⚡ Важно', color: 'bg-gradient-to-r from-orange-500 to-red-500' };

        const daysDiff = Math.floor((new Date() - new Date(news.publishedAt)) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 3) return { text: '🆕 Новое', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' };

        return null;
    };

    if (loading) {
        return (
            <section className="py-16 bg-transparent">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#002147' }}>
                            📰 Последние новости
                        </h2>
                        <p className="text-gray-600 text-lg">Загрузка новостей...</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(limit)].map((_, i) => (
                            <div key={i} className="bg-transparent rounded-2xl overflow-hidden shadow-lg animate-pulse">
                                <div className="h-48 bg-gray-200" />
                                <div className="p-6">
                                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/3" />
                                    <div className="h-6 bg-gray-200 rounded mb-2" />
                                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (news.length === 0) return null;

    return (
        <section className="py-16 bg-transparent">
            <div className="max-w-7xl mx-auto px-4">
                {/* Заголовок */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#002147' }}>
                            📰 Последние новости
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Акции, советы по ремонту и новости сервиса
                        </p>
                    </div>
                    <Link
                        href="/news"
                        className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
                        style={{ background: '#002147' }}
                    >
                        Все новости
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </Link>
                </div>

                {/* Сетка новостей */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item, index) => {
                        const badge = getBadge(item);
                        return (
                            <Link
                                key={item._id || index}
                                href={`/news/${item.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Изображение */}
                                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                                    {item.featuredImage ? (
                                        <Image
                                            src={item.featuredImage}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">
                                            📰
                                        </div>
                                    )}

                                    {/* Бейдж */}
                                    {badge && (
                                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg ${badge.color}`}>
                                            {badge.text}
                                        </div>
                                    )}

                                    {/* Затемнение при hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Контент */}
                                <div className="p-6">
                                    {/* Дата и категория */}
                                    <div className="flex items-center gap-3 mb-3 text-sm">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            {formatDate(item.publishedAt)}
                                        </span>
                                        {item.category && (
                                            <span className="text-blue-600 font-medium">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>

                                    {/* Заголовок */}
                                    <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ color: '#002147' }}>
                                        {item.title}
                                    </h3>

                                    {/* Описание */}
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                        {item.excerpt || item.description?.substring(0, 120) + '...'}
                                    </p>

                                    {/* Читать далее */}
                                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                                        Читать далее
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Кнопка для мобильных */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
                        style={{ background: '#002147' }}
                    >
                        Все новости
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default NewsBlock;