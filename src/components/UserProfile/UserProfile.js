// components/UserProfile/UserProfile.jsx
// components/UserProfile/UserProfile.jsx
'use client';
import React from 'react';
import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from '../contexts/AuthContext';
import styles from "./UserProfile.module.css";
import Link from 'next/link';

// Компонент для отображения статуса заказа
const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    'pending': { label: 'Ожидает обработки', color: '#f59e0b' },
    'processing': { label: 'В обработке', color: '#3b82f6' },
    'shipped': { label: 'Отправлен', color: '#8b5cf6' },
    'delivered': { label: 'Доставлен', color: '#10b981' },
    'cancelled': { label: 'Отменен', color: '#ef4444' },
    'completed': { label: 'Завершен', color: '#10b981' },
    'confirmed': { label: 'Подтвержден', color: '#3b82f6' },
    'refunded': { label: 'Возврат', color: '#8b5cf6' }
  };

  const config = statusConfig[status] || { label: status, color: '#6b7280' };
  
  return (
    <span className={styles.statusBadge} style={{ backgroundColor: config.color }}>
      {config.label}
    </span>
  );
};

// Компонент для отображения одного заказа
const OrderItem = ({ order, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Безопасное получение данных
  const getCustomerName = () => {
    return order.customerInfo?.username || 
           order.customerInfo?.name || 
           order.userName || 
           'Не указано';
  };

  const getCustomerEmail = () => {
    return order.customerInfo?.email || 
           order.userEmail || 
           'Не указан';
  };

  const getCustomerPhone = () => {
    return order.customerInfo?.phone || 
           order.userPhone || 
           'Не указан';
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение адреса доставки
  const getShippingAddress = () => {
    if (typeof order.shippingAddress === 'string') {
      return order.shippingAddress;
    } else if (order.shippingAddress && typeof order.shippingAddress === 'object') {
      const { fullName, address, city, country, postalCode } = order.shippingAddress;
      return `${fullName || ''}, ${address || ''}, ${city || ''}, ${country || ''}${postalCode ? `, ${postalCode}` : ''}`.trim();
    }
    return 'Не указан';
  };

  // Получение общего количества товаров
  const getTotalItems = () => {
    if (!order.products || !Array.isArray(order.products)) return 0;
    return order.products.reduce((total, product) => total + (product.quantity || 1), 0);
  };

  // Получение общей суммы
  const getTotalAmount = () => {
    if (order.totalAmount) return order.totalAmount;
    if (order.pricing?.totalAmount) return order.pricing.totalAmount;
    if (order.products && Array.isArray(order.products)) {
      return order.products.reduce((sum, product) => {
        const price = parseFloat(product.price || product.totalPrice || 0);
        const quantity = parseInt(product.quantity || 1);
        return sum + (price * quantity);
      }, 0);
    }
    return 0;
  };

  const totalAmount = getTotalAmount();
  const totalItems = getTotalItems();

  return (
    <div className={`${styles.orderItem} ${isExpanded ? styles.expanded : ''}`}>
      <div 
        className={styles.orderHeader} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.orderMainInfo}>
          <div className={styles.orderId}>
            <strong>Заказ №{order.orderNumber || `ORD-${order._id?.slice(-8)}` || `#${index + 1}`}</strong>
            <span className={styles.orderDate}>
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div className={styles.orderSummary}>
            <OrderStatusBadge status={order.status || 'pending'} />
            <span className={styles.orderTotal}>{totalAmount.toFixed(2)} ₽</span>
            <span className={styles.productsCount}>
              {totalItems} товар(ов)
            </span>
          </div>
        </div>
        <div className={styles.expandIcon}>
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.orderDetails}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailSection}>
              <h4>Информация о клиенте</h4>
              <p><strong>Имя:</strong> {getCustomerName()}</p>
              <p><strong>Email:</strong> {getCustomerEmail()}</p>
              <p><strong>Телефон:</strong> {getCustomerPhone()}</p>
            </div>
            
            <div className={styles.detailSection}>
              <h4>Доставка</h4>
              <p><strong>Способ:</strong> 
                {order.shippingMethod === 'pickup' ? 'Самовывоз' : 
                 order.shippingMethod === 'courier' ? 'Курьер' : 
                 order.shippingMethod === 'post' ? 'Почта' : 'Не указан'}
              </p>
              <p><strong>Адрес:</strong> {getShippingAddress()}</p>
            </div>

            <div className={styles.detailSection}>
              <h4>Оплата</h4>
              <p><strong>Способ:</strong> 
                {order.paymentMethod === 'cash' ? 'Наличные' : 
                 order.paymentMethod === 'card' ? 'Карта' : 
                 order.paymentMethod === 'online' ? 'Онлайн' : 'Не указан'}
              </p>
              <p><strong>Статус оплаты:</strong> {order.paymentStatus || 'Не указан'}</p>
            </div>
          </div>

          <div className={styles.productsSection}>
            <h4>Состав заказа</h4>
            <div className={styles.productsList}>
              {(order.products || []).map((product, index) => (
                <div key={index} className={styles.productItem}>
                  <div className={styles.productImage}>
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>
                      {product.name || 'Без названия'}
                    </div>
                    <div className={styles.productDetails}>
                      <span>Количество: {product.quantity || 1}</span>
                      <span>Цена: {parseFloat(product.price || 0).toFixed(2)} ₽</span>
                      <span>Сумма: {parseFloat((product.price || 0) * (product.quantity || 1)).toFixed(2)} ₽</span>
                    </div>
                    {product.sku && (
                      <div className={styles.productSku}>
                        Артикул: {product.sku}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.pricingSummary}>
            <div className={styles.pricingRow}>
              <span>Сумма товаров:</span>
              <span>{order.pricing?.subtotal || order.subtotal || totalAmount.toFixed(2)} ₽</span>
            </div>
            <div className={styles.pricingRow}>
              <span>Доставка:</span>
              <span>{order.pricing?.shippingCost || order.shippingCost || 0} ₽</span>
            </div>
            <div className={styles.pricingRow}>
              <span>Скидка:</span>
              <span>-{order.pricing?.discount || order.discount || 0} ₽</span>
            </div>
            <div className={`${styles.pricingRow} ${styles.total}`}>
              <span>Итого:</span>
              <span>{totalAmount.toFixed(2)} ₽</span>
            </div>
          </div>

          {order.customerNotes && (
            <div className={styles.notes}>
              <strong>Примечание клиента:</strong> {order.customerNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Компонент списка заказов
const UserOrderList = React.forwardRef(({ orders, loading, error, onRefresh }, ref) => {
  if (loading) {
    return (
      <div className={styles.userOrdersSection} id="orders" ref={ref}>
        <h3>Ваши заказы</h3>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.userOrdersSection} id="orders" ref={ref}>
        <h3>Ваши заказы</h3>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={onRefresh} className={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className={styles.userOrdersSection} id="orders" ref={ref}>
        <h3>Ваши заказы</h3>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📦</div>
          <p>У вас пока нет заказов</p>
          <Link href="/catalog" className={styles.shopButton}>
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  // Сортируем заказы по дате (новые первыми)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  return (
    <div className={styles.userOrdersSection} id="orders" ref={ref}>
      <div className={styles.sectionHeader}>
        <h3>Ваши заказы</h3>
        <button onClick={onRefresh} className={styles.refreshButton}>
          Обновить
        </button>
      </div>
      
      <div className={styles.ordersStats}>
        <span>Всего заказов: <strong>{orders.length}</strong></span>
        <span>
          На сумму: <strong>
            {orders.reduce((sum, order) => {
              if (order.totalAmount) return sum + order.totalAmount;
              if (order.pricing?.totalAmount) return sum + order.pricing.totalAmount;
              return sum;
            }, 0).toFixed(2)} ₽
          </strong>
        </span>
      </div>
      
      <div className={styles.ordersList}>
        {sortedOrders.map((order, index) => (
          <OrderItem 
            key={order._id || index} 
            order={order} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
});

UserOrderList.displayName = 'UserOrderList';

const UserProfileContent = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");
    const { user, logout } = useAuth();
    const ordersRef = useRef(null);

 // В UserProfile.jsx обновите функцию fetchOrders:

const fetchOrders = async () => {
    try {
        setLoading(true);
        setError("");
        
        console.log('🔄 Загрузка заказов пользователя...');
        
        const res = await fetch('/api/orders/my-orders', {
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log('📦 Данные заказов получены:', data);
            
            if (data.success && Array.isArray(data.orders)) {
                console.log(`✅ Загружено ${data.orders.length} заказов`);
                setOrders(data.orders);
            } else {
                console.warn('❌ Неожиданный формат данных заказов:', data);
                setError('Неверный формат данных заказов');
                setOrders([]);
            }
        } else {
            const errorData = await res.json();
            console.warn('❌ Ошибка загрузки заказов:', errorData);
            setError(errorData.message || `Ошибка ${res.status}: Не удалось загрузить заказы`);
            setOrders([]);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки заказов:', error);
        setError("Не удалось загрузить заказы. Проверьте подключение к интернету.");
        setOrders([]);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash === "#orders" && ordersRef.current) {
            setTimeout(() => {
                ordersRef.current.scrollIntoView({ behavior: "smooth" });
            }, 150);
        }
    }, [orders]);

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Профиль не найден</h2>
                    <p>Пожалуйста, войдите в систему</p>
                    <Link href="/login" className={styles.loginButton}>
                        Войти
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Личный кабинет</h1>
                <button onClick={logout} className={styles.logoutButton}>
                    Выйти
                </button>
            </div>
            
            <div className={styles.profileInfo}>
                <div className={styles.avatar}>
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.info}>
                    <h2>{user.username || 'Пользователь'}</h2>
                    <div className={styles.details}>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Телефон:</strong> {user.phone || 'Не указан'}</p>
                        <p><strong>Роль:</strong> {user.role === "admin" ? "Администратор" : "Пользователь"}</p>
                    </div>
                    <div className={styles.status}>
                        {user.emailVerified ? (
                            <span className={styles.verified}>
                                ✓ Email подтвержден
                            </span>
                        ) : (
                            <span className={styles.notVerified}>
                                ! Email не подтвержден
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <UserOrderList 
                orders={orders} 
                loading={loading} 
                error={error} 
                onRefresh={fetchOrders}
                ref={ordersRef} 
            />
        </div>
    );
};

const UserProfile = () => {
    return (
        <Suspense fallback={
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка профиля...</p>
            </div>
        }>
            <UserProfileContent />
        </Suspense>
    );
};

export default UserProfile;