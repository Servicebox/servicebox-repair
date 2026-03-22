'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './thank-you.module.css';

// Создаем внутренний компонент, который использует useSearchParams
function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setOrder(data.order);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✅</div>
        <h1>Заказ успешно оформлен!</h1>
        
        {order ? (
          <>
            <div className={styles.orderInfo}>
              <p><strong>Номер заказа:</strong> {order.orderNumber}</p>
              <p><strong>Статус:</strong> {order.status === 'pending' ? 'Ожидает обработки' : order.status}</p>
              <p><strong>Сумма:</strong> {order.pricing?.totalAmount || order.totalAmount} ₽</p>
              <p><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString('ru-RU')}</p>
            </div>
            
            <div className={styles.nextSteps}>
              <h3>Что дальше?</h3>
              <ol>
                <li>Мы свяжемся с вами в течение 30 минут для подтверждения заказа</li>
                <li>Вы можете отслеживать статус заказа в личном кабинете</li>
                <li>При самовывозе заказ будет готов в течение 1-3 дней</li>
              </ol>
            </div>
          </>
        ) : (
          <p>Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время.</p>
        )}
        
        <div className={styles.actions}>
          <Link href="/profile" className={styles.profileButton}>
            📋 Перейти в личный кабинет
          </Link>
          <Link href="/parts" className={styles.continueButton}>
            ← Продолжить покупки
          </Link>
        </div>
        
        <div className={styles.contactInfo}>
          <p>Есть вопросы? Звоните: <strong>+7 (911) 501-88-28</strong></p>
          <p>Или пишите: <strong>servicebox35@gmail.com</strong></p>
        </div>
      </div>
    </div>
  );
}

// Главный компонент, который оборачивает внутренний в Suspense
export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}