// src/components/NewsSlider/NewsSlider.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './NewsSlider.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

// Извлечение первого медиа (изображение или видео) из contentBlocks
// ✅ ИСПРАВЛЕНО: добавлен поиск видео-файлов
// ✅ ИСПРАВЛЕНО: теперь ищет и изображения, и видео-файлы
const getFirstMedia = (contentBlocks) => {
    if (!Array.isArray(contentBlocks)) return null;

    // 1. Сначала ищем изображение (приоритет для карточки)
    const imageBlock = contentBlocks.find(block =>
        block.type === 'image' && block.media
    );
    if (imageBlock) {
        return { type: 'image', url: imageBlock.media, alt: imageBlock.alt || '' };
    }

    // 2. Если нет изображения — ищем видео-файл
    const videoBlock = contentBlocks.find(block =>
        block.type === 'video' && block.media
    );
    if (videoBlock) {
        return { type: 'video', url: videoBlock.media, alt: videoBlock.description || 'Видео' };
    }

    // 3. YouTube видео
    const youtubeBlock = contentBlocks.find(block =>
        block.type === 'youtube' && block.videoUrl
    );
    if (youtubeBlock) {
        return {
            type: 'youtube',
            url: youtubeBlock.thumbnail || `https://img.youtube.com/vi/${youtubeBlock.videoUrl}/hqdefault.jpg`,
            alt: youtubeBlock.description || 'Видео'
        };
    }

    return null;
};

