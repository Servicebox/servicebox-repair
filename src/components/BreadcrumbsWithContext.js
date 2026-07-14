// components/BreadcrumbsWithContext.js
'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BreadcrumbContext } from '@/components/contexts/BreadcrumbContext';

export default function BreadcrumbsWithContext() {
  const pathname = usePathname();
  const { breadcrumbs, currentPageTitle } = useContext(BreadcrumbContext);

  // Не показываем на главной странице
  if (pathname === '/') return null;

  // Если есть кастомные хлебные крошки из контекста
  if (breadcrumbs.length > 0) {
    return (
      <nav className="bg-surface border-b border-border" aria-label="Хлебные крошки товара">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <ol className="flex items-center space-x-2 overflow-x-auto">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                
                return (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <span className="mx-2 text-muted">/</span>
                    )}
                    
                    {isLast ? (
                      <span 
                        className="text-text font-medium truncate max-w-[200px]"
                        aria-current="page"
                      >
                        {crumb.name}
                      </span>
                    ) : (
                      <Link 
                        href={crumb.url} 
                        className="text-muted hover:text-primary transition-colors truncate max-w-[150px]"
                      >
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </nav>
    );
  }

  // Автоматическая генерация хлебных крошек по пути
  const generateAutoBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    
    const autoBreadcrumbs = [];
    let currentPath = '';
    
    // Главная страница всегда первая
    autoBreadcrumbs.push({
      name: 'Главная',
      url: '/'
    });
    
    // Обрабатываем остальные сегменты
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Пропускаем технические сегменты
      if (segment === 'api' || segment === 'admin') {
        return;
      }
      
      let name = '';
      
      // Преобразуем slug в читаемое название
      if (segment.includes('-') || segment.includes('%')) {
        name = decodeURIComponent(segment)
          .split('-')
          .map(word => {
            // Сохраняем аббревиатуры и модели
            if (/^[A-Z0-9]+$/i.test(word) && word.length <= 5) {
              return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(' ');
      } else {
        name = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      // Специальные преобразования
      if (segment === 'services') {
        name = 'Услуги';
      } else if (segment === 'product') {
        name = 'Товар';
      } else if (segment === 'category') {
        name = 'Категория';
      } else if (segment === 'cart') {
        name = 'Корзина';
      } else if (segment === 'checkout') {
        name = 'Оформление заказа';
      } else if (segment === 'profile') {
        name = 'Профиль';
      } else if (segment === 'news') {
        name = 'Новости';
      } else if (segment === 'gallery') {
        name = 'Галерея';
      } else if (segment === 'contacts') {
        name = 'Контакты';
      } else if (segment === 'about') {
        name = 'О нас';
      } else if (segment === 'parts') {
        name = 'Запчасти';
      } else if (segment === 'prices') {
        name = 'Цены';
      } else if (segment === 'tracking') {
        name = 'Отслеживание';
      }
      
      autoBreadcrumbs.push({
        name: isLast && currentPageTitle ? currentPageTitle : name,
        url: isLast ? '#' : currentPath
      });
    });
    
    return autoBreadcrumbs;
  };

  const autoBreadcrumbs = generateAutoBreadcrumbs();

  if (autoBreadcrumbs.length <= 1) return null;

  return (
    <nav className="bg-surface border-b border-border" aria-label="Хлебные крошки тов">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <ol className="flex items-center space-x-2 overflow-x-auto">
            {autoBreadcrumbs.map((crumb, index) => {
              const isLast = index === autoBreadcrumbs.length - 1;
              
              return (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <span className="mx-2 text-muted">/</span>
                  )}
                  
                  {isLast || crumb.url === '#' ? (
                    <span 
                      className="text-text font-medium truncate max-w-[200px]"
                      aria-current="page"
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <Link 
                      href={crumb.url} 
                      className="text-muted hover:text-primary transition-colors truncate max-w-[150px]"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}