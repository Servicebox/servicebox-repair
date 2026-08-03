// src/app/parts/[...categoryPath]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BASE_URL, BUSINESS } from '@/lib/constants';
import { resolveCategoryPath } from '@/lib/parts/resolveCategoryPath';
import { queryProducts } from '@/lib/parts/queryProducts';
import { getCategoryTree } from '@/lib/parts/getCategoryTree';
import ProductGrid from '../ProductGrid';
import Pagination from '../Pagination';
import PartsFilters from '../PartsFilters';
import CategoryTree from '../CategoryTree';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { categoryPath } = await params;
  const resolved = await resolveCategoryPath(categoryPath);
  if (!resolved) return { title: 'Категория не найдена | ServiceBox' };

  const title = `${resolved.category.name} — купить в Вологде | ServiceBox`;
  const description =
    resolved.category.description ||
    `${resolved.category.name}: каталог с ценами в сервисном центре ServiceBox, Вологда.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/parts/${resolved.category.slug}` },
    openGraph: { title, description, type: 'website', siteName: BUSINESS.shortName },
  };
}

export default async function PartsCategoryPage({ params, searchParams }) {
  const { categoryPath } = await params;
  const sp = await searchParams;

  const resolved = await resolveCategoryPath(categoryPath);
  if (!resolved) notFound();

  const { category, breadcrumbs } = resolved;

  const result = await queryProducts({
    categoryId: category._id,
    search: sp.q,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: sp.sort,
    page: sp.page,
  });

  const tree = await getCategoryTree();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav
        className="text-sm text-muted mb-4 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Хлебные крошки"
      >
        <Link href="/parts" className="hover:text-primary shrink-0">Каталог</Link>
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={crumb.slug} className="shrink-0">
              <span className="mx-1.5 text-muted/60">/</span>
              {isLast ? (
                <span className="text-text font-medium">{crumb.name}</span>
              ) : (
                <Link href={`/parts/${crumb.slug}`} className="hover:text-primary">{crumb.name}</Link>
              )}
            </span>
          );
        })}
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">{category.name}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <CategoryTree tree={tree} activeCategoryId={String(category._id)} />

        <div className="flex-1 min-w-0">
          <PartsFilters
            basePath={`/parts/${category.slug}`}
            initialSort={sp.sort}
            initialMinPrice={sp.minPrice}
            initialMaxPrice={sp.maxPrice}
            initialSearch={sp.q}
          />

          <p className="text-sm text-muted mb-4">Найдено товаров: {result.total}</p>

          <ProductGrid items={result.items} />

          <Pagination
            page={result.page}
            pages={result.pages}
            basePath={`/parts/${category.slug}`}
            searchParams={sp}
          />
        </div>
      </div>
    </div>
  );
}
