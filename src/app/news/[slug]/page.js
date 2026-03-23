// src/app/news/[slug]/page.js
import { notFound } from 'next/navigation';
import NewsDetail from '@/components/NewsDetail/NewsDetail';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';

// ✅ Генерация метаданных для поисковиков
export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    return {
      title: 'Новость не найдена | ServiceBox',
      robots: { index: false, follow: false }
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/news/slug/${slug}`, {
      next: { revalidate: 3600 } // Кэш на 1 час
    });

    if (!response.ok) {
      return {
        title: 'Новость не найдена | ServiceBox',
        robots: { index: false, follow: false }
      };
    }

    const { data: news } = await response.json();

    return {
      // === Основные мета-теги ===
      title: news.seo?.title || `${news.title} | ServiceBox Вологда`,
      description: news.seo?.description || news.excerpt,
      keywords: news.keywords?.join(', '),

      // === Canonical URL ===
      alternates: {
        canonical: `${BASE_URL}/news/${slug}`,
      },

      // === Open Graph для соцсетей ===
      openGraph: {
        title: news.title,
        description: news.excerpt,
        url: `${BASE_URL}/news/${slug}`,
        siteName: 'ServiceBox',
        images: news.featuredImage
          ? [{ url: news.featuredImage, width: 1200, height: 630, alt: news.title }]
          : [],
        locale: 'ru_RU',
        type: 'article',
        publishedTime: news.publishedAt || news.createdAt,
        modifiedTime: news.updatedAt,
        authors: [news.author || 'ServiceBox'],
        tags: news.keywords,
      },

      // === Twitter Card ===
      twitter: {
        card: 'summary_large_image',
        title: news.title,
        description: news.excerpt,
        images: news.featuredImage ? [news.featuredImage] : [],
        creator: '@servicebox35',
      },

      // === Robots ===
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Ошибка загрузки | ServiceBox',
      robots: { index: false, follow: false }
    };
  }
}

// ✅ Генерация статических путей для предварительного рендеринга (SSG)
export async function generateStaticParams() {
  try {
    const response = await fetch(`${BASE_URL}/api/news?all=1&fields=slug,isPublished&limit=100`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];

    const { data } = await response.json();

    // Генерируем пути только для опубликованных новостей с слагом
    return data
      ?.filter(news => news.isPublished && news.slug)
      .map(news => ({ slug: news.slug })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// ✅ Серверный компонент — контент рендерится на сервере для поисковиков
export default async function NewsDetailPage({ params }) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  // Проверка валидности слага (базовая)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    notFound();
  }

  // Передаём slug в клиентский компонент для загрузки контента
  return <NewsDetail newsSlug={slug} />;
}