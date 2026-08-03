// src/app/parts/page.js
import Link from 'next/link';
import { BASE_URL, BUSINESS } from '@/lib/constants';
import { getCategoryTree } from '@/lib/parts/getCategoryTree';
import { queryProducts } from '@/lib/parts/queryProducts';
import ProductGrid from './ProductGrid';
import Pagination from './Pagination';
import PartsFilters from './PartsFilters';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Каталог запчастей для техники в Вологде | ServiceBox35',
  description: 'Каталог оригинальных и совместимых запчастей для ноутбуков, телефонов, планшетов, видеокарт и приставок. Наличие и цены в сервисном центре ServiceBox35, Вологда.',
  alternates: { canonical: `${BASE_URL}/parts` },
  openGraph: {
    title: 'Каталог запчастей — ServiceBox35',
    description: 'Оригинальные и совместимые запчасти для ремонта техники в наличии в Вологде.',
    type: 'website',
    siteName: BUSINESS.shortName,
  },
};

export default async function PartsRootPage({ searchParams }) {
  const sp = await searchParams;
  const tree = await getCategoryTree();

  const isSearching = Boolean(sp.q || sp.minPrice || sp.maxPrice || sp.sort);
  const result = isSearching
    ? await queryProducts({
        search: sp.q,
        minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
        maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
        sort: sp.sort,
        page: sp.page,
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Каталог запчастей</h1>
      <p className="text-muted mb-6">Выберите категорию или воспользуйтесь поиском</p>

      <PartsFilters
        basePath="/parts"
        initialSort={sp.sort}
        initialMinPrice={sp.minPrice}
        initialMaxPrice={sp.maxPrice}
        initialSearch={sp.q}
      />

      {isSearching ? (
        <>
          <p className="text-sm text-muted mb-4">Найдено товаров: {result.total}</p>
          <ProductGrid items={result.items} />
          <Pagination page={result.page} pages={result.pages} basePath="/parts" searchParams={sp} />
        </>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tree.map((category) => (
            <Link
              key={category._id}
              href={`/parts/${category.slug}`}
              className="block p-4 border rounded-xl hover:border-primary hover:shadow-md transition-all text-center"
            >
              <div className="font-medium">{category.name}</div>
              {category.children.length > 0 && (
                <div className="text-xs text-muted mt-1">{category.children.length} подкатегорий</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
