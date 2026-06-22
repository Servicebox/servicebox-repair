// app/services/[slug]/layout.js
import { BASE_URL, BUSINESS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const decodedSlug = decodeURIComponent(slug);

    const response = await fetch(
      `${BASE_URL}/api/services/${encodeURIComponent(decodedSlug)}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return { title: 'Услуга не найдена | ServiceBox', description: 'Страница услуги не найдена' };
    }

    const data = await response.json();
    if (!data.success) {
      return { title: 'Услуга не найдена | ServiceBox', description: 'Страница услуги не найдена' };
    }

    const service = data.data;
    const pageUrl = `${BASE_URL}/services/${slug}`;
    const title = service.metaTitle || `${service.name} в Вологде | ServiceBox`;
    const description = service.metaDescription || service.description;

    return {
      title,
      description,
      keywords: service.keywords?.join(', ') || `${service.name}, ремонт, Вологда, сервис`,
      alternates: { canonical: pageUrl },
      openGraph: {
        title,
        description,
        type: 'website',
        url: pageUrl,
        siteName: BUSINESS.shortName,
        locale: 'ru_RU',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.jpg'],
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: 'Услуги по ремонту техники | ServiceBox',
      description: 'Профессиональный ремонт любой техники в Вологде',
    };
  }
}

export default function ServiceLayout({ children }) {
  return children;
}