// src/app/news/[slug]/page.js
import { notFound } from 'next/navigation';
import NewsDetailClient from './NewsDetailClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';


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
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return {
        title: 'Новость не найдена | ServiceBox',
        robots: { index: false, follow: false }
      };
    }

    const { data: news } = await response.json();

    return {
      title: news.seo?.title || `${news.title} | ServiceBox Вологда`,
      description: news.seo?.description || news.excerpt,
      keywords: news.keywords?.join(', '),
      alternates: {
        canonical: `${BASE_URL}/news/${slug}`,
      },
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
      twitter: {
        card: 'summary_large_image',
        title: news.title,
        description: news.excerpt,
        images: news.featuredImage ? [news.featuredImage] : [],
        creator: '@servicebox35',
      },
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

export async function generateStaticParams() {
  // На этапе сборки (build) не пытаемся делать fetch, чтобы избежать ECONNREFUSED
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('⏭️ Skipping static params generation for news during build');
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}/api/news?all=1&fields=slug,isPublished&limit=100`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];

    const { data } = await response.json();

    return data
      ?.filter(news => news.isPublished && news.slug)
      .map(news => ({ slug: news.slug })) || [];
  } catch (error) {
    console.error('Error generating static params for news:', error.message);
    return [];
  }
}

export default async function NewsDetailPage({ params }) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  // Базовая проверка слага (только латиница, цифры, дефисы)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    notFound();
  }

  // Рендерится на сервере — раньше контент статьи и NewsArticle JSON-LD
  // грузились в document.head через useEffect на клиенте, из-за чего боты,
  // не выполняющие JS (в первую очередь Яндекс), не видели ни h1, ни текст
  // статьи, ни структурированные данные. См. технический SEO-аудит
  // 2026-08-02 — тот же класс проблемы, что был найден и исправлен на
  // страницах услуг.
  const response = await fetch(`${BASE_URL}/api/news/slug/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    notFound();
  }

  const { data: news } = await response.json();

  const textContent = news.contentBlocks
    ?.filter(b => b.type === 'text')
    .map(b => b.content)
    .join(' ') || '';

  const toAbsoluteUrl = (url) => (url?.startsWith('http') ? url : `${BASE_URL}${url}`);
  const uploadDate = news.publishedAt || news.createdAt;

  // VideoObject для каждого видео в статье — без этого Google/Яндекс не
  // понимают, что на странице есть видео, и не показывают его в
  // видео-поиске отдельно, хотя само видео обычному посетителю видно и
  // прекрасно проигрывается. См. технический SEO-аудит 2026-08-02.
  const videoObjects = (news.contentBlocks || [])
    .map((block) => {
      if (block.type === 'video' && block.media) {
        return {
          '@type': 'VideoObject',
          name: block.description || news.title,
          description: block.description || news.excerpt || news.title,
          thumbnailUrl: toAbsoluteUrl(block.thumbnail || news.featuredImage),
          uploadDate,
          contentUrl: toAbsoluteUrl(block.media),
        };
      }
      if (block.type === 'youtube' && block.videoUrl) {
        return {
          '@type': 'VideoObject',
          name: block.description || news.title,
          description: block.description || news.excerpt || news.title,
          thumbnailUrl: `https://img.youtube.com/vi/${block.videoUrl}/hqdefault.jpg`,
          uploadDate,
          embedUrl: `https://www.youtube.com/embed/${block.videoUrl}`,
        };
      }
      return null;
    })
    .filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.excerpt,
    image: news.featuredImage ? [news.featuredImage] : undefined,
    datePublished: uploadDate,
    dateModified: news.updatedAt,
    author: { '@type': 'Organization', name: news.author || 'ServiceBox', url: BASE_URL },
    publisher: { '@id': `${BASE_URL}#business` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/news/${slug}` },
    articleBody: textContent.substring(0, 5000),
    wordCount: textContent.split(/\s+/).filter(Boolean).length,
    inLanguage: 'ru-RU',
    ...(videoObjects.length > 0 ? { video: videoObjects } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsDetailClient news={news} />
    </>
  );
}
