'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { trackProductClick, trackAddToCart } from '@/lib/metrika';
import styles from './Item.module.css';

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><rect fill='%23F1F1F1' width='400' height='400'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%23b3b3b3'>Нет фото</text></svg>";

// Иконка корзины со знаком "+" — вместо эмодзи, чётко читается на маленькой кнопке
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M2.5 3h2l2.4 12.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7.5H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const Item = ({ slug, name, images, new_price, old_price, description, quantity, category, subcategory }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [added, setAdded] = useState(false);

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

  // Корзина хранится в localStorage под ключом 'cart' — тот же формат
  // { slug: количество }, что используют CartItems.js, CheckoutForm.js и
  // ProductDisplay.js. Раньше кнопка использовала ShopContext.addToCart
  // (серверная корзина через /api/cart/add), которая никак не связана с
  // localStorage-корзиной, откуда реально читают /cart и /checkout — из-за
  // этого добавленный на /parts товар не появлялся на странице корзины.
  const handleAddToCart = () => {
    const savedCart = localStorage.getItem('cart');
    const cart = savedCart ? JSON.parse(savedCart) : {};
    cart[slug] = (cart[slug] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));

    trackAddToCart({ slug, name, new_price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={styles.item}>
      <div className={styles.itemImgBox}>
        {hasDiscount && <span className={styles.itemBadge}>-{discount}%</span>}
        <Link
          href={`/product/${slug}`}
          className={styles.itemImage}
          onClick={() => trackProductClick({ slug, name, new_price })}
        >
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
              unoptimized
              priority
            />
          </div>
        </Link>
      </div>
      <div className={styles.itemTitle}>{name}</div>
      <div className={styles.itemPrices}>
        <div className={styles.priceRow}>
          <div>
            <div className={styles.shopitemPrices}>{new_price ? `${new_price}₽` : ''}</div>
            {hasDiscount && <div className={styles.itemPriceOld}>₽{old_price}</div>}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`${styles.addToCartBtn} ${added ? styles.addToCartBtnAdded : ''}`}
            aria-label="Добавить в корзину"
            title="Добавить в корзину"
          >
            {added ? <CheckIcon /> : <CartIcon />}
          </button>
        </div>
        <div className={styles.shopitemTags}>
          {category}{subcategory ? ' / ' + subcategory : ''}
        </div>
        <div className={styles.itemPriceCol}>Ост: {quantity}</div>
      </div>
    </div>
  );
};

export default Item;