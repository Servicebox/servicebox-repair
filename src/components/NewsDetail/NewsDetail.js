// src/components/NewsDetail/NewsDetail.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './NewsDetail.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

// Компонент JSON-LD для структурированных данных
const NewsJsonLd = ({ news, slug }) => {
  if (!news) return null;

  const textContent = news.contentBlocks
    ?.filter(b => b.type === 'text')
    .map(b => b.content)
    .join(' ') || '';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.excerpt,
    image: news.featuredImage ? [news.featuredImage] : undefined,
    datePublished: news.publishedAt || news.createdAt,
    dateModified: news.updatedAt,
    author: {
      '@type': 'Organization',
      name: news.author || 'ServiceBox',
      url: `${API_URL}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServiceBox',
      logo: {
        '@type': 'ImageObject',
        url: `${API_URL}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${API_URL}/news/${slug}`,
    },
    articleBody: textContent.substring(0, 5000),
    wordCount: textContent.split(/\s+/).filter(Boolean).length,
    inLanguage: 'ru-RU',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

// Компонент рендеринга блоков контента
const ContentBlockRenderer = ({ blocks }) => {
  if (!Array.isArray(blocks)) return null;

  return (
    <div className={styles.contentBlocks}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={index} className={styles.heading}>
                {block.content}
              </h2>
            );

          case 'text':
            return (
              <div
                key={index}
                className={styles.textBlock}
                dangerouslySetInnerHTML={{ __html: block.content?.replace(/\n/g, '<br>') }}
              />
            );

          case 'image':
            return block.media ? (
              <figure key={index} className={styles.imageBlock}>
                <Image
                  src={block.media}
                  alt={block.alt || block.description || 'Изображение новости'}
                  width={800}
                  height={500}
                  className={styles.contentImage}
                  loading="lazy"
                />
                {block.description && (
                  <figcaption className={styles.imageCaption}>
                    {block.description}
                  </figcaption>
                )}
              </figure>
            ) : null;

          case 'youtube':
            return block.videoUrl ? (
              <div key={index} className={styles.videoBlock}>
                <div className={styles.videoContainer}>
                  <iframe
                    src={`https://www.youtube.com/embed/${block.videoUrl}?rel=0`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {block.description && (
                  <p className={styles.videoCaption}>{block.description}</p>
                )}
              </div>
            ) : null;

          case 'list':
            return block.content ? (
              <ul key={index} className={styles.listBlock}>
                {block.content.split('\n').filter(Boolean).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : null;

          default:
            return null;
        }
      })}
    </div>
  );
};

export default function NewsDetail({ newsSlug }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!newsSlug) {
      setError('Не указан слаг новости');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/news/slug/${newsSlug}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.success) {
          setNews(data.data);
          setError(null);

          // Обновление заголовка страницы для доступности
          if (data.data?.title) {
            document.title = `${data.data.title} | ServiceBox Вологда`;
          }
        } else {
          throw new Error(data.error || 'Новость не найдена');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching news:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNews();
    return () => { isMounted = false; };
  }, [newsSlug]);

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Состояние загрузки
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка новости...</p>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error || !news) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Новость не найдена</h2>
          <p>{error || 'Запрошенная новость не существует или снята с публикации'}</p>
          <a href="/news" className={styles.backLink}>
            ← Вернуться к списку новостей
          </a>
        </div>
      </div>
    );
  }

  return (
    <article className={styles.container} itemScope itemType="https://schema.org/NewsArticle">
      {/* JSON-LD для поисковиков и ИИ */}
      <NewsJsonLd news={news} slug={newsSlug} />

      {/* Хлебные крошки */}
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <ol itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href="/" itemProp="item">
              <span itemProp="name">Главная</span>
            </a>
            <meta itemProp="position" content="1" />
          </li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href="/news" itemProp="item">
              <span itemProp="name">Новости</span>
            </a>
            <meta itemProp="position" content="2" />
          </li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span itemProp="name">{news.title}</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      {/* Заголовок и мета-информация */}
      <header className={styles.header}>
        <h1 className={styles.title} itemProp="headline">
          {news.title}
        </h1>

        <div className={styles.meta}>
          {news.publishedAt && (
            <time
              className={styles.date}
              dateTime={news.publishedAt}
              itemProp="datePublished"
            >
              Опубликовано: {formatDate(news.publishedAt)}
            </time>
          )}
          {news.updatedAt && news.updatedAt !== news.publishedAt && (
            <time
              className={styles.date}
              dateTime={news.updatedAt}
              itemProp="dateModified"
            >
              Обновлено: {formatDate(news.updatedAt)}
            </time>
          )}
          {news.author && (
            <span className={styles.author} itemProp="author" itemScope itemType="https://schema.org/Organization">
              <span itemProp="name">{news.author}</span>
            </span>
          )}
          {news.views > 0 && (
            <span className={styles.views} aria-label={`${news.views} просмотров`}>
              👁️ {news.views}
            </span>
          )}
        </div>

        {/* Главное изображение */}
        {news.featuredImage && (
          <figure className={styles.featuredImage}>
            <Image
              src={news.featuredImage}
              alt={news.title}
              width={1200}
              height={630}
              className={styles.mainImage}
              priority
              itemProp="image"
            />
          </figure>
        )}

        {/* Анонс */}
        {news.excerpt && (
          <p className={styles.excerpt} itemProp="description">
            {news.excerpt}
          </p>
        )}
      </header>

      {/* Основной контент */}
      <ContentBlockRenderer blocks={news.contentBlocks} />

      {/* Теги/ключевые слова */}
      {news.keywords?.length > 0 && (
        <footer className={styles.footer}>
          <div className={styles.tags}>
            <strong>Теги:</strong>
            {news.keywords.map((keyword, index) => (
              <span key={index} className={styles.tag}>
                {keyword}
              </span>
            ))}
          </div>

          {/* Кнопки поделиться */}
          <div className={styles.share}>
            <strong>Поделиться:</strong>
            <div className={styles.shareButtons}>
              <a
                href={`https://vk.com/share.php?url=${encodeURIComponent(news.seo?.url || window.location.href)}&title=${encodeURIComponent(news.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
                aria-label="Поделиться ВКонтакте"
              >
                ВКонтакте
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(news.seo?.url || window.location.href)}&text=${encodeURIComponent(news.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareButton}
                aria-label="Поделиться в Telegram"
              >
                Telegram
              </a>
            </div>
          </div>
        </footer>
      )}

      {/* Навигация */}
      <nav className={styles.navigation}>
        <a href="/news" className={styles.backLink}>
          ← Все новости
        </a>
      </nav>
    </article>
  );
}