// src/components/NewsList/NewsList.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './NewsList.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Загрузка новостей
  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/news?page=${page}&limit=12`);
        const data = await response.json();

        if (!isMounted) return;

        if (data?.success) {
          setNews(prev => page === 1 ? data.data : [...prev, ...data.data]);
          setHasMore(data.pagination?.page < data.pagination?.pages);
          setError(null);
        } else {
          setError(data.error || 'Ошибка загрузки новостей');
        }
      } catch (err) {
        if (isMounted) {
          setError('Ошибка при загрузке: ' + err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNews();
    return () => { isMounted = false; };
  }, [page]);

  // Извлечение первого изображения из контента
  const getFirstImage = (contentBlocks) => {
    if (!Array.isArray(contentBlocks)) return null;
    const imageBlock = contentBlocks.find(block =>
      block.type === 'image' && block.media
    );
    return imageBlock?.media || null;
  };

  // Генерация анонса из контента
  const getContentExcerpt = (contentBlocks, fallback) => {
    if (fallback) return fallback;
    if (!Array.isArray(contentBlocks)) return '';

    const textContent = contentBlocks
      .filter(block => block.type === 'text' && block.content)
      .map(block => block.content)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return textContent.length > 150
      ? textContent.substring(0, 150) + '...'
      : textContent;
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Обработчик "Загрузить ещё"
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Состояние загрузки
  if (loading && page === 1) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка новостей...</p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error && news.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Произошла ошибка</h3>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.container} aria-labelledby="news-heading">
      <header className={styles.header}>
        <h1 id="news-heading" className={styles.title}>Новости и события</h1>
        <p className={styles.subtitle}>Будьте в курсе последних событий и акций сервисного центра ServiceBox</p>
      </header>

      {news.length === 0 && !loading ? (
        <div className={styles.emptyState} role="status">
          <div className={styles.emptyIcon}>📰</div>
          <h2>Новостей пока нет</h2>
          <p>Скоро здесь появятся свежие новости о ремонте техники и специальных предложениях</p>
        </div>
      ) : (
        <>
          <div className={styles.newsGrid} role="list">
            {news.map((item) => {
              const firstImage = getFirstImage(item.contentBlocks);
              const excerpt = getContentExcerpt(item.contentBlocks, item.excerpt);
              const newsUrl = `/news/${item.slug}`;

              return (
                <article
                  key={item._id}
                  className={styles.newsCard}
                  role="listitem"
                  itemScope
                  itemType="https://schema.org/NewsArticle"
                >
                  <Link href={newsUrl} className={styles.cardLink}>
                    {/* Изображение */}
                    {firstImage && (
                      <div className={styles.imageContainer}>
                        <Image
                          src={firstImage}
                          alt={item.featuredImageAlt || item.title}
                          width={400}
                          height={250}
                          className={styles.image}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className={styles.imageOverlay}></div>
                      </div>
                    )}

                    {/* Контент карточки */}
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle} itemProp="headline">
                          {item.title}
                        </h2>
                        {excerpt && (
                          <p className={styles.cardExcerpt} itemProp="description">
                            {excerpt}
                          </p>
                        )}
                      </div>

                      <footer className={styles.cardFooter}>
                        <time
                          className={styles.date}
                          dateTime={item.publishedAt || item.createdAt}
                          itemProp="datePublished"
                        >
                          {formatDate(item.publishedAt || item.createdAt)}
                        </time>
                        <span className={styles.readMore} aria-label={`Читать новость: ${item.title}`}>
                          Читать
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </footer>
                    </div>
                  </Link>

                  {/* Микроразметка для карточки */}
                  <meta itemProp="url" content={`${API_URL}${newsUrl}`} />
                  {item.author && <meta itemProp="author" content={item.author} />}
                </article>
              );
            })}
          </div>

          {/* Кнопка "Загрузить ещё" */}
          {hasMore && (
            <div className={styles.loadMoreContainer}>
              <button
                onClick={loadMore}
                disabled={loading}
                className={styles.loadMoreButton}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinnerSmall}></span>
                    Загрузка...
                  </>
                ) : (
                  'Показать ещё новости'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default NewsList;