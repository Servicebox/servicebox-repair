// components/ProductDisplay/ProductDisplay.js
'use client';

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { BreadcrumbContext } from '@/components/contexts/BreadcrumbContext';
import styles from './ProductDisplay.module.css';

// Контекст корзины без авторизации
const useCart = () => {
  const [cart, setCart] = useState({});

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const addToCart = (slug, quantity = 1) => {
    const newCart = { ...cart };
    newCart[slug] = (newCart[slug] || 0) + quantity;
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert(`Добавлено в корзину: ${quantity} шт.`);
  };

  const removeFromCart = (slug) => {
    const newCart = { ...cart };
    if (newCart[slug] > 1) {
      newCart[slug] -= 1;
    } else {
      delete newCart[slug];
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getCartCount = (slug) => cart[slug] || 0;

  return { cart, addToCart, removeFromCart, getCartCount };
};

const PLACEHOLDER_IMAGE = '/images/placeholder.jpg';

export default function ProductDisplay({ product }) {
  const { addToCart, getCartCount } = useCart();
  const { setBreadcrumbs, setCurrentPageTitle } = useContext(BreadcrumbContext);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Устанавливаем хлебные крошки в контекст
  useEffect(() => {
    if (!product) return;

    const breadcrumbs = [
      { name: 'Главная', url: '/' },
      { name: 'Каталог запчастей', url: '/parts' },
    ];

    if (product.category) {
      breadcrumbs.push({
        name: product.category,
        url: `/parts?category=${encodeURIComponent(product.category)}`
      });
    }

    if (product.subcategory) {
      breadcrumbs.push({
        name: product.subcategory,
        url: `/parts?subcategory=${encodeURIComponent(product.subcategory)}`
      });
    }

    // Последний элемент - название товара (без ссылки)
    breadcrumbs.push({
      name: product.name,
      url: null
    });

    setBreadcrumbs(breadcrumbs);
    setCurrentPageTitle(product.name);

    // Очищаем при размонтировании
    return () => {
      setBreadcrumbs([]);
      setCurrentPageTitle('');
    };
  }, [product, setBreadcrumbs, setCurrentPageTitle]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!product || !mounted) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка товара...</p>
      </div>
    );
  }

  // Функция для получения абсолютного URL изображения
  const getImageUrl = (img) => {
    if (!img) return PLACEHOLDER_IMAGE;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `https://servicebox35.ru${img}`;
    return `https://servicebox35.ru/${img}`;
  };

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [PLACEHOLDER_IMAGE];

  const availableStock = product.quantity || 0;
  const inCart = getCartCount(product.slug);
  const canAddMore = availableStock > inCart;

  const handleAddToCart = () => {
    if (canAddMore) {
      addToCart(product.slug, quantity);
    }
  };

  const handleBuyNow = () => {
    if (canAddMore) {
      addToCart(product.slug, quantity);
      window.location.href = '/cart';
    }
  };

  return (
    <div className={styles.container}>
      {/* Хлебные крошки НЕ рендерятся здесь - они в BreadcrumbsWithContext */}

      <div className={styles.productCard}>
        <div className={styles.productLayout}>

          <div className={styles.gallerySection}>
            <div className={styles.mainImageContainer}>
              <Image
                src={getImageUrl(images[selectedImage])}
                alt={product.name}
                width={600}
                height={600}
                className={styles.mainImage}
                priority
              />
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${index === selectedImage ? styles.active : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`${product.name} - вид ${index + 1}`}
                      width={80}
                      height={80}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1>{product.name}</h1>

            <div className={styles.brandInfo}>
              <div className={styles.brand}>
                <span>Бренд:</span>
                <span>{product.brand || 'ServiceBox35'}</span>
              </div>
              {product.vendorCode && (
                <div className={styles.vendorCode}>
                  <span>Артикул:</span>
                  <span>{product.vendorCode}</span>
                </div>
              )}
            </div>

            <div className={styles.priceSection}>
              <div className={styles.currentPrice}>
                {product.new_price.toLocaleString('ru-RU')} ₽
                {product.old_price > product.new_price && (
                  <span className={styles.oldPrice}>
                    {product.old_price.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>

              <div className={styles.stockStatus}>
                <div className={`${styles.status} ${availableStock > 0 ? styles.inStock : styles.outOfStock}`}>
                  {availableStock > 0 ? `В наличии: ${availableStock} шт.` : 'Нет в наличии'}
                </div>
                {inCart > 0 && (
                  <div className={styles.inCart}>
                    В корзине: {inCart} шт.
                  </div>
                )}
              </div>
            </div>

            <div className={styles.quantityControls}>
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className={styles.quantityBtn}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(availableStock, Math.max(1, val)));
                  }}
                  className={styles.quantityInput}
                />
                <button
                  onClick={() => setQuantity(prev => Math.min(availableStock, prev + 1))}
                  className={styles.quantityBtn}
                >
                  +
                </button>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={`${styles.addToCartBtn} ${!canAddMore ? styles.disabled : ''}`}
                  onClick={handleAddToCart}
                  disabled={!canAddMore}
                >
                  🛒 Добавить в корзину
                </button>

                <button
                  className={styles.buyNowBtn}
                  onClick={handleBuyNow}
                  disabled={!canAddMore}
                >
                  💳 Купить сейчас
                </button>
              </div>
            </div>

            {product.description && (
              <div className={styles.description}>
                <h2>Описание</h2>
                <div
                  className={styles.descriptionText}
                  dangerouslySetInnerHTML={{
                    __html: product.description.replace(/<br\s*\/?>/gi, '<br>')
                  }}
                />
              </div>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className={styles.specs}>
                <h2>Характеристики</h2>
                <div className={styles.specsGrid}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className={styles.specRow}>
                      <span className={styles.specKey}>{key}:</span>
                      <span className={styles.specValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}