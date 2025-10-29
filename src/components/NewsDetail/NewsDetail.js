
// src/components/NewsDetail/NewsDetail.js
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './NewsDetail.module.css';

const NewsDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        if (!params.id || params.id === 'undefined') {
          setError('ID новости не указан');
          setLoading(false);
          return;
        }
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/news/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Новость не найдена');
        }
        
        const data = await response.json();
        
        if (data?.success) {
          setNewsItem(data.data);
        } else {
          throw new Error(data.error || 'Новость не найдена');
        }
      } catch (err) {
        setError(err.message);
        setTimeout(() => router.push('/news'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItem();
  }, [params.id, router]);

  const openFullscreen = (imageUrl, description) => {
    setCurrentImage({ url: imageUrl, description });
    setIsFullscreen(true);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setCurrentImage(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка новости...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Произошла ошибка</h3>
        <p>{error}</p>
        <p className={styles.redirectText}>Вы будете перенаправлены на страницу новостей...</p>
        <Link href="/news" className={styles.backLink}>
          ← Вернуться к новостям
        </Link>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>📰</div>
        <h3>Новость не найдена</h3>
        <p>Запрошенная новость не существует или была удалена</p>
        <Link href="/news" className={styles.backLink}>
          ← Вернуться к новостям
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isFullscreen && currentImage && (
        <div className={styles.fullscreenOverlay} onClick={closeFullscreen}>
          <div className={styles.fullscreenContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.fullscreenControls}>
              <button className={styles.controlBtn} onClick={handleZoomIn}>+</button>
              <button className={styles.controlBtn} onClick={handleZoomOut}>-</button>
              <button className={styles.controlBtn} onClick={handleResetZoom}>⟳</button>
              <button className={styles.controlBtn} onClick={closeFullscreen}>×</button>
            </div>
            <div className={styles.imageContainer}>
              <img
                src={currentImage.url}
                alt={currentImage.description || 'Изображение новости'}
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                className={styles.zoomedImage}
              />
            </div>
            {currentImage.description && (
              <div className={styles.imageCaption}>{currentImage.description}</div>
            )}
          </div>
        </div>
      )}

      <article className={styles.newsArticle}>
        <header className={styles.articleHeader}>
          <nav className={styles.breadcrumb}>
            <Link href="/news" className={styles.breadcrumbLink}>Новости</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{newsItem.title}</span>
          </nav>
          
          <h1 className={styles.articleTitle}>{newsItem.title}</h1>
          
          <div className={styles.articleMeta}>
            <time className={styles.articleDate}>
              {new Date(newsItem.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </time>
          </div>
        </header>

        <div className={styles.articleContent}>
          {newsItem.contentBlocks && newsItem.contentBlocks.map((block, index) => (
            <div key={index} className={styles.contentBlock}>
              {block.type === 'text' && (
                <div className={styles.textContent}>
                  {block.content.split('\n').map((paragraph, i) => (
                    paragraph.trim() && <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
              
              {block.type === 'image' && block.media && (
                <figure className={styles.imageBlock}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={block.media}
                      alt={block.description || newsItem.title}
                      width={800}
                      height={500}
                      className={styles.articleImage}
                      onClick={() => openFullscreen(block.media, block.description)}
                    />
                    <div className={styles.imageOverlay}>
                      <span>🔍</span>
                    </div>
                  </div>
                  {block.description && (
                    <figcaption className={styles.imageCaption}>{block.description}</figcaption>
                  )}
                </figure>
              )}
              
              {block.type === 'video' && block.media && (
                <div className={styles.videoBlock}>
                  <video controls className={styles.articleVideo}>
                    <source src={block.media} type={block.mediaType || 'video/mp4'} />
                    Ваш браузер не поддерживает видео тег.
                  </video>
                  {block.description && (
                    <p className={styles.videoDescription}>{block.description}</p>
                  )}
                </div>
              )}
              
              {block.type === 'youtube' && block.media && (
                <div className={styles.videoBlock}>
                  <div className={styles.youtubeContainer}>
                    <iframe
                      src={`https://www.youtube.com/embed/${block.media}`}
                      title={`YouTube video: ${block.description || newsItem.title}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className={styles.youtubeVideo}
                    ></iframe>
                  </div>
                  {block.description && (
                    <p className={styles.videoDescription}>{block.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className={styles.articleFooter}>
          <Link href="/news" className={styles.backButton}>
            ← Назад к списку новостей
          </Link>
        </footer>
      </article>
    </div>
  );
};

export default NewsDetail;