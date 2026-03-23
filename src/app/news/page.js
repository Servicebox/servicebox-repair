// src/app/news/page.js
import { Suspense } from 'react';
import NewsList from '@/components/NewsList/NewsList';

export const metadata = {
  title: 'Новости и акции | ServiceBox Вологда',
  description: 'Свежие новости сервисного центра ServiceBox: акции, советы по ремонту, обновления. Подпишитесь, чтобы быть в курсе!',
  keywords: 'новости, акции, ремонт техники, Вологда, сервисный центр, советы',
};

// Генерация статических параметров для SSG
export async function generateStaticParams() {
  return [{ page: '1' }]; // Можно расширить для пагинации
}

export default function NewsPage() {
  return (
    <main>
      <Suspense fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <NewsList />
      </Suspense>
    </main>
  );
}