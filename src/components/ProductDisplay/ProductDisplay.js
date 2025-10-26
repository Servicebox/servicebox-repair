'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { ShopContext } from '../ShopContext/ShopContext'; 
import styles from './ProductDisplay.module.css';

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><rect fill='%23F1F1F1' width='400' height='400'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%23b3b3b3'>Нет фото</text></svg>";

const ProductDisplay = ({ product }) => {
  const { addToCart, cartItems } = useContext(ShopContext);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  if (!product) return <div className={styles.loading}>Загрузка товара...</div>;

  // Функция для получения корректного пути к изображению
  const getImageSrc = (img, index) => {
    if (imageErrors[index] || !img) {
      return PLACEHOLDER;
    }

    // Если это data URL или корректный URL, используем как есть
    if (img.startsWith('data:') || img.startsWith('http')) {
      return img;
    }
    
    // Если это относительный путь, добавляем /images/ если нужно
    if (img.startsWith('/')) {
      return img;
    }
    
    // Если имя файла без пути, добавляем базовый путь
    return `/images/${img}`;
  };

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img, index) => getImageSrc(img, index))
    : [PLACEHOLDER];

  const availableStock = product.quantity || 0;
  const inCart = cartItems[product.slug] || 0;
  const canAddToCart = availableStock > inCart;

  const handleImageError = (index) => (e) => {
    console.error(`Error loading image ${index}:`, images[index]);
    setImageErrors(prev => ({ ...prev, [index]: true }));
    e.target.src = PLACEHOLDER;
  };

  const handleAddToCart = () => {
    if (canAddToCart) {
      addToCart(product.slug);
    }
  };

  // Исправленная структура данных без лишних пробелов
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": images,
    "description": product.description,
    "sku": product.slug,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "RUB",
      "price": String(product.new_price),
      "availability": availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "inventoryLevel": {
        "@type": "QuantitativeValue",
        "value": availableStock
      }
    },
    "category": product.category
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />

      <article className={styles.productDisplay} itemScope itemType="https://schema.org/Product">
        <div className={styles.productDisplayGallery}>
          <div className={styles.productDisplayThumbnails}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`${styles.productDisplayThumbnailBtn} ${i === selectedImage ? styles.productDisplayThumbnailBtnActive : ''}`}
                aria-label={`Просмотреть изображение ${i + 1}`}
              >
                <Image
                  src={getImageSrc(img, i)}
                  alt={`Миниатюра товара ${product.name} - изображение ${i + 1}`}
                  className={styles.productDisplayThumbnailImg}
                  width={100}
                  height={150}
                  loading={i === 0 ? "eager" : "lazy"}
                  onError={handleImageError(i)}
                />
              </button>
            ))}
          </div>
          
          <div className={styles.productDisplayMainImageContainer}>
            <Image
              className={styles.productDisplayMainImage}
              src={getImageSrc(images[selectedImage], selectedImage)}
              onClick={() => setIsPopupOpen(true)}
              onError={handleImageError(selectedImage)}
              alt={`Основное изображение товара ${product.name}`}
              itemProp="image"
              width={400}
              height={500}
              loading="eager"
            />
            <button 
              className={styles.productDisplayZoomBtn}
              onClick={() => setIsPopupOpen(true)}
              aria-label="Увеличить изображение"
            >
              🔍
            </button>
          </div>
        </div>

        <div className={styles.productDisplayInfo}>
          <header className={styles.productDisplayHeader}>
            <h1 className={styles.productDisplayTitle} itemProp="name">
              {product.name}
            </h1>
            
            <div className={styles.productDisplayPricing} itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="priceCurrency" content="RUB" />
              <meta itemProp="price" content={String(product.new_price)} />
              <meta itemProp="availability" content={availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
              
              <div className={styles.productDisplayPrice}>
                <span className={styles.productDisplayPriceLabel}>Цена:</span>
                <span className={styles.productDisplayPriceValue} itemProp="price">
                  {product.new_price} ₽
                </span>
              </div>
            </div>
          </header>

          <section className={styles.productDisplayDescription}>
            <h2 className={styles.productDisplaySectionTitle}>Описание товара</h2>
            <div 
              className={styles.productDisplayDescriptionText} 
              itemProp="description"
              dangerouslySetInnerHTML={{ __html: product.description || 'Описание отсутствует' }}
            />
          </section>

          <section className={styles.productDisplayDetails}>
            <h2 className={styles.productDisplaySectionTitle}>Детали товара</h2>
            
            <div className={styles.productDisplayStockInfo}>
              <div className={styles.productDisplayStockItem}>
                <span className={styles.productDisplayStockLabel}>В наличии:</span>
                <span className={styles.productDisplayStockValue}>{availableStock} шт.</span>
              </div>
              {inCart > 0 && (
                <div className={styles.productDisplayStockItem}>
                  <span className={styles.productDisplayStockLabel}>В корзине:</span>
                  <span className={styles.productDisplayStockValue}>{inCart} шт.</span>
                </div>
              )}
            </div>

            <div className={styles.productDisplayCategories}>
              <div className={styles.productDisplayCategoryItem}>
                <span className={styles.productDisplayCategoryLabel}>Категория:</span>
                <span className={styles.productDisplayCategoryValue} itemProp="category">
                  {product.category}
                </span>
              </div>
              {product.subcategory && (
                <div className={styles.productDisplayCategoryItem}>
                  <span className={styles.productDisplayCategoryLabel}>Подкатегория:</span>
                  <span className={styles.productDisplayCategoryValue}>
                    {product.subcategory}
                  </span>
                </div>
              )}
            </div>
          </section>

          <div className={styles.productDisplayActions}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge} ${!canAddToCart ? styles.btnDisabled : ''}`}
              onClick={handleAddToCart}
              disabled={!canAddToCart}
            >
              {canAddToCart ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
          </div>
        </div>

        {isPopupOpen && (
          <div 
            className={styles.modalOverlay} 
            onClick={() => setIsPopupOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Увеличенное изображение товара"
          >
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button 
                className={styles.modalClose}
                onClick={() => setIsPopupOpen(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
              <Image 
                src={getImageSrc(images[selectedImage], selectedImage)}
                alt={`Увеличенное изображение товара ${product.name}`}
                className={styles.modalImage}
                onError={handleImageError(selectedImage)}
                width={800}
                height={600}
              />
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default ProductDisplay;