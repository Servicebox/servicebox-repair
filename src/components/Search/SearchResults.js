// components/Search/SearchResults.jsx
'use client';

import Link from 'next/link';
import SearchResultItem from './SearchResultItem';

export default function SearchResults({ results, counts = {}, query, error }) {
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Ошибка при поиске</h3>
        <p className="text-gray-600">Попробуйте обновить страницу или повторить поиск позже</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">Что ищем?</h3>
        <p className="text-gray-600">Введите запрос в поисковой строке</p>
        <div className="mt-6">
          <h4 className="font-medium mb-3">Популярные запросы:</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {['Ремонт ноутбука', 'Замена экрана iPhone', 'Чистка от пыли', 'Восстановление Windows', 'Ремонт видеокарты'].map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
        <p className="text-gray-600 mb-4">По запросу "{query}" ничего не найдено</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Попробуйте:</p>
          <ul className="text-sm text-gray-600 list-disc list-inside max-w-md mx-auto">
            <li>Проверить правильность написания</li>
            <li>Использовать другие ключевые слова</li>
            <li>Упростить запрос</li>
            <li>Воспользоваться категориями в меню</li>
          </ul>
        </div>
      </div>
    );
  }

  // Группируем результаты по типам
  const groupedResults = {
    services: results.filter(r => r.type === 'service'),
    products: results.filter(r => r.type === 'product'),
    news: results.filter(r => r.type === 'news'),
    pages: results.filter(r => r.type === 'page'),
    files: results.filter(r => r.type === 'file')
  };

  return (
    <div className="mt-8">
      {/* Статистика поиска */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-medium">Найдено: {results.length} результатов</span>
          {counts.products > 0 && <span className="text-blue-600">🛒 Товары: {counts.products}</span>}
          {counts.services > 0 && <span className="text-green-600">⚙️ Услуги: {counts.services}</span>}
          {counts.news > 0 && <span className="text-purple-600">📰 Новости: {counts.news}</span>}
        </div>
      </div>

      {/* Результаты по категориям */}
      <div className="space-y-8">
        {/* Услуги */}
        {groupedResults.services.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">⚙️ Услуги ({groupedResults.services.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedResults.services.map((item, index) => (
                <SearchResultItem key={`service-${index}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Товары */}
        {groupedResults.products.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">🛒 Товары ({groupedResults.products.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedResults.products.map((item, index) => (
                <SearchResultItem key={`product-${index}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Новости */}
        {groupedResults.news.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">📰 Новости ({groupedResults.news.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedResults.news.map((item, index) => (
                <SearchResultItem key={`news-${index}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Страницы */}
        {groupedResults.pages.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">📄 Страницы ({groupedResults.pages.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedResults.pages.map((item, index) => (
                <SearchResultItem key={`page-${index}`} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Файлы */}
        {groupedResults.files.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">📁 Файлы ({groupedResults.files.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedResults.files.map((item, index) => (
                <SearchResultItem key={`file-${index}`} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Быстрые ссылки */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold mb-4">Быстрые ссылки</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/services" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            Все услуги
          </Link>
          <Link href="/parts" className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
            Каталог товаров
          </Link>
          <Link href="/news" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
            Все новости
          </Link>
          <Link href="/contacts" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Контакты
          </Link>
        </div>
      </div>
    </div>
  );
}