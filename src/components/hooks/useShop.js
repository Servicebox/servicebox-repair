 'use client';

import { useContext } from 'react';
import ShopContext from '../ShopContext/ShopContext';

export const useShop = () => {
  const context = useContext(ShopContext);
  
  if (!context) {
    throw new Error('useShop must be used within a ShopContextProvider');
  }
  
  return context;
};