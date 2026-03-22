// components/ProductBreadcrumbs/ProductBreadcrumbs.jsx
'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";
import styles from './ProductBreadcrumbs.module.css';

export default function ProductBreadcrumbs({ product }) {
  if (!product) return null;

  const breadcrumbs = [
    {
      href: '/',
      label: 'Главная',
      isCurrent: false
    },
    {
      href: '/parts',
      label: 'Каталог запчастей',
      isCurrent: false
    }
    
  ];

  // Добавляем категорию, если есть
  if (product.category) {
    breadcrumbs.push({
      href: `/parts?category=${encodeURIComponent(product.category)}`,
      label: product.category,
      isCurrent: false
    });
  }

  // Добавляем подкатегорию, если есть
  if (product.subcategory) {
    breadcrumbs.push({
      href: `/parts?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`,
      label: product.subcategory,
      isCurrent: false
    });
  }

  // Добавляем сам товар
  breadcrumbs.push({
    href: `/product/${product.slug}`,
    label: product.name,
    isCurrent: true
  });

  return (
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки товара">
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