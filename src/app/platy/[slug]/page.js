// src/app/platy/[slug]/page.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';
import { BASE_URL } from '@/lib/constants';
import { createBreadcrumbList } from '@/lib/seo-helpers';
import { deviceTypeLabel, deviceTypeServiceUrl, boardPhotoDescription } from '@/lib/boardPhotos';
import styles from './boardPhoto.module.css';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400;

async function getDoc(slug) {
  await dbConnect();
  return BoardPhoto.findOne(
    { slug, isActive: true },
    'slug title deviceType chip description imageWidth imageHeight createdAt'
  ).lean();
}

export async function generateStaticParams() {
  await dbConnect();
  const docs = await BoardPhoto.find({ isActive: true }, 'slug').lean();
  return docs.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getDoc(slug);
  if (!doc) return { title: 'Плата не найдена' };
  const desc = boardPhotoDescription(doc);
  const imageUrl = `${BASE_URL}/api/board-photos/${slug}/image`;
  return {
    title: `${doc.title} — фото платы с замерами | СЕРВИС БОКС`,
    description: desc,
    alternates: { canonical: `${BASE_URL}/platy/${slug}` },
    keywords: `${doc.title}, ${doc.chip}, замеры платы, сопротивление, распиновка, ремонт ${deviceTypeLabel(doc.deviceType).toLowerCase()} Вологда, СЕРВИС БОКС`,
    openGraph: {
      title: `${doc.title} — фото платы с замерами`,
      description: desc,
      url: `${BASE_URL}/platy/${slug}`,
      siteName: 'СЕРВИС БОКС Вологда',
      locale: 'ru_RU',
      type: 'article',
      images: [{ url: imageUrl, width: doc.imageWidth, height: doc.imageHeight, alt: doc.title }],
    },
    twitter: { card: 'summary_large_image', title: doc.title, description: desc, images: [imageUrl] },
  };
}

export default async function BoardPhotoPage({ params }) {
  const { slug } = await params;
  const doc = await getDoc(slug);
  if (!doc) notFound();

  const imageUrl = `${BASE_URL}/api/board-photos/${slug}/image`;
  const desc = boardPhotoDescription(doc);
  const typeLabel = deviceTypeLabel(doc.deviceType);
  const serviceUrl = deviceTypeServiceUrl(doc.deviceType);
  const dateStr = new Date(doc.createdAt).toLocaleDateString('ru-RU');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ImageObject',
        contentUrl: imageUrl,
        url: `${BASE_URL}/platy/${slug}`,
        width: doc.imageWidth,
        height: doc.imageHeight,
        caption: doc.title,
        name: `${doc.title} — фото платы с замерами`,
        description: desc,
        creator: { '@id': `${BASE_URL}#business` },
        copyrightHolder: { '@id': `${BASE_URL}#business` },
        representativeOfPage: true,
        datePublished: new Date(doc.createdAt).toISOString(),
      },
      createBreadcrumbList([
        { name: 'Главная', url: BASE_URL },
        { name: 'Депозитарий', url: `${BASE_URL}/depository-public` },
        { name: 'Платы', url: `${BASE_URL}/platy` },
        { name: doc.title, url: `${BASE_URL}/platy/${slug}` },
      ]),
    ],
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className={styles.crumbs} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link> ·{' '}
        <Link href="/depository-public">Депозитарий</Link> ·{' '}
        <Link href="/platy">Платы</Link> · <span>{doc.title}</span>
      </nav>

      <h1 className={styles.title}>{doc.title}</h1>

      <div className={styles.meta}>
        <span className={styles.badge}>{typeLabel}</span>
        {doc.chip && <span className={styles.chip}>Чип: {doc.chip}</span>}
        <span className={styles.date}>{dateStr}</span>
      </div>

      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className={styles.photoWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          width={doc.imageWidth}
          height={doc.imageHeight}
          alt={`${doc.title} — фото платы с точками замера`}
          className={styles.photo}
          fetchPriority="high"
        />
      </a>

      {doc.description && <p className={styles.description}>{doc.description}</p>}

      <div className={styles.cta}>
        <p>Нужен ремонт этой платы? Бесплатная диагностика, замеры под микроскопом.</p>
        <Link href={serviceUrl} className={styles.ctaBtn}>Ремонт {typeLabel.toLowerCase()} в Вологде →</Link>
      </div>
    </main>
  );
}
