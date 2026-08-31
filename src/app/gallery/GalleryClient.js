'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import './Gallery.css';
import LikeButton from '@/components/LikeButton/LikeButton';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjAwIDE1MEMyMTUuNDY0IDE1MCAyMjggMTM3LjQ2NCAyMjggMTIyQzIyOCAxMDYuNTM2IDIxNS40NjQgOTQgMjAwIDk0QzE4NC41MzYgOTQgMTcyIDEwNi41MzYgMTcyIDEyMkMxNzIgMTM3LjQ2NCAxODQuNTM2IDE1MCAyMDAgMTUwWk0xNjAgMjEwVjIzMEgyNDBWMjEwSDE2MFpNMTYwIDE3MFYxOTBIMjQwVjE3MEgxNjBaIiBmaWxsPSIjOUNBMEFEIi8+PC9zdmc+';

export default function GalleryClient({ groups }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const getImageSource = (image) => {
    if (imageErrors[image.id] || !image.filePath) {
      return PLACEHOLDER_IMAGE;
    }
    return image.filePath;
  };

  const openGroupModal = (group, index = 0) => {
    setSelectedGroup(group);
    setCurrentImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedGroup(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction) => {
    if (!selectedGroup) return;

    const newIndex = direction === 'next'
      ? (currentImageIndex + 1) % selectedGroup.images.length
      : (currentImageIndex - 1 + selectedGroup.images.length) % selectedGroup.images.length;

    setCurrentImageIndex(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedGroup) return;
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowRight') navigateImage('next');
      else if (e.key === 'ArrowLeft') navigateImage('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGroup, currentImageIndex]);

  const formatFileSize = (bytes) => {
    if (typeof bytes !== 'number' || bytes <= 0) return 'Неизвестный размер';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Неизвестная дата';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Неверная дата';
    }
  };

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <h1>Галерея фотографий</h1>
        <p>Наши работы и проекты</p>
        <div className="gallery-stats">
          <span>{groups.length} альбомов • {groups.reduce((total, group) => total + group.images.length, 0)} фотографий</span>
        </div>
      </header>

      <section className="groups-section">
        {groups.length === 0 ? (
          <div className="empty-gallery">
            <div>📷</div>
            <h3>Альбомов пока нет</h3>
            <p>В галерее пока нет загруженных фотографий.</p>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group-card"
                onClick={() => openGroupModal(group, 0)}
              >
                <div className="group-preview">
                  {group.images.slice(0, 4).map((image, index) => (
                    <div key={image.id} className={`preview-image preview-${index + 1}`} style={{ zIndex: 4 - index }}>
                      <Image
                        src={getImageSource(image)}
                        alt={group.description || 'Фото из галереи СЕРВИС БОКС'}
                        onError={() => handleImageError(image.id)}
                        loading="lazy"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                  {group.images.length === 0 && (
                    <div className="preview-image preview-1">
                      <Image src={PLACEHOLDER_IMAGE} alt="Нет фото" fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                  )}
                  {group.images.length > 4 && (
                    <div className="more-images-overlay">
                      +{group.images.length - 4}
                    </div>
                  )}
                </div>
                <div className="group-info">
                  <h3 className="group-title">{group.description}</h3>
                  <div className="group-meta">
                    <span className="image-count">{group.images.length} фото</span>
                    <span className="upload-date">{formatDate(group.uploadedAt)}</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <LikeButton entityId={group.id} entityType="Image" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedGroup && (
        <div className="group-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="modal-header">
              <h2>{selectedGroup.description}</h2>
              <div className="modal-meta">
                <span>{selectedGroup.images.length} фотографий</span>
                <span>{formatDate(selectedGroup.uploadedAt)}</span>
              </div>
            </div>

            <div className="modal-image-container">
              <Image
                src={getImageSource(selectedGroup.images[currentImageIndex])}
                alt={selectedGroup.description}
                className="modal-image"
                onError={() => handleImageError(selectedGroup.images[currentImageIndex].id)}
                fill
                sizes="90vw"
                style={{ objectFit: 'contain' }}
              />

              {selectedGroup.images.length > 1 && (
                <>
                  <button
                    className="nav-button prev-button"
                    onClick={() => navigateImage('prev')}
                    disabled={currentImageIndex === 0}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button
                    className="nav-button next-button"
                    onClick={() => navigateImage('next')}
                    disabled={currentImageIndex === selectedGroup.images.length - 1}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="modal-footer">
              <div className="image-counter">
                {currentImageIndex + 1} / {selectedGroup.images.length}
              </div>
              <div className="image-info">
                <span>Размер: {formatFileSize(selectedGroup.images[currentImageIndex].size)}</span>
                <span>Формат: {selectedGroup.images[currentImageIndex].type || 'WebP'}</span>
              </div>
            </div>

            {selectedGroup.images.length > 1 && (
              <div className="thumbnail-strip">
                {selectedGroup.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={getImageSource(image)}
                      alt={`${index + 1}`}
                      onError={() => handleImageError(image.id)}
                      fill
                      sizes="60px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
