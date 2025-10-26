// contexts/ShopContext.js
'use client';
import React, { createContext, useState, useEffect, useCallback } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 301; index++) {
    cart[index] = 0;
  }
  return cart;
};

export const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [all_product, setAll_Product] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  // Функция для авторизованных запросов
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url.startsWith('/api') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (response.status === 401) {
        const authCheck = await fetch('/api/auth/me', { credentials: 'include' });
        if (!authCheck.ok) {
          throw new Error('Authentication required');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  }, []);

  // Загрузка продуктов
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithAuth('/api/allproducts');
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      const data = await response.json();
      
      let productsArray = [];
      
      if (data.success && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (Array.isArray(data)) {
        productsArray = data;
      } else if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
      } else {
        productsArray = [];
      }

      const slugs = new Set();
      const uniqueProducts = productsArray.filter(product => {
        if (!product.slug) return false;
        if (slugs.has(product.slug)) return false;
        slugs.add(product.slug);
        return true;
      });

      setAll_Product(uniqueProducts);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
      setError(`Не удалось загрузить продукты: ${error.message}`);
      setAll_Product([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  // Загрузка корзины
  const fetchCartItems = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/cart');
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart || {});
      } else {
        setCartItems(getDefaultCart());
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      setCartItems(getDefaultCart());
    }
  }, [fetchWithAuth]);

  // Загрузка заказов пользователя
  const fetchUserOrders = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/orders/my-orders');
      if (response.ok) {
        const data = await response.json();
        setUserOrders(data.orders || []);
        return data.orders || [];
      }
      return [];
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setUserOrders([]);
      return [];
    }
  }, [fetchWithAuth]);

  // Инициализация данных
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchCartItems()
      ]);
    };
    
    initializeData();
  }, [fetchProducts, fetchCartItems]);

  // Добавление в корзину
  const addToCart = async (itemSlug) => {
    const previousQuantity = cartItems[itemSlug] || 0;
    
    setCartItems(prev => ({
      ...prev,
      [itemSlug]: previousQuantity + 1
    }));

    try {
      await fetchWithAuth('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ itemSlug }),
      });
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      setCartItems(prev => ({
        ...prev,
        [itemSlug]: previousQuantity
      }));
      setError(`Не удалось добавить товар: ${error.message}`);
    }
  };

  // Удаление из корзины
  const removeFromCart = async (itemSlug) => {
    const previousQuantity = cartItems[itemSlug] || 0;
    const newQuantity = Math.max(previousQuantity - 1, 0);
    
    setCartItems(prev => ({
      ...prev,
      [itemSlug]: newQuantity
    }));

    try {
      await fetchWithAuth('/api/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ itemSlug }),
      });
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      setCartItems(prev => ({
        ...prev,
        [itemSlug]: previousQuantity
      }));
      setError(`Не удалось удалить товар: ${error.message}`);
    }
  };

  // Создание заказа
// contexts/ShopContext.js - обновите функцию createOrder
const createOrder = async (orderData) => {
  try {
    console.log('🛒 Starting order creation process...');
    
    // Подготавливаем данные для заказа
    const cartProducts = [];
    let subtotal = 0;

    console.log('📦 Preparing products from cart...');
    // Формируем массив товаров из корзины
    for (const itemSlug in cartItems) {
      if (cartItems[itemSlug] > 0) {
        const product = all_product.find(p => p.slug === itemSlug);
        if (product) {
          const itemTotal = product.new_price * cartItems[itemSlug];
          cartProducts.push({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images?.[0] || '',
            price: product.new_price,
            quantity: cartItems[itemSlug],
            totalPrice: itemTotal
          });
          subtotal += itemTotal;
          console.log(`📋 Added to order: ${product.name}, quantity: ${cartItems[itemSlug]}, price: ${product.new_price}`);
        }
      }
    }

    console.log(`💰 Subtotal: ${subtotal}, Products count: ${cartProducts.length}`);

    const orderPayload = {
      products: cartProducts,
      pricing: {
        subtotal: subtotal,
        shippingCost: orderData.shippingCost || 0,
        discount: 0,
        tax: 0,
        totalAmount: subtotal + (orderData.shippingCost || 0)
      },
      customerInfo: {
        username: orderData.customerInfo?.username || '',
        email: orderData.customerInfo?.email || '',
        phone: orderData.customerInfo?.phone || ''
      },
      shippingAddress: orderData.shippingAddress,
      shippingMethod: orderData.shippingMethod || 'pickup',
      paymentMethod: orderData.paymentMethod || 'cash',
      customerNotes: orderData.customerNotes || ''
      // orderNumber НЕ передаем - генерируется на сервере
    };

    console.log('📤 Sending order to API...', orderPayload);
    const response = await fetchWithAuth('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    
    console.log('📨 API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Order creation failed:', errorData);
      throw new Error(errorData.error || 'Ошибка при создании заказа');
    }
    
    const data = await response.json();
    console.log('✅ Order creation successful:', data);
    
    if (data.success) {
      // Очищаем корзину после успешного заказа
      console.log('🔄 Clearing cart...');
      setCartItems(getDefaultCart());
      // Обновляем список заказов
      await fetchUserOrders();
      console.log('✅ Cart cleared and orders refreshed');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error in createOrder:', error);
    setError(`Не удалось создать заказ: ${error.message}`);
    throw error;
  }
};

  // Загрузка заказов
  const fetchOrders = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      
      const url = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetchWithAuth(url);
      
      if (response.ok) {
        const data = await response.json();
        return data.orders || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Не удалось загрузить заказы');
      return [];
    }
  };

  // Расчеты корзины
  const getTotalCartAmount = useCallback(() => {
    let totalAmount = 0;
    for (const itemSlug in cartItems) {
      if (cartItems[itemSlug] > 0) {
        const product = all_product.find(p => p.slug === itemSlug);
        if (product && product.new_price) {
          totalAmount += product.new_price * cartItems[itemSlug];
        }
      }
    }
    return totalAmount;
  }, [cartItems, all_product]);

  const getTotalCartItems = useCallback(() => {
    let totalItems = 0;
    for (const itemSlug in cartItems) {
      if (cartItems[itemSlug] > 0) {
        totalItems += cartItems[itemSlug];
      }
    }
    return totalItems;
  }, [cartItems]);

  const getCartItemCount = useCallback((itemSlug) => {
    return cartItems[itemSlug] || 0;
  }, [cartItems]);

  const contextValue = {
    // Данные
    all_product,
    cartItems,
    loading,
    error,
    userOrders,
    
    // Действия
    addToCart,
    removeFromCart,
    createOrder,
    fetchOrders,
    fetchUserOrders,
    fetchWithAuth,
    refreshCart: fetchCartItems,
    refreshProducts: fetchProducts,
    
    // Расчеты
    getTotalCartAmount,
    getTotalCartItems,
    getCartItemCount,
    
    // Управление ошибками
    clearError: () => setError(null),
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;