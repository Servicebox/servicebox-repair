'use client';

import { useState } from 'react';
import styles from '@/components/NewsDetail/NewsDetail.module.css';
import LikeButton from '@/components/LikeButton/LikeButton';
import CommentSection from '@/components/CommentSection/CommentSection';

const ContentBlockRenderer = ({ blocks, onImageClick }) => {
  if (!Array.isArray(blocks)) return null;

  return (
    <div className={styles.contentBlocks}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return <h2 key={index} className={styles.heading}>{block.content}</h2>;
          case 'text':
            return (
              <div key={index} className={styles.textBlock}
                dangerouslySetInnerHTML={{ __html: block.content?.replace(/\n/g, '<br>') }} />
            );
          case 'image':
            return block.media ? (
              <figure key={index} className={styles.imageBlock}>
                <img src={block.media} alt={block.alt || block.description || 'Изображение новости'}
                  className={styles.contentImage} loading="lazy"
                  onClick={() => onImageClick?.(block.media)} style={{ cursor: 'pointer' }} />
                {block.description && <figcaption className={styles.imageCaption}>{block.description}</figcaption>}
              </figure>
            ) : null;
          case 'video':
            return block.media ? (
              <figure key={index} className={styles.videoBlock}>
                <div className={styles.videoContainer}>
                  <video controls playsInline preload="metadata" poster={block.thumbnail} className={styles.contentVideo}
                    style={{ width: '100%', maxHeight: '500px', borderRadius: '12px', background: '#000' }}>
                    <source src={block.media} type={block.mediaType || 'video/mp4'} />
                    Ваш браузер не поддерживает воспроизведение видео.
                  </video>
                </div>
                {block.description && <figcaption className={styles.videoCaption}>{block.description}</figcaption>}
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
                    allowFullScreen loading="lazy" />
                </div>
                {block.description && <p className={styles.videoCaption}>{block.description}</p>}
              </div>
            ) : null;
          case 'list':
            return block.content ? (
              <ul key={index} className={styles.listBlock}>
                {block.content.split('\n').filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
};

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function NewsDetailClient({ news }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  const openLightbox = (imgUrl) => setLightboxImage(imgUrl);
  const closeLightbox = () => setLightboxImage(null);

  return (
    <article className={styles.container}>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <ol>
          <li><a href="/">Главная</a></li>
          <li><a href="/news">Новости</a></li>
          <li>{news.title}</li>
        </ol>
      </nav>
      <header className={styles.header}>
        <h1 className={styles.title}>{news.title}</h1>
        <div className={styles.meta}>
          {news.publishedAt && (
            <time className={styles.date} dateTime={news.publishedAt}>
              📅 {formatDate(news.publishedAt)}
            </time>
          )}
          {news.updatedAt && news.updatedAt !== news.publishedAt && (
            <time className={styles.date} dateTime={news.updatedAt}>
              🔄 Обновлено: {formatDate(news.updatedAt)}
            </time>
          )}
          {news.author && <span className={styles.author}>✍️ {news.author}</span>}
          {news.views > 0 && <span className={styles.views}>👁️ {news.views}</span>}
        </div>
        {news.featuredImage && (
          <figure className={styles.featuredImage}>
            <img src={news.featuredImage} alt={news.title} className={styles.mainImage} loading="eager" />
          </figure>
        )}
        {news.excerpt && <p className={styles.excerpt}>{news.excerpt}</p>}
      </header>

      <ContentBlockRenderer blocks={news.contentBlocks} onImageClick={openLightbox} />

      {news._id && (
        <CommentSection
          targetId={news._id.toString()}
          targetType="news"
        />
      )}

      <footer className={styles.footer}>
        {news.keywords?.length > 0 && (
          <div className={styles.tags}>
            <strong>Теги:</strong>
            {news.keywords.map((keyword, idx) => <span key={idx} className={styles.tag}>{keyword}</span>)}
          </div>
        )}
        <div className={styles.share}>
          <strong>Поделиться:</strong>
          <div className={styles.shareButtons}>
            <a href={`https://vk.com/share.php?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(news.title)}`}
              target="_blank" rel="noopener noreferrer" className={styles.shareButton}>ВКонтакте</a>
          </div>
        </div>
        {news._id && (
          <div className={styles.newsActions}>
            <LikeButton entityId={news._id.toString()} entityType="News" initialCount={news.likesCount || 0} />
          </div>
        )}
      </footer>

      <nav className={styles.navigation}>
        <a href="/news" className={styles.backLink}>← Все новости</a>
      </nav>

      {lightboxImage && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div className={styles.lightboxContent}>
            <button className={styles.lightboxClose} onClick={closeLightbox}>×</button>
            <img src={lightboxImage} alt="Увеличенное изображение" className={styles.lightboxImage} />
          </div>
        </div>
      )}
    </article>
  );
}
