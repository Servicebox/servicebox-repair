// components/Breadcrumbs.js
'use client';

import { usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";
import styles from './Breadcrumbs.module.css';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const params = useParams();
  const [serviceName, setServiceName] = useState(null);
  const [loading, setLoading] = useState(false);

  // Не показываем на главной странице
  if (pathname === '/') return null;

  // Если мы на странице услуги, получаем её название
  useEffect(() => {
    if (pathname.startsWith('/services/') && params?.slug) {
      fetchServiceName();
    }
  }, [pathname, params]);

  const fetchServiceName = async () => {
    try {
      setLoading(true);
      const slug = Array.isArray(params.slug) ? params.slug[params.slug.length - 1] : params.slug;
      const response = await fetch(`/api/services/${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (data.success) {
        setServiceName(data.data.name);
      }
    } catch (error) {
      console.error('Error fetching service name:', error);
    } finally {
      setLoading(false);
    }
  };

  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  const breadcrumbs = [
    {
      href: '/',
      label: 'Главная',
      isCurrent: false
    }
  ];

  // Сопоставление путей с читаемыми названиями
  const pathLabels = {
    'about': 'О нас',
    'services': 'Услуги и цены',
    'parts': 'Каталог запчастей',
    'gallery': 'Фото работ',
    'news': 'Новости',
    'promotions-page': 'Акции',
    'depository-public': 'Схемы и BIOS',
    'contacts': 'Контакты',
    'tracking': 'Отслеживание записи',
    'profile': 'Личный кабинет',
    'admin-panel': 'Админ-панель',
    'cart': 'Корзина',
    'checkout': 'Оформление заказа',
    'image-gallery-api': 'Галерея',
    'chat-with-gpt': 'Чат с AI'
  };

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Для страницы услуги используем название из API
    if (pathname.startsWith('/services/') && isLast && serviceName) {
      breadcrumbs.push({
        href: currentPath,
        label: serviceName,
        isCurrent: true
      });
      return;
    }

    // Для других страниц используем стандартные названия
    let label;

    if (pathLabels[segment]) {
      label = pathLabels[segment];
    } else if (segment === 'services' && pathSegments.length > 1) {
      // Если это вложенная страница услуги, оставляем "Услуги" как ссылку
      label = 'Услуги';
    } else {
      // Преобразуем slug в читаемое название
      label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    breadcrumbs.push({
      href: currentPath,
      label: label,
      isCurrent: isLast && !pathname.startsWith('/services/') // Для услуг isCurrent уже установлен выше
    });
  });

  // Если мы на странице услуги и загружаем данные, показываем плейсхолдер
  if (loading && pathname.startsWith('/services/')) {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    lastCrumb.label = 'Загрузка...';
    lastCrumb.isCurrent = true;
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки у кошки">
      <ol className={styles.breadcrumbsList}>
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            {index > 0 && (
              <span className={styles.separator}>
                <FontAwesomeIcon icon={faChevronRight} />
              </span>
            )}

            {crumb.isCurrent ? (
              <span
                className={styles.currentPage}
                aria-current="page"
              >
                {index === 0 && <FontAwesomeIcon icon={faHome} />}
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className={styles.breadcrumbLink}>
                {index === 0 && <FontAwesomeIcon icon={faHome} />}
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}