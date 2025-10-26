'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './BreadCrum.module.css';
import arrow_icon from "../../../public/images/Down.svg";

const getCategoryUrl = (category) => {
  switch (category) {
    case 'для СЦ':
      return '/parts';
    case 'electronic':
      return '/electronics';
    case 'usedsparepart':
      return '/usedspareparts';
    default:
      return '/parts';
  }
};

const BreadCrum = (props) => {
  const { product } = props;

  // Проверка на наличие продукта, его категории и имени
  if (!product || !product.category || !product.name) {
    return <div>Загрузка информации...</div>;
  }

  return (
    <div className={styles.breadcrum}>
      <Link href="/" className={styles.breadcrumLink}>Домашняя</Link>
      <Image 
        className={styles.breadcrumImg} 
        src={arrow_icon} 
        alt="стрелочка" 
        width={5}
        height={10}
      />
      <Link href="/parts" className={styles.breadcrumLink}>Каталог</Link>
      <Image 
        className={styles.breadcrumImg} 
        src={arrow_icon} 
        alt="стрелочка" 
        width={5}
        height={10}
      />
      <Link href={getCategoryUrl(product.category)} className={styles.breadcrumLink}>
        {product.category}
      </Link>
      <Image 
        className={styles.breadcrumImg} 
        src={arrow_icon} 
        alt="стрелочка" 
        width={5}
        height={10}
      />
      <span className={styles.currentPage}>{product.name}</span>
    </div>
  );
}

export default BreadCrum;