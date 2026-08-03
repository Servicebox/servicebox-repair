import Link from 'next/link';

function buildPageUrl(basePath, searchParams, page) {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default function Pagination({ page, pages, basePath, searchParams }) {
  if (pages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pages;

  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-3 mt-8" aria-label="Страницы">
      <Link
        href={buildPageUrl(basePath, searchParams, page - 1)}
        aria-disabled={prevDisabled}
        className={`px-3 py-2 rounded-lg border text-sm ${prevDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-surface'}`}
      >
        ← Назад
      </Link>
      <span className="text-sm text-muted whitespace-nowrap">
        {page} из {pages}
      </span>
      <Link
        href={buildPageUrl(basePath, searchParams, page + 1)}
        aria-disabled={nextDisabled}
        className={`px-3 py-2 rounded-lg border text-sm ${nextDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-surface'}`}
      >
        Далее →
      </Link>
    </nav>
  );
}
