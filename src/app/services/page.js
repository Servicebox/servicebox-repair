// app/services/page.js
'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';

// Иконки для категорий
const categoryIcons = {
  'Ремонт ноутбуков': '/images/notebook.webp',
  'Ремонт телефонов': '/images/android.webp',
  'Ремонт компьютеров': '/images/monoblok.webp',
  'Техника Apple': '/images/apple.webp',
  'Ремонт планшетов': '/images/tablet.webp',
  'Ремонт телевизоров': '/images/tv.webp',
  'Замена стекла': '/images/glass.webp',
  'Ремонт видеокарт': '/images/videocard.webp',
  'Другие услуги': '/images/Devices.webp'
};

const defaultIcon = '/images/Devices.webp';

export default function ServicesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services?tree=true');
      const data = await response.json();
      
      if (data.success) {
        // Фильтруем только корневые категории (без родителя)
        const rootCategories = data.data.filter(service => 
          service.isCategory && !service.parent
        );
        setCategories(rootCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (categoryName) => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return defaultIcon;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Загружаем категории услуг...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Услуги по ремонту техники
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Профессиональный ремонт любой техники с гарантией качества
          </p>
        </div>

        {/* Сетка категорий */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Категории не найдены</h3>
            <p className="text-gray-600 mb-6">Попробуйте изменить поисковый запрос</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Очистить поиск
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => (
              <Link
                key={category._id}
                href={`/services/${encodeURIComponent(category.slug)}`}
                className="group block bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl hover:border-blue-300 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20  rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={getIconForCategory(category.name)}
                      alt={category.name}
                      width={48}
                      height={48}
                      priority
                      className="object-contain"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between w-full mt-auto">
                    <span className="text-sm text-gray-500">
                      {category.children?.length || 0} услуг
                    </span>
                    <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                      Подробнее →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* SEO блок */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Профессиональный ремонт техники в Вологде
          </h2>
          <p className="text-gray-700 mb-4">
            Сервисный центр Сервис Бокс предоставляет полный спектр услуг по ремонту и обслуживанию 
            цифровой техники. Наши специалисты имеют многолетний опыт работы с устройствами различных 
            производителей и моделей.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Оригинальные запчасти</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Гарантия до 12 месяцев</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Бесплатная диагностика</span>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}