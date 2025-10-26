// components/Checkout/CheckoutForm.jsx
'use client';

import { useState, useContext } from 'react';
import { ShopContext } from '../ShopContext/ShopContext';
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './CheckoutForm.module.css';

export default function CheckoutForm() {
  const { createOrder, cartItems, getTotalCartAmount, getTotalCartItems, all_product } = useContext(ShopContext);
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Россия',
    shippingMethod: 'pickup',
    paymentMethod: 'cash',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  // Функция расчета стоимости доставки
  const calculateShipping = () => {
    switch (formData.shippingMethod) {
      case 'pickup':
        return 0;
      case 'courier':
        return 300;
      case 'post':
        return 200;
      default:
        return 0;
    }
  };

  // Обновление полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик отправки формы
  const handleCheckout = async (e) => {
    e.preventDefault();
    console.log('🛒 Starting checkout process...');
    
    // Проверяем, есть ли товары в корзине
    if (getTotalCartItems() === 0) {
      alert('Корзина пуста!');
      return;
    }
    
    setLoading(true);
    
    try {
      // Подготовка данных заказа
      const orderData = {
        customerInfo: {
          username: formData.fullName || user?.username || 'Покупатель',
          email: user?.email || '',
          phone: formData.phone
        },
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        shippingCost: calculateShipping(),
        customerNotes: formData.notes
      };

      console.log('📦 Order data prepared:', orderData);
      console.log('🛒 Current cart items:', cartItems);
      
      // Создание заказа
      const result = await createOrder(orderData);
      console.log('✅ Order creation result:', result);
      
      // Редирект или показ успешного сообщения
      if (result.success) {
        alert('Заказ успешно создан!');
        router.push('/profile');
      } else {
        alert('Ошибка при создании заказа: ' + (result.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert('Ошибка при создании заказа: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Если корзина пуста, показываем сообщение
  if (getTotalCartItems() === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Корзина пуста</h2>
        <p>Добавьте товары в корзину перед оформлением заказа</p>
        <button 
          onClick={() => router.push('/parts')}
          className={styles.continueShopping}
        >
          Продолжить покупки
        </button>
      </div>
    );
  }

  // Получаем информацию о товарах в корзине для отображения
  const cartProducts = [];
  for (const itemSlug in cartItems) {
    if (cartItems[itemSlug] > 0) {
      const product = all_product.find(p => p.slug === itemSlug);
      if (product) {
        cartProducts.push({
          ...product,
          quantity: cartItems[itemSlug],
          totalPrice: product.new_price * cartItems[itemSlug]
        });
      }
    }
  }

  const totalAmount = getTotalCartAmount() + calculateShipping();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Оформление заказа</h1>
      
      <div className={styles.checkoutContent}>
        {/* Форма заказа */}
        <div className={styles.formSection}>
          <form onSubmit={handleCheckout} className={styles.form}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Контактная информация</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.label}>
                  ФИО *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  placeholder="Введите ваше полное имя"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Телефон *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Адрес доставки</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="address" className={styles.label}>
                  Адрес *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  placeholder="Улица, дом, квартира"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city" className={styles.label}>
                    Город *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                    placeholder="Город"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="postalCode" className={styles.label}>
                    Индекс
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Почтовый индекс"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.label}>
                  Страна
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Россия">Россия</option>
                  <option value="Казахстан">Казахстан</option>
                  <option value="Беларусь">Беларусь</option>
                </select>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Способ доставки</h2>
              
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="pickup"
                    checked={formData.shippingMethod === 'pickup'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>
                    <strong>Самовывоз</strong>
                    <span>Бесплатно</span>
                  </span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="courier"
                    checked={formData.shippingMethod === 'courier'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>
                    <strong>Курьерская доставка</strong>
                    <span>300₽</span>
                  </span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="post"
                    checked={formData.shippingMethod === 'post'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>
                    <strong>Почта России</strong>
                    <span>200₽</span>
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Способ оплаты</h2>
              
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>
                    <strong>Наличными при получении</strong>
                  </span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>
                    <strong>Банковской картой онлайн</strong>
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Комментарий к заказу</h2>
              
              <div className={styles.formGroup}>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Дополнительные пожелания к заказу..."
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Оформление заказа...' : `Оформить заказ - ${totalAmount}₽`}
            </button>
          </form>
        </div>

        {/* Сводка заказа */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Ваш заказ</h3>
            
            <div className={styles.productsList}>
              {cartProducts.map((product, index) => (
                <div key={index} className={styles.productItem}>
                  <div className={styles.productImage}>
                    {product.images && product.images[0] && (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className={styles.image}
                      />
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productDetails}>
                      {product.quantity} × {product.new_price}₽
                    </div>
                  </div>
                  <div className={styles.productTotal}>
                    {product.totalPrice}₽
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Сумма товаров:</span>
                <span>{getTotalCartAmount()}₽</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>Доставка:</span>
                <span>{calculateShipping()}₽</span>
              </div>
              
              <div className={styles.summaryRowTotal}>
                <span>Итого:</span>
                <span>{totalAmount}₽</span>
              </div>
            </div>

            <div className={styles.cartInfo}>
              <div className={styles.cartItemCount}>
                {getTotalCartItems()} товар(а)
              </div>
              <button 
                onClick={() => router.push('/cart')}
                className={styles.editCartButton}
              >
                Изменить корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}