'use client';

import dynamic from 'next/dynamic';

// Динамическая загрузка чтобы избежать SSR для админки
const ListProduct = dynamic(() => import('@/components/ListProduct'), {
  ssr: false,
  loading: () => <div>Загрузка админки...</div>
});

export default function AdminProductsPage() {
  return <ListProduct />;
}