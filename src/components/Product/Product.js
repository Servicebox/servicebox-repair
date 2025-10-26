'use client';

import { useContext } from 'react';
import { useParams } from 'next/navigation';
import ShopContext from '../ShopContext/ShopContext';
import Breadcrum from '../BreadCrum/BreadCrum';
import ProductDisplay from '../ProductDisplay/ProductDisplay';
import styles from './Product.module.css';

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const params = useParams();
  const productSlug = params.productSlug;

  const product = all_product.find((e) => e.slug === String(productSlug));

  if (!product) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.product}>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
    </div>
  );
};

export default Product;