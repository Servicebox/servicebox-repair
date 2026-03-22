// components/Search/SearchResultItem.jsx
'use client';

import Link from 'next/link';

export default function SearchResultItem({ item }) {
  // Проверка на undefined/null
  if (!item || !item.url) {
    console.warn('SearchResultItem received invalid item:', item);
    return (
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
        <div className="text-gray-500 text-sm">Некорректный результат</div>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'product': return '🛒';
      case 'service': return '⚙️';
      case 'news': return '📰';
      case 'file': return '📁';
      default: return '📄';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'product': return 'Товар';
      case 'service': return 'Услуга';
      case 'news': return 'Новость';
      case 'file': return 'Файл';
      default: return 'Страница';
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Цена по запросу';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Link 
      href={item.url} 
      className="block p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getTypeIcon(item.type)}</div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 line-clamp-2">
              {item.title || 'Без названия'}
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
              {getTypeLabel(item.type)}
            </span>
          </div>
          
          {item.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {item.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
            {item.price && (
              <span className="font-medium text-green-600">
                {formatPrice(item.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}