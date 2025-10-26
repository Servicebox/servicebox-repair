'use client';

import { useParams } from 'next/navigation';
import Product from '../../../components/Product/Product';

export default function ProductPage() {
  const params = useParams();
  const productSlug = params.productSlug;

  return <Product productSlug={productSlug} />;
}