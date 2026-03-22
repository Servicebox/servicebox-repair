// components/Checkout/CheckoutForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './CheckoutForm.module.css';

const CheckoutForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: 'самовывоз',
    comment: ''
  });
  
  useEffect(() => {
    loadCartAndProducts();
  }, [user]);
  
  const loadCartAndProducts = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        setCart({});
      }
    }
    
    // Автозаполнение из профиля пользователя
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
    
    fetch('/api/allproducts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products);
      });
  };
  
  // Функция удаления позиции из корзины
  const handleRemoveItem = (slug) => {
    if (!confirm('Удалить этот товар из корзины?')) return;
    
    const newCart = { ...cart };
    delete newCart[slug];
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Если корзина пуста, обновляем страницу
    if (Object.keys(newCart).length === 0) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
  
  // Функция уменьшения количества товара
  const handleDecreaseQuantity = (slug, currentQuantity) => {
    if (currentQuantity <= 1) {
      handleRemoveItem(slug);
      return;
    }
    
    const newCart = {
      ...cart,
      [slug]: currentQuantity - 1
    };
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };
  
  // Функция увеличения количества товара
  const handleIncreaseQuantity = (slug, product) => {
    const currentQuantity = cart[slug] || 0;
    
    // Проверяем наличие на складе
    if (product.quantity && currentQuantity >= product.quantity) {
      alert(`На складе осталось только ${product.quantity} шт. этого товара`);
      return;
    }
    
    const newCart = {
      ...cart,
      [slug]: currentQuantity + 1
    };
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };
  
  // Функция полной очистки корзины
  const handleClearCart = () => {
    if (!confirm('Очистить всю корзину?')) return;
    
    setCart({});
    localStorage.removeItem('cart');
    
    setTimeout(() => {
      router.push('/parts');
    }, 1000);
  };
  
  const visibleProducts = products
    .filter(p => cart[p.slug] > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const calculateTotal = () => {
    return visibleProducts.reduce((sum, product) => {
      return sum + (product.new_price * (cart[product.slug] || 0));
    }, 0);
  };
  
  const totalAmount = calculateTotal();
  
// В CheckoutForm.jsx обновите handleSubmit:

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Валидация
  if (!formData.phone || formData.phone.trim().length < 5) {
    alert('Пожалуйста, укажите корректный номер телефона');
    return;
  }
  
  if (visibleProducts.length === 0) {
    alert('Ваша корзина пуста!');
    return;
  }
  
  setLoading(true);
  
  // Вычисляем суммы
  const subtotal = visibleProducts.reduce((sum, product) => {
    return sum + (product.new_price * (cart[product.slug] || 0));
  }, 0);
  
  const shippingCost = deliveryMethod === 'delivery' ? 300 : 0;
  const totalAmount = subtotal + shippingCost;
  
  // Формируем данные заказа В ПРАВИЛЬНОМ ФОРМАТЕ
  const orderData = {
    // Информация о клиенте
    customerInfo: {
      username: formData.name.trim() || 'Покупатель',
      email: formData.email.trim() || 'не_указан@example.com',
      phone: formData.phone.trim() || 'не указан'
    },
    
    // Товары (убедитесь, что у продуктов есть _id)
    products: visibleProducts.map(product => ({
      productId: product._id || product.slug, // Важно: productId должен быть ObjectId или строкой
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '',
      price: product.new_price,
      quantity: cart[product.slug],
      totalPrice: product.new_price * cart[product.slug]
    })),
    
    // Финансовая информация (на верхнем уровне!)
    // НЕ используем вложенный объект pricing!
    subtotal: subtotal,
    shippingCost: shippingCost,
    discount: 0,
    tax: 0,
    totalAmount: totalAmount,
    
    // Доставка
    shippingMethod: deliveryMethod,
    shippingAddress: {
      fullName: formData.name.trim(),
      address: deliveryMethod === 'delivery' ? formData.address.trim() : 'Самовывоз',
      city: 'Вологда',
      country: 'Россия'
    },
    
    // Оплата
    paymentMethod: paymentMethod,
    status: 'pending',
    paymentStatus: 'pending',
    
    // Примечания
    customerNotes: formData.comment || `Способ получения: ${deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}`
  };
  
  console.log('📦 Отправка заказа в API:', JSON.stringify(orderData, null, 2));
  
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    console.log('📨 Ответ от API:', result);
    
    if (response.ok && result.success) {
      console.log('✅ Заказ создан успешно:', result);
      
      // Очищаем корзину
      localStorage.removeItem('cart');
      setCart({});
      
      // Перенаправляем на страницу успеха
      router.push(`/thank-you?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
      
    } else {
      console.error('❌ Ошибка создания заказа:', result);
      
      // Более информативное сообщение об ошибке
      let errorMessage = 'Ошибка создания заказа';
      if (result.details && Array.isArray(result.details)) {
        errorMessage += ': ' + result.details.map(d => d.message).join(', ');
      } else if (result.message) {
        errorMessage = result.message;
      } else if (result.error) {
        errorMessage = result.error;
      }
      
      alert(errorMessage);
      setLoading(false);
    }
    
  } catch (error) {
    console.error('❌ Ошибка сети:', error);
    alert('Ошибка сети при оформлении заказа. Проверьте подключение к интернету.');
    setLoading(false);
  }
};
  
  if (visibleProducts.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h1>🛒 Корзина пуста</h1>
        <p>Вы еще не добавили товары в корзину</p>
        <button 
          onClick={() => router.push('/parts')}
          className={styles.continueShopping}
        >
          Продолжить покупки
        </button>
      </div>
    );
  }
  
  const formatPrice = (price) => {
    const rounded = Math.round(price * 100) / 100;
    return rounded.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  const deliveryCost = deliveryMethod === 'delivery' ? 300 : 0;
  const finalTotal = totalAmount + deliveryCost;
  
  return (
    <div className={styles.checkoutContainer}>
      <h1>Оформление заказа</h1>
      
      <div className={styles.checkoutLayout}>
        <div className={styles.orderSummary}>
          <div className={styles.summaryHeader}>
            <h2>Ваш заказ ({visibleProducts.length} товаров)</h2>
            <button 
              onClick={handleClearCart}
              className={styles.clearCartButton}
              title="Очистить всю корзину"
            >
              🗑️ Очистить корзину
            </button>
          </div>
          
          <div className={styles.orderItems}>
            {visibleProducts.map(product => {
              const quantity = cart[product.slug] || 0;
              const itemTotal = product.new_price * quantity;
              
              return (
                <div key={product.slug} className={styles.orderItem}>
                  <div className={styles.productImage}>
                    {product.images?.[0] && (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    )}
                  </div>
                  
                  <div className={styles.productInfo}>
                    <div className={styles.productHeader}>
                      <div className={styles.productName}>
                        <strong>{product.name}</strong>
                        <small>Артикул: {product.slug}</small>
                        {product.quantity && quantity > product.quantity && (
                          <span className={styles.stockWarning}>
                            ⚠️ На складе только {product.quantity} шт.
                          </span>
                        )}
                      </div>
                      
                      <div className={styles.productActions}>
                        <div className={styles.quantityControls}>
                          <button
                            type="button"
                            onClick={() => handleDecreaseQuantity(product.slug, quantity)}
                            className={styles.quantityButton}
                            title="Уменьшить количество"
                          >
                            −
                          </button>
                          
                          <span className={styles.quantityValue}>
                            {quantity} шт.
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => handleIncreaseQuantity(product.slug, product)}
                            className={styles.quantityButton}
                            disabled={product.quantity && quantity >= product.quantity}
                            title="Увеличить количество"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(product.slug)}
                          className={styles.removeButton}
                          title="Удалить товар"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.productPrice}>
                      <div className={styles.priceInfo}>
                        <span className={styles.unitPrice}>
                          {formatPrice(product.new_price)} ₽ × {quantity}
                        </span>
                        <span className={styles.itemTotal}>
                          = {formatPrice(itemTotal)} ₽
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className={styles.priceBreakdown}>
            <div className={styles.priceRow}>
              <span>Товары ({visibleProducts.reduce((sum, p) => sum + (cart[p.slug] || 0), 0)} шт.):</span>
              <span>{formatPrice(totalAmount)} ₽</span>
            </div>
            <div className={styles.priceRow}>
              <span>Доставка:</span>
              <span>{deliveryMethod === 'delivery' ? '300 ₽' : 'Бесплатно'}</span>
            </div>
            <div className={`${styles.priceRow} ${styles.totalRow}`}>
              <strong>Итого к оплате:</strong>
              <strong>{formatPrice(finalTotal)} ₽</strong>
            </div>
          </div>
          
          <div className={styles.cartSummary}>
            <p>💡 Вы можете изменить количество товаров или удалить позиции до подтверждения заказа</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.orderForm}>
          <h2>Данные для заказа</h2>
          
          <div className={styles.formGroup}>
            <label>Имя *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Как к вам обращаться?"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Телефон *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+7 (900) 123-45-67"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Email (для уведомлений)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="example@mail.ru"
            />
          </div>
          
          <div className={styles.formSection}>
            <h3>Способ получения</h3>
            
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => {
                    setDeliveryMethod('pickup');
                    setFormData({...formData, address: 'самовывоз'});
                  }}
                />
                <span className={styles.radioText}>
                  <strong>Самовывоз</strong>
                  <small>Бесплатно • 1-3 дня • г. Вологда</small>
                  <small>ул. Ленина, 6 или ул. Северная, 7А, офис 405</small>
                </span>
              </label>
              
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={deliveryMethod === 'delivery'}
                  onChange={() => {
                    setDeliveryMethod('delivery');
                    setFormData({...formData, address: ''});
                  }}
                />
                <span className={styles.radioText}>
                  <strong>Доставка курьером</strong>
                  <small>300 ₽ • 1-2 дня • Вологда и область</small>
                </span>
              </label>
            </div>
            
            {deliveryMethod === 'delivery' && (
              <div className={styles.formGroup}>
                <label>Адрес доставки *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Улица, дом, квартира"
                />
              </div>
            )}
          </div>
          
          <div className={styles.formSection}>
            <h3>Способ оплаты</h3>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <span className={styles.radioText}>
                  <strong>Наличными при получении</strong>
                </span>
              </label>
              
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span className={styles.radioText}>
                  <strong>Картой онлайн</strong>
                  <small>Visa, Mastercard, Мир</small>
                </span>
              </label>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Комментарий к заказу</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              rows="3"
              placeholder="Дополнительные пожелания, время звонка и т.д."
            />
          </div>
          
          <div className={styles.formFooter}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || visibleProducts.length === 0}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Оформление...
                </>
              ) : (
                `Подтвердить заказ — ${formatPrice(finalTotal)} ₽`
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => router.push('/parts')}
              className={styles.continueButton}
            >
              ← Добавить еще товары
            </button>
          </div>
          
          <div className={styles.securityNote}>
            <small>Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;