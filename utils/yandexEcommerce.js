'use client';

// Инициализация глобального dataLayer
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// Основная функция отправки событий
export const sendEcommerceEvent = (eventData) => {
  if (typeof window === 'undefined' || !window.dataLayer) {
    console.warn('dataLayer is not available.');
    return;
  }
  
  console.log('📊 Sending ecommerce event:', eventData);
  window.dataLayer.push(eventData);
  
  // Также отправляем в Google Analytics если есть
  if (window.gtag && eventData.ecommerce) {
    const eventName = Object.keys(eventData.ecommerce)[0];
    const data = eventData.ecommerce[eventName];
    
    if (eventName === 'purchase') {
      window.gtag('event', 'purchase', {
        transaction_id: data.actionField.id,
        value: data.actionField.revenue,
        currency: 'RUB',
        items: data.products.map(p => ({
          item_id: p.id,
          item_name: p.name,
          price: p.price,
          quantity: p.quantity,
          item_category: p.category
        }))
      });
    }
  }
};

// Форматирование данных товара
export const formatProductData = (product, quantity) => ({
  id: product.slug || product.id,
  name: product.name,
  price: product.new_price || product.price,
  quantity: quantity || 1,
  category: product.category || 'parts',
  variant: product.variant || '',
  brand: product.brand || 'Мастерская Вологды'
});

// Хелпер для получения данных корзины
export const getCartData = (cartItems, allProducts) => {
  return Object.keys(cartItems)
    .filter(slug => cartItems[slug] > 0)
    .map(slug => {
      const product = allProducts.find(p => p.slug === slug);
      if (!product) return null;
      return {
        product,
        quantity: cartItems[slug],
        total: product.new_price * cartItems[slug]
      };
    })
    .filter(item => item !== null);
};

// События ecommerce
export const ecommerceEvents = {
  // Просмотр товара
  productView: (product) => ({
    ecommerce: {
      currencyCode: 'RUB',
      detail: {
        products: [formatProductData(product)]
      }
    }
  }),
  
  // Добавление в корзину
  addToCart: (product, quantity = 1) => ({
    ecommerce: {
      currencyCode: 'RUB',
      add: {
        products: [formatProductData(product, quantity)]
      }
    }
  }),
  
  // Удаление из корзины
  removeFromCart: (product) => ({
    ecommerce: {
      currencyCode: 'RUB',
      remove: {
        products: [formatProductData(product)]
      }
    }
  }),
  
  // Начало оформления заказа
  beginCheckout: (products, totalAmount) => ({
    ecommerce: {
      currencyCode: 'RUB',
      checkout: {
        products: products.map(p => formatProductData(p.product, p.quantity)),
        actionField: { step: 1, option: 'cart' }
      }
    }
  }),
  
  // Покупка (самое важное событие)
  purchase: (orderId, products, revenue, tax = 0, shipping = 0) => ({
    ecommerce: {
      currencyCode: 'RUB',
      purchase: {
        actionField: {
          id: orderId,
          affiliation: 'Мастерская Вологды',
          revenue: revenue,
          tax: tax,
          shipping: shipping,
          coupon: ''
        },
        products: products.map(p => formatProductData(p.product, p.quantity))
      }
    }
  }),
  
  // Просмотр корзины
  viewCart: (products) => ({
    ecommerce: {
      currencyCode: 'RUB',
      view_cart: {
        products: products.map(p => formatProductData(p.product, p.quantity))
      }
    }
  })
};

// Вспомогательная функция для отправки события добавления в корзину
export const trackAddToCart = (product, quantity) => {
  sendEcommerceEvent(ecommerceEvents.addToCart(product, quantity));
};

// Вспомогательная функция для отправки события удаления из корзины
export const trackRemoveFromCart = (product) => {
  sendEcommerceEvent(ecommerceEvents.removeFromCart(product));
};

// Вспомогательная функция для отправки события покупки
export const trackPurchase = (orderId, products, revenue) => {
  sendEcommerceEvent(ecommerceEvents.purchase(orderId, products, revenue));
};

// Сохранение данных корзины для последующей отправки события покупки
export const saveCartDataForPurchase = (products, totalAmount) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('cartData', JSON.stringify({
      products: products,
      totalAmount: totalAmount,
      timestamp: new Date().toISOString()
    }));
  }
};