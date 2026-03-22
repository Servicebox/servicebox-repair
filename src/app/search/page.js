// app/search/page.jsx
import { Suspense } from 'react';
import SearchResults from '@/components/Search/SearchResults';
import SearchHeader from '@/components/Search/SearchResultItem';

export const metadata = {
  title: 'Поиск по сайту ServiceBox',
  description: 'Найдите услуги, товары, новости и информацию о ремонте техники в Вологде',
  keywords: ['поиск', 'ремонт техники', 'запчасти', 'услуги', 'Вологда'],
  openGraph: {
    title: 'Поиск по сайту ServiceBox',
    description: 'Найдите нужную информацию о ремонте техники в Вологде',
    type: 'website',
  },
};

async function getSearchResults(query) {
  if (!query) return { results: [], counts: {}, query: '' };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/api/search?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } } // Кэшируем на 60 секунд
    );

    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  } catch (error) {
    console.error('Error fetching search results:', error);
    return { results: [], counts: {}, query, error: true };
  }
}

export default async function SearchPage({ searchParams }) {
  const query = (await searchParams)?.q || '';
  const { results, counts, error } = await getSearchResults(query);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <SearchHeader query={query} totalResults={results.length} />

        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <SearchResults
            results={results}
            counts={counts}
            query={query}
            error={error}
          />
        </Suspense>
      </div>
    </div>
  );
}