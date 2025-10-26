// components/ImageGallerySection/ImageGallerySection.jsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import './ImageGallerySection.module.css'; // Убедитесь, что стили импортированы

const ImageGallerySection = ({ galleryData }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [view, setView] = useState('grid');
  const [imageErrors, setImageErrors] = useState({}); // Для отслеживания ошибок загрузки картинок

  // Функция для безопасного форматирования размера файла
  const formatFileSize = (bytes) => {
    if (!bytes || typeof bytes !== 'number' || bytes <= 0) return 'Размер неизвестен';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  // Функция для безопасного форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Дата неизвестна';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Неверная дата';
    }
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = (imageId) => {
    setImageErrors((prev) => ({
      ...prev,
      [imageId]: true,
    }));
  };

  // Получение источника изображения с учетом ошибок
  const getImageSource = (image) => {
    // Если для этого изображения была ошибка, используем заглушку
    if (imageErrors[image.id]) {
      return '/images/image-placeholder.svg'; // Укажите путь к своей заглушке
    }
    return image.filePath;
  };

  useEffect(() => {
    if (galleryData && galleryData.images) {
      // Добавляем проверку данных при получении
      const validatedImages = galleryData.images.map((img) => ({
        id: img.id || `temp-${Date.now()}-${Math.random()}`,
        filename: img.filename || 'unknown',
        originalName: img.originalName || 'Неизвестный файл',
        filePath: img.filePath || '/images/placeholder.jpg',
        description: img.description || 'Описание отсутствует',
        uploadedAt: img.uploadedAt || new Date().toISOString(),
        size: typeof img.size === 'number' ? img.size : 0,
        type: img.type || 'image/jpeg',
      }));
      setImages(validatedImages);
      setLoading(false);
    } else {
      fetchImages();
    }
  }, [galleryData]);

  // Остальные функции (fetchImages, openModal, closeModal...) остаются без изменений
  // Но используйте в них formatFileSize и formatDate для отображения данных

  return (
    <section className="image-gallery-section">
      <div className="container">
        {/* Заголовок на русском */}
        <div className="gallery-header">
          <h2 className="section-title">Галерея изображений</h2>
          <p className="section-subtitle">Посмотрите нашу коллекцию работ</p>
        </div>

        {/* Сетка изображений */}
        {images.length === 0 ? (
          <div className="empty-gallery">
            <div className="empty-icon">📷</div>
            <h3>Изображений пока нет</h3>
            <p>Будьте первым, кто добавит работу в галерею!</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((image) => (
              <div key={image.id} className="gallery-item">
                <div className="image-wrapper">
                  {/* Используем тег img для простоты обработки ошибок */}
                  <img
                    src={getImageSource(image)}
                    alt={image.description}
                    className="gallery-image"
                    onError={() => handleImageError(image.id)}
                  />
                </div>
                <div className="image-info">
                  <p className="image-description">{image.description}</p>
                  <div className="image-meta">
                    {/* Используем функции форматирования */}
                    <span className="file-type">{image.type?.split('/')[1]?.toUpperCase() || 'ИЗОБР'}</span>
                    <span className="file-size">{formatFileSize(image.size)}</span>
                  </div>
                  <div className="upload-date">{formatDate(image.uploadedAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ImageGallerySection;