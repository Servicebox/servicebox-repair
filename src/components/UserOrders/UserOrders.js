// components/UserOrders/UserOrders.jsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../ShopContext/ShopContext';
import styles from './UserOrders.module.css';

const UserOrders = () => {
  const { userOrders, fetchUserOrders } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await fetchUserOrders();
      setLoading(false);
    };
    
    loadOrders();
  }, [fetchUserOrders]);

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидает обработки',
      'confirmed': 'Подтвержден',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен',
      'refunded': 'Возврат'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>У вас пока нет заказов</h3>
        <p>После оформления заказа вы увидите его историю здесь</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Мои заказы</h2>
      <div className={styles.ordersList}>
        {userOrders.map((order) => (
          <div key={order._id} className={styles.orderCard}>
            <div 
              className={styles.orderHeader}
              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
            >
              <div className={styles.orderInfo}>
                <div className={styles.orderNumber}>
                  Заказ #{order.orderNumber}
                </div>
                <div className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </div>
                <div className={`${styles.status} ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>
              <div className={styles.orderTotal}>
                {order.pricing.totalAmount}₽
              </div>
              <div className={styles.expandIcon}>
                {expandedOrder === order._id ? '▲' : '▼'}
              </div>
            </div>

            {expandedOrder === order._id && (
              <div className={styles.orderDetails}>
                {/* Информация о доставке */}
                <div className={styles.section}>
                  <h4>Информация о доставке</h4>
                  <div className={styles.detailsGrid}>
                    <div>
                      <strong>Способ доставки:</strong> 
                      {order.shippingMethod === 'pickup' ? 'Самовывоз' : 
                       order.shippingMethod === 'courier' ? 'Курьер' : 'Почта'}
                    </div>
                    <div>
                      <strong>Адрес:</strong> 
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}
                    </div>
                    <div>
                      <strong>Способ оплаты:</strong> 
                      {order.paymentMethod === 'cash' ? 'Наличные' : 
                       order.paymentMethod === 'card' ? 'Карта' : 'Онлайн'}
                    </div>
                  </div>
                </div>

                {/* Товары */}
                <div className={styles.section}>
                  <h4>Товары в заказе</h4>
                  <div className={styles.productsList}>
                    {order.products.map((product, index) => (
                      <div key={index} className={styles.productItem}>
                        <div className={styles.productImage}>
                          {product.image && (
                            <img src={product.image} alt={product.name} />
                          )}
                        </div>
                        <div className={styles.productInfo}>
                          <div className={styles.productName}>{product.name}</div>
                          <div className={styles.productPrice}>
                            {product.quantity} × {product.price}₽ = {product.totalPrice}₽
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Итоговая стоимость */}
                <div className={styles.pricing}>
                  <div className={styles.pricingRow}>
                    <span>Сумма товаров:</span>
                    <span>{order.pricing.subtotal}₽</span>
                  </div>
                  <div className={styles.pricingRow}>
                    <span>Доставка:</span>
                    <span>{order.pricing.shippingCost}₽</span>
                  </div>
                  {order.pricing.discount > 0 && (
                    <div className={styles.pricingRow}>
                      <span>Скидка:</span>
                      <span>-{order.pricing.discount}₽</span>
                    </div>
                  )}
                  <div className={`${styles.pricingRow} ${styles.total}`}>
                    <span>Итого:</span>
                    <span>{order.pricing.totalAmount}₽</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;