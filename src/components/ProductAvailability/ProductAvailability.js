// components/ProductAvailability/ProductAvailability.jsx
'use client';

import { useShopContext } from '../ShopContext/ShopContext';

export default function ProductAvailability({ productSlug }) {
  const { getProductBySlug, cartItems } = useShopContext();
  
  const product = getProductBySlug(productSlug);
  
  if (!product) return null;
  
  const inCart = cartItems[productSlug] || 0;
  const available = Math.max(0, (product.quantity || 0) - (product.reservedQuantity || 0));
  
  const getAvailabilityText = () => {
    if (available === 0) {
      return 'Нет в наличии';
    } else if (available <= product.lowStockThreshold) {
      return `Осталось ${available} шт.`;
    } else {
      return 'В наличии';
    }
  };
  
  const getAvailabilityColor = () => {
    if (available === 0) return 'text-red-600';
    if (available <= product.lowStockThreshold) return 'text-orange-600';
    return 'text-green-600';
  };
  
  return (
    <div className="text-sm">
      <div className={`font-medium ${getAvailabilityColor()}`}>
        {getAvailabilityText()}
      </div>
      {inCart > 0 && (
        <div className="text-gray-500">
          В вашей корзине: {inCart} шт.
        </div>
      )}
    </div>
  );
}