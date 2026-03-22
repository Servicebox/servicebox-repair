// app/services/[slug]/layout.js
import { notFound } from 'next/navigation';

// Явно указываем, что это динамический route
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Ревалидация каждые 3600 секунд

export async function generateMetadata({ params }) {
  const { slug } = await params; // Используем await для получения params

  try {
    const decodedSlug = decodeURIComponent(slug);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/services/${encodeURIComponent(decodedSlug)}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return {
        title: 'Услуга не найдена | ServiceBox',
        description: 'Страница услуги не найдена',
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        title: 'Услуга не найдена | ServiceBox',
        description: 'Страница услуги не найдена',
      };
    }

    const service = data.data;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicebox35.ru';

    return {
      title: service.metaTitle || `${service.name} в Вологде | ServiceBox`,
      description: service.metaDescription || service.description,
      keywords: service.keywords?.join(', ') || `${service.name}, ремонт, Вологда, сервис`,
      alternates: {
        canonical: `${baseUrl}/services/${slug}`,
      },
      openGraph: {
        title: service.metaTitle || `${service.name} | ServiceBox`,
        description: service.metaDescription || service.description,
        type: 'website',
        url: `${baseUrl}/services/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Услуги по ремонту техники | ServiceBox',
      description: 'Профессиональный ремонт любой техники в Вологде',
    };
  }
}

export default function ServiceLayout({ children }) {
  return children;
}