// Форматирование даты
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default function NewsSlider({ limit = 5, autoPlay = true, interval = 8000 }) {
    const [news, setNews] = useState([]);
    const [current, setCurrent] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
    const [isHovered, setIsHovered] = useState(false);

    const touchStartX = useRef(null);
    const sliderRef = useRef(null);

    // Загрузка новостей
    useEffect(() => {
        let isMounted = true;

        const fetchNews = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/news?isPublished=true&limit=${limit}&fields=title,slug,excerpt,publishedAt,contentBlocks,featuredImage`,
                    { next: { revalidate: 300 } }
                );
                const data = await response.json();

                if (isMounted && data?.success && data.data?.length > 0) {
                    const processedNews = data.data.map(item => ({
                        ...item,
                        media: getFirstMedia(item.contentBlocks) || (item.featuredImage ? {
                            type: 'image',
                            url: item.featuredImage,
                            alt: item.title
                        } : null)
                    })).filter(item => item.media); // Только новости с медиа

                    setNews(processedNews);
                    setIsLoaded(true);
                }
            } catch (err) {
                console.error('Error loading news:', err);
            }
        };

        fetchNews();
        return () => { isMounted = false; };
    }, [limit]);

    // Автовоспроизведение
    useEffect(() => {
        if (!isAutoPlay || isHovered || news.length <= 1) return;

        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % news.length);
        }, interval);

        return () => clearInterval(timer);
    }, [isAutoPlay, isHovered, news.length, interval]);

    // Навигация
    const next = useCallback(() => {
        setCurrent(prev => (prev + 1) % news.length);
    }, [news.length]);

    const prev = useCallback(() => {
        setCurrent(prev => (prev - 1 + news.length) % news.length);
    }, [news.length]);

    const goToSlide = (index) => setCurrent(index);

    // Обработчики свайпа
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsAutoPlay(false);
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;

        if (diff > 50) prev();
        if (diff < -50) next();

        touchStartX.current = null;
        setIsAutoPlay(autoPlay);
    };

    // Пауза при наведении
    const handleMouseEnter = () => {
        setIsHovered(true);
        setIsAutoPlay(false);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsAutoPlay(autoPlay);
    };

    // Клавиатурная навигация
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    };

    if (!isLoaded || news.length === 0) {
        return (
            <div className={styles.newsSliderSkeleton}>
                <div className={styles.skeletonMedia}></div>
                <div className={styles.skeletonContent}>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonExcerpt}></div>
                    <div className={styles.skeletonDate}></div>
                </div>
            </div>
        );
    }

    const currentItem = news[current];
    const newsUrl = `/news/${currentItem.slug}`;

    return (
        <section
            className={styles.newsSlider}
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="новости"
            itemScope
            itemType="https://schema.org/ItemList"
        >
            {/* Кнопка "Назад" */}
            <button
                className={`${styles.sliderArrow} ${styles.prev}`}
                onClick={prev}
                aria-label="Предыдущая новость"
                type="button"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Вьюпорт слайдера */}
            <div className={styles.sliderViewport}>
                <div
                    className={styles.sliderTrack}
                    style={{ transform: `translateX(-${current * 100}%)` }}
                >
                    {news.map((item, index) => {
                        const isActive = index === current;
                        const media = item.media;

                        return (
                            <article
                                key={item._id || index}
                                className={`${styles.slide} ${isActive ? styles.active : ''}`}
                                itemScope
                                itemType="https://schema.org/NewsArticle"
                            >
                                {/* Медиа-контейнер */}
                                {/* Медиа-контейнер */}
                                <div className={styles.mediaContainer}>
                                    {media?.type === 'youtube' ? (
                                        <div className={styles.videoWrapper}>
                                            <iframe
                                                src={`https://www.youtube.com/embed/${media.url}?rel=0&modestbranding=1`}
                                                title={item.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen loading={isActive ? 'eager' : 'lazy'}
                                                className={styles.videoFrame} />
                                            <div className={styles.videoBadge}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                                Видео
                                            </div>
                                        </div>
                                    ) : media?.type === 'video' ? (
                                        // ✅ ДОБАВЛЕНО: рендеринг видео-файлов
                                        <video
                                            src={media.url}
                                            className={styles.slideImage}
                                            muted
                                            playsInline
                                            loop
                                            autoPlay={isActive}
                                            preload="metadata"
                                            style={{ objectFit: 'cover' }}
                                            itemProp="video"
                                        />
                                    ) : media?.type === 'image' ? (
                                        <Image
                                            src={media.url} alt={media.alt || item.title}
                                            className={styles.slideImage} width={1200} height={600}
                                            priority={isActive} quality={90}
                                            sizes="(max-width: 768px) 100vw, 800px"
                                            itemProp="image" />
                                    ) : (
                                        <div className={styles.noMedia}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className={styles.mediaOverlay}></div>
                                </div>

                                {/* Контент слайда */}
                                <Link href={newsUrl} className={styles.slideContent}>
                                    <div className={styles.contentInner}>
                                        <span className={styles.newsBadge}>Новость</span>

                                        <h2 className={styles.slideTitle} itemProp="headline">
                                            {item.title}
                                        </h2>

                                        {item.excerpt && (
                                            <p className={styles.slideExcerpt} itemProp="description">
                                                {item.excerpt}
                                            </p>
                                        )}

                                        <footer className={styles.slideFooter}>
                                            {item.publishedAt && (
                                                <time className={styles.slideDate} dateTime={item.publishedAt} itemProp="datePublished">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                                        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                    {formatDate(item.publishedAt)}
                                                </time>
                                            )}
                                            <span className={styles.readMore}>
                                                Читать →
                                            </span>
                                        </footer>
                                    </div>
                                </Link>

                                {/* Schema.org метаданные */}
                                <meta itemProp="url" content={`${API_URL}${newsUrl}`} />
                                {item.author && <meta itemProp="author" content={item.author} />}
                            </article>
                        );
                    })}
                </div>
            </div>

            {/* Кнопка "Вперёд" */}
            <button
                className={`${styles.sliderArrow} ${styles.next}`}
                onClick={next}
                aria-label="Следующая новость"
                type="button"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Индикаторы слайдов */}
            <div className={styles.sliderIndicators} role="tablist" aria-label="Выбор новости">
                {news.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.indicator} ${index === current ? styles.active : ''}`}
                        onClick={() => goToSlide(index)}
                        role="tab"
                        aria-selected={index === current}
                        aria-controls={`slide-${index}`}
                        aria-label={`Новость ${index + 1} из ${news.length}`}
                        type="button"
                    >
                        <span className={styles.indicatorDot}></span>
                    </button>
                ))}
            </div>

            {/* Счётчик слайдов */}
            <div className={styles.slideCounter} aria-hidden="true">
                <span>{String(current + 1).padStart(2, '0')}</span>
                <span>/</span>
                <span>{String(news.length).padStart(2, '0')}</span>
            </div>

            {/* CTA-кнопка "Все новости" */}
            <div className={styles.sliderCTA}>
                <Link href="/news" className={styles.ctaButton}>
                    Все новости
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}