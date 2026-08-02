// app/services/[...slug]/page.js
import { notFound } from 'next/navigation';
import { BASE_URL } from '@/lib/constants';
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
    provider: { '@id': `${BASE_URL}#business` },
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
