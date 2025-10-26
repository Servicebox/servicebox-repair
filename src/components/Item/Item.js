'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Item.module.css';

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><rect fill='%23F1F1F1' width='400' height='400'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%23b3b3b3'>Нет фото</text></svg>";

const Item = ({ slug, name, images, new_price, old_price, description, quantity, category, subcategory }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getImageSrc = () => {
    if (imageError || !images || !images[0]) {
      return PLACEHOLDER;
    }

    let src = images[0];

    // Remove leading // if present
    if (src.startsWith('//')) {
      src = 'https:' + src;
    }

    // If it's an absolute URL (http/https), return as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }

    // If it's already a valid relative path starting with /, use it
    if (src.startsWith('/')) {
      return src;
    }

    // Otherwise, assume it's a filename and prepend /images/
    return `/images/${src}`;
  };

  const handleImageError = (e) => {
    console.error('Error loading image:', images?.[0]);
    setImageError(true);
    setImageLoading(false);
    e.target.src = PLACEHOLDER;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const hasDiscount = old_price > 0 && new_price < old_price;
  const discount = hasDiscount ? Math.round((1 - new_price / old_price) * 100) : 0;

  return (
    <div className={styles.item}>
      <div className={styles.itemImgBox}>
        {hasDiscount && <span className={styles.itemBadge}>-{discount}%</span>}
        <Link href={`/product/${slug}`} className={styles.itemImage}>
          <div className={styles.imageContainer}>
            {imageLoading && (
              <div className={styles.imagePlaceholder}>Загрузка...</div>
            )}
            <Image
              src={getImageSrc()}
              alt={name || "Изображение товара"}
              width={300}
              height={300}
              className={`${styles.itemImage} ${imageLoading ? styles.imageLoading : ''}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized // Only if you can't use next/image optimization (e.g., dynamic local files)
            />
          </div>
        </Link>
      </div>
      <div className={styles.itemTitle}>{name}</div>
      <div className={styles.itemPrices}>
        <div className={styles.shopitemPrices}>{new_price ? `${new_price}₽` : ''}</div>
        <div className={styles.shopitemTags}>
          {category}{subcategory ? ' / ' + subcategory : ''}
        </div>
        {hasDiscount && <div className={styles.itemPriceOld}>₽{old_price}</div>}
        <div className={styles.itemPriceCol}>Ост: {quantity}</div>
      </div>
    </div>
  );
};

export default Item;