// components/Search/SearchHeader.jsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchHeader({ query = '', totalResults = 0 }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(query);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {query ? `Результаты поиска` : 'Поиск по сайту'}
      </h1>

      {query && (
        <p className="text-gray-900 mb-6">
          По запросу <span className="font-semibold text-blue-600">"{query}"</span> найдено {totalResults} результатов
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Что вы ищете? Например: ремонт ноутбука..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-base"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Искать
          </button>
        </div>
      </form>
    </div>
  );
}