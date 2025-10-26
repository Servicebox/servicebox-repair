'use client';
import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { ShopContext } from '../ShopContext/ShopContext';
import remove_icon from '../../../public/images/closes.svg';
import TinkoffPayForm from '../TinkoffPayForm/TinkoffPayForm';
import styles from './CartItems.module.css';

const CartItems = () => {
  const {
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    purchaseItems,
  } = useContext(ShopContext);

  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paymentSuccess') === 'true') {
      setIsPaid(true);
    }
  }, []);

  const canAddMore = (product) => {
    const availableStock = product.quantity || 0;
    const inCart = cartItems[product.slug] || 0;
    return availableStock > inCart;
  };

  const receiptData = all_product.filter(product => cartItems[product.slug] > 0)
    .map(product => ({
      name: product.name,
      price: product.new_price,
      quantity: cartItems[product.slug],
      Description: product.description,
    }));

  if (isPaid) {
    return <DeliveryForm />;
  }

  const visibleCartRows = all_product
    .filter(e => cartItems[e.slug] > 0 && e.quantity > 0);

  const totalAmount = getTotalCartAmount();

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h1 className={styles.cartTitle}>Корзина покупок</h1>
        <div className={styles.cartSummary}>
          {visibleCartRows.length} товара · ₽{totalAmount}
        </div>
      </div>

      {visibleCartRows.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары, чтобы продолжить покупки</p>
          <Link href="/" className={styles.continueShopping}>
            Продолжить покупки
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {visibleCartRows.map((product) => {
              const availableStock = product.quantity || 0;
              const inCart = cartItems[product.slug] || 0;
              const itemTotal = product.new_price * inCart;
              
              return (
                <div className={styles.cartItem} key={product.slug}>
                  <div className={styles.itemImage}>
                    <Image 
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'} 
                      alt={product.name}
                      width={100}
                      height={100}
                      className={styles.productImage}
                    />
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productDescription}>
                      {product.description}
                    </p>
                    <div className={styles.stockInfo}>
                      В наличии: {availableStock} шт.
                    </div>
                    <div className={styles.priceMobile}>
                      ₽{itemTotal}
                    </div>
                  </div>

                  <div className={styles.itemControls}>
                    <div className={styles.quantitySelector}>
                      <button
                        className={`${styles.quantityBtn} ${styles.decreaseBtn}`}
                        onClick={() => removeFromCart(product.slug)}
                        disabled={inCart <= 1}
                      >
                        −
                      </button>
                      <span className={styles.quantityDisplay}>{inCart}</span>
                      <button
                        className={`${styles.quantityBtn} ${styles.increaseBtn}`}
                        onClick={() => addToCart(product.slug)}
                        disabled={!canAddMore(product)}
                        title={!canAddMore(product) ? 'Достигнут лимит товара' : ''}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className={styles.priceDesktop}>
                      ₽{itemTotal}
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
                <span>₽{totalAmount}</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>Доставка</span>
                <span className={styles.freeShipping}>Бесплатно</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>Скидка</span>
                <span className={styles.discount}>−₽0</span>
              </div>
              
              <div className={styles.divider}></div>
              
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Итого</span>
                <span className={styles.totalAmount}>₽{totalAmount}</span>
              </div>

              <TinkoffPayForm
                amount={totalAmount}
                receiptData={receiptData}
                onPaymentSuccess={() => {
                  setIsPaid(true);
                  purchaseItems(receiptData);
                }}
              />

              <Link href="/parts" className={styles.continueLink}>
                ← Вернуться к покупкам
              </Link>
               <Link href="/checkout" className={styles.checkoutButton}>
              Оформить заказ
            </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartItems;