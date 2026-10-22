// app/services/[...slug]/page.js
import { notFound } from 'next/navigation';
import { BASE_URL, BUSINESS } from '@/lib/constants';
import ServiceDetailClient from './ServiceDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

async function getService(slug) {
  const decodedSlug = decodeURIComponent(slug);

  const response = await fetch(
    `${BASE_URL}/api/services/${encodeURIComponent(decodedSlug)}?breadcrumbs=true`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.success) return null;

  return data.data;
}

function extractPrice(price) {
  if (!price || price === 'Уточняйте') return '0';
  const match = price.match(/\d+/g);
  return match ? match.join('') : '0';
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  // Рендерится на сервере — раньше JSON-LD добавлялся в document.head через
  // useEffect на клиенте, из-за чего боты, не выполняющие JS (в первую очередь
  // Яндекс), не видели ни структурированные данные, ни сам контент страницы.
  // См. технический SEO-аудит 2026-08-02.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.h1 || service.name,
    description: service.description,
    // provider раньше был только { '@id': ... } — ссылка на LocalBusiness
    // из ОТДЕЛЬНОГО <script type="application/ld+json"> в layout.js. @id
    // резолвится только внутри одного JSON-LD документа/@graph; отдельные
    // script-теги на странице парсятся независимо почти везде (Яндекс
    // в том числе), так что для любого потребителя, который не объединяет
    // несколько script-блоков сам, provider выглядел как пустая ссылка без
    // telephone/address. Это и давало предупреждения Яндекс.Вебмастера:
    // «поле address отсутствует или пусто», «необходимо указать telephone»
    // для структурированных сниппетов Справочника (2026-10-23). Теперь
    // provider самодостаточен: @id оставлен для потребителей, которые всё
    // же объединяют граф, плюс продублированы сами поля.
    provider: {
      '@type': ['LocalBusiness', 'ElectronicsStore'],
      '@id': `${BASE_URL}#business`,
      // BUSINESS.name (не shortName) — тот же @id используется в
      // LOCAL_BUSINESS_SCHEMA (src/lib/seo-helpers.js) с этим именем;
      // разные literal name на одном @id — сигнал конфликта сущностей
      // для потребителей, которые объединяют граф (независимый аудит,
      // 2026-10-23).
      name: BUSINESS.name,
      telephone: BUSINESS.phones.primary,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.mainAddress.street,
        addressLocality: BUSINESS.mainAddress.city,
        addressRegion: BUSINESS.mainAddress.region,
        postalCode: BUSINESS.mainAddress.postalCode,
        addressCountry: BUSINESS.mainAddress.country,
      },
    },
    areaServed: { '@type': 'City', name: 'Вологда' },
    offers: {
      '@type': 'Offer',
      price: extractPrice(service.price),
      priceCurrency: 'RUB',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailClient service={service} />
    </>
  );
}
