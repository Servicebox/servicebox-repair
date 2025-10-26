// app/product/[slug]/page.js
'use client';

import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { ShopContext } from '@/components/ShopContext/ShopContext'; // ← фигурные скобки!
import ProductDisplay from '@/components/ProductDisplay/ProductDisplay';

export default function ProductPage() {
  const context = useContext(ShopContext);

  // Защита от SSR и неготовности контекста
  if (!context) {
    return <div>Загрузка...</div>;
  }

  const { all_product, loading } = context;
  const params = useParams();
  const slug = params.slug;

  if (loading) {
    return <div>Загрузка товара...</div>;
  }

  const product = all_product.find(p => p.slug === slug);

  if (!product) {
    return <div>Товар не найден</div>;
  }

  return <ProductDisplay product={product} />;
}