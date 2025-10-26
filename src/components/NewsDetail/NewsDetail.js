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
        if (!params.id) return;
        
        const response = await fetch(`/api/news/${params.id}`);
        const data = await response.json();
        
        if (data?.success) {
          setNewsItem(data.data);
        } else {
          throw new Error('Новость не найдена');
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
      {/* Fullscreen Image Viewer */}
      {isFullscreen && currentImage && (
        <div className={styles.fullscreenOverlay} onClick={closeFullscreen}>
          <div 
            className={styles.fullscreenContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.fullscreenControls}>
              <button 
                className={styles.controlBtn} 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
              <button 
                className={styles.controlBtn} 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
              <button 
                className={styles.controlBtn} 
                onClick={handleResetZoom}
                disabled={zoomLevel === 1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
              </button>
              <button 
                className={`${styles.controlBtn} ${styles.closeBtn}`} 
                onClick={closeFullscreen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div 
              className={styles.imageContainer}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
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

      {/* News Article */}
      <article className={styles.newsArticle}>
        <header className={styles.articleHeader}>
          <nav className={styles.breadcrumb}>
            <Link href="/news" className={styles.breadcrumbLink}>
              Новости
            </Link>
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
                      onClick={() => openFullscreen(
                        `https://service-box-35.ru/uploads/${block.media}`, 
                        block.description
                      )}
                    />
                    <div className={styles.imageOverlay}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                      </svg>
                    </div>
                  </div>
                  {block.description && (
                    <figcaption className={styles.imageCaption}>{block.description}</figcaption>
                  )}
                </figure>
              )}
              
              {block.type === 'video' && block.media && (
                <div className={styles.videoBlock}>
                  <video 
                    controls 
                    className={styles.articleVideo}
                    poster={`${block.media}?poster=true`}
                  >
                    <source
                      src={block.media}
                      type={block.mediaType || 'video/mp4'}
                    />
                    Ваш браузер не поддерживает видео тег.
                  </video>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Назад к списку новостей
          </Link>
        </footer>
      </article>
    </div>
  );
};

export default NewsDetail;