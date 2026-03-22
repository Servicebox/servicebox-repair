// hooks/useProductAvailability.js
import { useEffect } from 'react';
import { useShopContext } from '../ShopContext/ShopContext';

export function useProductAvailability() {
  const { refreshProducts } = useShopContext();
  
  useEffect(() => {
    // Обновляем доступность каждые 2 минуты
    const interval = setInterval(() => {
      refreshProducts();
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshProducts]);
}