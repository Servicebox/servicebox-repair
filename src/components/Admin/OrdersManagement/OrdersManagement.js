// components/Admin/OrdersManagement/OrdersManagement.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './OrdersManagement.module.css';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const { user: currentUser } = useAuth();

  const fetchOrders = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        ...(status !== 'all' && { status })
      });

      const response = await fetch(`/api/orders?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при загрузке заказов');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Ошибка сети при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchOrders();
    }
  }, [currentUser]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setError('');
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setSuccess('Статус заказа успешно обновлен');
        fetchOrders(currentPage, statusFilter);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при обновлении статуса');
      }
    } catch (err) {
      console.error('Update order error:', err);
      setError('Ошибка сети при обновлении статуса');
    }
  };

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

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className={styles.container}>
        <div className={styles.error}>У вас нет доступа к этой странице</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление заказами</h1>
        <div className={styles.filters}>
          <select 
            value={statusFilter} 
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchOrders(1, e.target.value);
            }}
            className={styles.filterSelect}
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидают обработки</option>
            <option value="confirmed">Подтвержденные</option>
            <option value="processing">В обработке</option>
            <option value="shipped">Отправленные</option>
            <option value="delivered">Доставленные</option>
            <option value="cancelled">Отмененные</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={() => setError('')} className={styles.closeButton}>×</button>
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className={styles.closeButton}>×</button>
        </div>
      )}

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div key={order._id} className={styles.orderCard}>
            <div 
              className={styles.orderHeader}
              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
            >
              <div className={styles.orderMainInfo}>
                <div className={styles.orderNumber}>Заказ #{order.orderNumber}</div>
                <div className={styles.customerInfo}>
                  {order.customerInfo.username} ({order.customerInfo.email})
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
                <div className={styles.detailsGrid}>
                  <div className={styles.detailSection}>
                    <h4>Информация о клиенте</h4>
                    <p><strong>Имя:</strong> {order.customerInfo.username}</p>
                    <p><strong>Email:</strong> {order.customerInfo.email}</p>
                    <p><strong>Телефон:</strong> {order.customerInfo.phone || 'Не указан'}</p>
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h4>Доставка</h4>
                    <p><strong>Способ:</strong> 
                      {order.shippingMethod === 'pickup' ? 'Самовывоз' : 
                       order.shippingMethod === 'courier' ? 'Курьер' : 'Почта'}
                    </p>
                    <p><strong>Адрес:</strong> {order.shippingAddress?.address}</p>
                    <p><strong>Город:</strong> {order.shippingAddress?.city}</p>
                    <p><strong>Индекс:</strong> {order.shippingAddress?.postalCode}</p>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Оплата</h4>
                    <p><strong>Способ:</strong> 
                      {order.paymentMethod === 'cash' ? 'Наличные' : 
                       order.paymentMethod === 'card' ? 'Карта' : 'Онлайн'}
                    </p>
                    <p><strong>Статус оплаты:</strong> {order.paymentStatus}</p>
                  </div>
                </div>

                <div className={styles.productsSection}>
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
                          <div className={styles.productDetails}>
                            {product.quantity} × {product.price}₽ = {product.totalPrice}₽
                          </div>
                          <div className={styles.productSlug}>Артикул: {product.slug}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.pricingSummary}>
                  <div className={styles.pricingRow}>
                    <span>Сумма товаров:</span>
                    <span>{order.pricing.subtotal}₽</span>
                  </div>
                  <div className={styles.pricingRow}>
                    <span>Доставка:</span>
                    <span>{order.pricing.shippingCost}₽</span>
                  </div>
                  <div className={`${styles.pricingRow} ${styles.total}`}>
                    <span>Итого:</span>
                    <span>{order.pricing.totalAmount}₽</span>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <label>Изменить статус:</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="pending">Ожидает обработки</option>
                    <option value="confirmed">Подтвержден</option>
                    <option value="processing">В обработке</option>
                    <option value="shipped">Отправлен</option>
                    <option value="delivered">Доставлен</option>
                    <option value="cancelled">Отменен</option>
                    <option value="refunded">Возврат</option>
                  </select>
                  
                  {order.customerNotes && (
                    <div className={styles.notes}>
                      <strong>Примечание клиента:</strong> {order.customerNotes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && !loading && (
        <div className={styles.empty}>
          <p>Заказы не найдены</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => fetchOrders(currentPage - 1, statusFilter)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            Назад
          </button>
          
          <span className={styles.pageInfo}>
            Страница {currentPage} из {totalPages}
          </span>
          
          <button
            onClick={() => fetchOrders(currentPage + 1, statusFilter)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
}