// src/app/platy/page.js
import BoardPhotoGrid from '@/components/BoardPhotos/BoardPhotoGrid';
import { BASE_URL } from '@/lib/constants';
import dbConnect from '@/lib/db';
import BoardPhoto from '@/models/BoardPhoto';
import styles from './platy.module.css';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata = {
  title: 'Фото плат с замерами — видеокарты, ноутбуки, телефоны | СЕРВИС БОКС',
  description:
    'Фотографии плат с нанесёнными точками замера сопротивления: видеокарты, материнские платы ноутбуков, телефоны. Справочник сервисного центра СЕРВИС БОКС в Вологде.',
  alternates: { canonical: `${BASE_URL}/platy` },
  keywords: 'фото плат, замеры сопротивления, распиновка платы, ремонт видеокарт, ремонт материнских плат, СЕРВИС БОКС Вологда',
  openGraph: {
    title: 'Фото плат с замерами | СЕРВИС БОКС',
    description: 'Справочник фотографий плат с точками замера — видеокарты, ноутбуки, телефоны.',
    url: `${BASE_URL}/platy`,
    siteName: 'СЕРВИС БОКС Вологда',
    locale: 'ru_RU',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${BASE_URL}/platy`,
  url: `${BASE_URL}/platy`,
  name: 'Фото плат с замерами',
  description: 'Фотографии плат с точками замера сопротивления.',
  about: { '@id': `${BASE_URL}#business` },
  isPartOf: { '@id': `${BASE_URL}#website` },
};

export default async function PlatyPage() {
  // Список формируется на сервере: RSC читает БД напрямую, поэтому
  // revalidatePath('/platy') в админ-роутах реально пересобирает эту страницу.
  await dbConnect();
  const initial = await BoardPhoto.find(
    { isActive: true },
    'slug title deviceType chip imageWidth imageHeight'
  ).sort({ createdAt: -1 }).lean();
  const initialItems = initial.map(d => ({ ...d, _id: d._id.toString() }));

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className={styles.header}>
        <h1 className={styles.title}>Фото плат с замерами</h1>
        <p className={styles.subtitle}>
          Снимки плат с нанесёнными точками замера сопротивления — видеокарты, материнские
          платы ноутбуков, телефоны. Пополняется мастерами СЕРВИС БОКС.
        </p>
      </header>
      <BoardPhotoGrid initialItems={initialItems} />
    </main>
  );
}
