import { BASE_URL } from '@/lib/constants';
import GalleryClient from './GalleryClient';

export const dynamic = 'force-dynamic';

async function getGroups() {
  const response = await fetch(`${BASE_URL}/api/gallery`, { cache: 'no-store' });
  if (!response.ok) return [];

  const data = await response.json();
  if (!data.success) return [];

  const groupsMap = {};
  data.images.forEach((image) => {
    const groupId = image.groupId || 'default';
    if (!groupsMap[groupId]) {
      groupsMap[groupId] = {
        id: groupId,
        description: image.description || 'Без описания',
        images: [],
        uploadedAt: image.uploadedAt,
      };
    }
    groupsMap[groupId].images.push(image);
  });

  return Object.values(groupsMap).sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
}

export default async function GalleryPage() {
  const groups = await getGroups();

  // Раньше вся страница была клиентским компонентом: фото рендерились через
  // CSS background-image (Google/Яндекс Картинки такие фото практически не
  // индексируют), а полноразмерное фото появлялось только внутри модалки,
  // открываемой по клику через JS — боту без выполнения JS фотографии
  // не были видны вообще. Теперь превью — настоящие <img> с alt, а полный
  // список фото продублирован в структурированных данных ImageObject.
  // См. технический SEO-аудит 2026-08-02.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Фотогалерея работ ServiceBox',
    description: 'Фотографии выполненных ремонтов и работ сервисного центра ServiceBox в Вологде.',
    url: `${BASE_URL}/gallery`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: groups.flatMap((group) =>
        group.images.map((image, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'ImageObject',
            contentUrl: image.filePath?.startsWith('http') ? image.filePath : `${BASE_URL}${image.filePath}`,
            name: group.description || 'Фото из галереи ServiceBox',
            description: group.description || 'Фото из галереи ServiceBox',
            uploadDate: image.uploadedAt,
          },
        }))
      ),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GalleryClient groups={groups} />
    </>
  );
}
