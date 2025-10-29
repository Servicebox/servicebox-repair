// src/components/NewsList/NewsList.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './NewsList.module.css';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data?.success) {
          setNews(data.data);
        } else {
          setError('Ошибка загрузки новостей');
        }
      } catch (err) {
        setError('Ошибка при загрузке: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  const getFirstImage = (contentBlocks) => {
    if (!contentBlocks) return null;
    const imageBlock = contentBlocks.find(block => block.type === 'image');
    return imageBlock ? imageBlock.media : null;
  };

  const getContentExcerpt = (contentBlocks) => {
    if (!contentBlocks) return '';
    
    const textContent = contentBlocks
      .filter(block => block.type === 'text' && block.content)
      .map(block => block.content)
      .join(' ');
    
    return textContent.length > 150 
      ? textContent.substring(0, 150) + '...' 
      : textContent;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка новостей...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Новости и события</h1>
        <p className={styles.subtitle}>Будьте в курсе последних событий и акций</p>
      </div>

      {news.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📰</div>
          <h2>Новостей пока нет</h2>
          <p>Скоро здесь появятся свежие новости</p>
        </div>
      ) : (
        <div className={styles.newsGrid}>
          {news.map((item) => {
            const firstImage = getFirstImage(item.contentBlocks);
            const excerpt = getContentExcerpt(item.contentBlocks);
            
            return (
              <article key={item._id} className={styles.newsCard}>
                <Link href={`/news/${item._id}`} className={styles.cardLink}>
                  {firstImage && (
                    <div className={styles.imageContainer}>
                      <Image
                        src={block.media}
                        alt={item.title}
                        width={400}
                        height={250}
                        className={styles.image}
                        priority={false}
                      />
                      <div className={styles.imageOverlay}></div>
                    </div>
                  )}
                  
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle}>{item.title}</h2>
                      {excerpt && (
                        <p className={styles.cardExcerpt}>{excerpt}</p>
                      )}
                    </div>
                    
                    <div className={styles.cardFooter}>
                      <time className={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </time>
                      <span className={styles.readMore}>
                        Читать 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsList;