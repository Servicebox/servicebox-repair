'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CartItems.module.css';

// Хук для работы с корзиной без авторизации
const useCartStorage = () => {
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    // Загружаем товары для отображения
    fetch('/api/allproducts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products);
      });
  }, []);

  const addToCart = (slug, quantity = 1) => {
    const newCart = { ...cart };
    newCart[slug] = (newCart[slug] || 0) + quantity;
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
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

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('cart');
  };

  const getTotalCartAmount = () => {
    return Object.entries(cart).reduce((total, [slug, quantity]) => {
      const product = products.find(p => p.slug === slug);
      return total + (product?.new_price || 0) * quantity;
    }, 0);
  };

  return {
    cart,
    products,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount
  };
};

const CartItems = () => {
  const {
    cart,
    products,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount
  } = useCartStorage();

  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paymentSuccess') === 'true') {
      setIsPaid(true);
      clearCart();
    }
  }, [clearCart]);

  // Функция для получения абсолютного URL изображения
  const getImageUrl = (img) => {
    if (!img) return '/images/placeholder.jpg';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `https://servicebox35.ru${img}`;
    return `https://servicebox35.ru/${img}`;
  };

  const visibleCartRows = products.filter(product =>
    cart[product.slug] > 0 && product.quantity > 0
  );

  const totalAmount = getTotalCartAmount();

  if (isPaid) {
    return (
      <div className={styles.paymentSuccess}>
        <h1>✅ Заказ успешно оформлен!</h1>
        <p>Спасибо за покупку. Мы свяжемся с вами для подтверждения заказа.</p>
        <Link href="/parts" className={styles.continueLink}>
          ← Вернуться к покупкам
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>🛒 Корзина покупок</h1>
        <div className={styles.cartSummary}>
          {visibleCartRows.length} товара · {totalAmount.toLocaleString('ru-RU')} ₽
        </div>
      </div>

      {visibleCartRows.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары, чтобы продолжить покупки</p>
          <Link href="/parts" className={styles.continueShopping}>
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {visibleCartRows.map((product) => {
              const inCart = cart[product.slug] || 0;
              const itemTotal = (product.new_price || 0) * inCart;
              const canAddMore = (product.quantity || 0) > inCart;

              return (
                <div className={styles.cartItem} key={product.slug}>
                  <div className={styles.itemImage}>
                    <Image
                      src={getImageUrl(product.images?.[0])}
                      alt={product.name}
                      width={120}
                      height={120}
                      className={styles.productImage}
                    />
                  </div>

                  <div className={styles.itemDetails}>
                    <Link href={`/product/${product.slug}`} className={styles.productName}>
                      {product.name}
                    </Link>
                    {product.description && (
                      <p className={styles.productDescription}>
                        {product.description.substring(0, 100)}...
                      </p>
                    )}
                    <div className={styles.stockInfo}>
                      В наличии: {product.quantity || 0} шт.
                    </div>
                    <div className={styles.priceMobile}>
                      {itemTotal.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>

                  <div className={styles.itemControls}>
                    <div className={styles.quantitySelector}>
                      <button
                        className={`${styles.quantityBtn} ${styles.decreaseBtn}`}
                        onClick={() => removeFromCart(product.slug)}
                      >
                        −
                      </button>
                      <span className={styles.quantityDisplay}>{inCart}</span>
                      <button
                        className={`${styles.quantityBtn} ${styles.increaseBtn}`}
                        onClick={() => canAddMore && addToCart(product.slug)}
                        disabled={!canAddMore}
                        title={!canAddMore ? 'Достигнут лимит товара' : ''}
                      >
                        +
                      </button>
                    </div>

                    <div className={styles.priceDesktop}>
                      {itemTotal.toLocaleString('ru-RU')} ₽
                    </div>

                    <button
                      className={styles.removeBtn}
                      onClick={() => {
                        for (let i = 0; i < inCart; i++) {
                          removeFromCart(product.slug);
                        }
                      }}
                      title="Удалить товар"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.cartFooter}>
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Сумма заказа</h3>

              <div className={styles.summaryRow}>
                <span>Товары ({visibleCartRows.length})</span>
                <span>{totalAmount.toLocaleString('ru-RU')} ₽</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Доставка</span>
                <span className={styles.freeShipping}>Бесплатно</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Скидка</span>
                <span className={styles.discount}>−0 ₽</span>
              </div>

              <div className={styles.divider}></div>

              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Итого</span>
                <span className={styles.totalAmount}>
                  {totalAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <Link href="/checkout" className={styles.checkoutButton}>
                💳 Оформить заказ
              </Link>

              <Link href="/parts" className={styles.continueLink}>
                ← Вернуться к покупкам
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartItems;