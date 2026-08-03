'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PartsFilters({ basePath, initialSort, initialMinPrice, initialMaxPrice, initialSearch }) {
  const router = useRouter();
  const [sort, setSort] = useState(initialSort || 'default');
  const [minPrice, setMinPrice] = useState(initialMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || '');
  const [search, setSearch] = useState(initialSearch || '');
  const [open, setOpen] = useState(false);

  const apply = (overrides = {}) => {
    const values = {
      sort,
      minPrice,
      maxPrice,
      q: search,
      ...overrides,
    };
    const params = new URLSearchParams();
    if (values.sort && values.sort !== 'default') params.set('sort', values.sort);
    if (values.minPrice) params.set('minPrice', values.minPrice);
    if (values.maxPrice) params.set('maxPrice', values.maxPrice);
    if (values.q) params.set('q', values.q);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="sm:hidden w-full mb-3 px-4 py-2 border rounded-lg text-sm font-medium flex items-center justify-between"
      >
        Фильтры {open ? '▲' : '▼'}
      </button>

      <div className={`${open ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center`}>
        <form
          onSubmit={(e) => { e.preventDefault(); apply(); }}
          className="flex-1 min-w-[180px]"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию…"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </form>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); apply({ sort: e.target.value }); }}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="default">По умолчанию</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Цена от"
            className="w-24 px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="до"
            className="w-24 px-3 py-2 border rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={() => apply()}
            className="px-3 py-2 bg-primary text-white rounded-lg text-sm whitespace-nowrap"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
