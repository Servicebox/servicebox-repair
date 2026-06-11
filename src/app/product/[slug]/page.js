// app/product/[slug]/page.js

import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ClientProductDisplay from '@/components/ProductDisplay/ProductDisplay';

// ============================================
// ⚙️ НАСТРОЙКИ КЭШИРОВАНИЯ И СТАТИЗАЦИИ
// ============================================
export const dynamic = 'force-static';
export const revalidate = 3600; // ISR: перегенерация раз в час (цены, остатки)
export const fetchCache = 'force-cache';
export const dynamicParams = true; // Разрешить рендеринг новых товаров, не попавших в generateStaticParams

// ============================================
// 🗺️ ГЕНЕРАЦИЯ СТАТИЧЕСКИХ ПУТЕЙ (на этапе build)
// ============================================
export async function generateStaticParams() {
  try {
    await dbConnect();
    const products = await Product.find(
      { isActive: true, isDeleted: false },
      { slug: 1 }
    )
      .limit(500)
      .lean();

    return products
      .filter(p => p.slug && typeof p.slug === 'string')
      .map(p => ({ slug: p.slug }));
  } catch (error) {
    console.error('❌ [generateStaticParams] Error:', error.message);
    return [];
  }
}

// ============================================
// 🏷️ МЕТАДАННЫЕ СТРАНИЦЫ
// ============================================
export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Валидация slug (защита от инъекций и мусорных URL)
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return {
      title: 'Товар не найден | ServiceBox Вологда',
      robots: { index: false, follow: false },
    };
  }

  try {
    await dbConnect();
    const product = await Product.findOne({
      slug,
      isActive: true,
      isDeleted: false,
    }).lean();

    if (!product) {
      return {
        title: 'Товар не найден | ServiceBox Вологда',
        robots: { index: false, follow: false },
      };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://servicebox35.ru';
    const pageUrl = `${baseUrl}/product/${product.slug}`;
    const mainImage = product.images?.[0] || '/images/placeholder.jpg';
    const imageUrl = mainImage.startsWith('http')
      ? mainImage
      : `${baseUrl}${mainImage}`;
    const description =
      product.description?.substring(0, 155) ||
      `Купить ${product.name} в Вологде — Сервис Бокс. Гарантия качества, быстрая доставка.`;

    return {
      title: `${product.name} — купить в Вологде | ServiceBox`,
      description,
      keywords: `${product.name}, ${product.brand || ''}, ${product.vendor || ''}, купить ${product.name} Вологда, ServiceBox`,
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title: product.name,
        description,
        url: pageUrl,
        siteName: 'ServiceBox Вологда',
        type: 'website',
        locale: 'ru_RU',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: [imageUrl],
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
    console.error('❌ [generateMetadata] Error:', error.message);
    return {
      title: 'Ошибка загрузки | ServiceBox Вологда',
      robots: { index: false, follow: false },
    };
  }
}

// ============================================
// 🎨 ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
// ============================================
export default async function ProductPage({ params }) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  try {
    await dbConnect();
    const product = await Product.findOne({
      slug,
      isActive: true,
      isDeleted: false,
    }).lean();

    if (!product) {
      notFound();
    }

    // ★ Преобразование в plain object с виртуальными полями ★
    const availableQty = Math.max(
      0,
      (product.quantity || 0) - (product.reservedQuantity || 0)
    );
    const productWithVirtuals = JSON.parse(
      JSON.stringify({
        ...product,
        _id: product._id.toString(),
        availableQuantity: availableQty,
        hasStock: availableQty > 0,
        mainImage: product.images?.[0] || '/images/placeholder.jpg',
      })
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://servicebox35.ru';
    const pageUrl = `${baseUrl}/product/${productWithVirtuals.slug}`;
    const productImages =
      productWithVirtuals.images?.map(img =>
        img.startsWith('http') ? img : `${baseUrl}${img}`
      ) || [`${baseUrl}/images/placeholder.jpg`];

    // Цена (число, без символов — требование Schema.org)
    const price =
      typeof productWithVirtuals.new_price === 'number'
        ? productWithVirtuals.new_price
        : typeof productWithVirtuals.price === 'number'
          ? productWithVirtuals.price
          : 0;

    // ============================================
    // 🏛️ JSON-LD РАЗМЕТКА (Schema.org)
    // ============================================
    // Используем @graph для корректной связи сущностей
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        // === WebPage (mainEntityOfPage) ===
        {
          '@type': 'WebPage',
          '@id': pageUrl,
          url: pageUrl,
          name: productWithVirtuals.name,
          isPartOf: { '@id': `${baseUrl}#website` },
          about: { '@id': `${baseUrl}#business` },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: productImages[0],
          },
        },

        // === Product ===
        {
          '@type': 'Product',
          '@id': `${pageUrl}#product`,
          name: productWithVirtuals.name,
          description:
            productWithVirtuals.description || productWithVirtuals.name,
          image: productImages,
          sku: productWithVirtuals.sku || productWithVirtuals.slug,
          mpn: productWithVirtuals.sku || productWithVirtuals.slug,
          url: pageUrl,
          mainEntityOfPage: { '@id': pageUrl },

          // Бренд (если указан в товаре)
          ...(productWithVirtuals.brand || productWithVirtuals.vendor
            ? {
              brand: {
                '@type': 'Brand',
                name:
                  productWithVirtuals.brand || productWithVirtuals.vendor,
              },
            }
            : {}),

          // Производитель
          ...(productWithVirtuals.vendor
            ? {
              manufacturer: {
                '@type': 'Organization',
                name: productWithVirtuals.vendor,
              },
            }
            : {}),

          // ⚠️ aggregateRating ТОЛЬКО если есть реальные отзывы в БД!
          // Не добавляем фиктивные отзывы — это нарушает политику Google/Яндекса
          ...(productWithVirtuals.reviews?.length > 0
            ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: productWithVirtuals.averageRating?.toString() || '5.0',
                reviewCount: productWithVirtuals.reviews.length.toString(),
                bestRating: '5',
                worstRating: '1',
              },
            }
            : {}),

          // === Offer (предложение) ===
          offers: {
            '@type': 'Offer',
            '@id': `${pageUrl}#offer`,
            url: pageUrl,
            priceCurrency: 'RUB',
            price: price.toString(),
            priceValidUntil: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0],
            availability: productWithVirtuals.hasStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',

            // Продавец
            seller: {
              '@type': 'Organization',
              name: 'ServiceBox Вологда',
              url: baseUrl,
              telephone: '+7-911-501-88-28',
              email: '508828@bk.ru',
            },

            // Доставка
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: '0',
                currency: 'RUB',
              },
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'RU',
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 1,
                  unitCode: 'DAY',
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 1,
                  maxValue: 3,
                  unitCode: 'DAY',
                },
              },
            },

            // Самовывоз из магазина
            availableAtOrFrom: {
              '@type': 'Place',
              name: 'ServiceBox — Сервисный центр на Северной',
              address: {
                '@type': 'PostalAddress',
                streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
                addressLocality: 'Вологда',
                addressRegion: 'Вологодская область',
                postalCode: '160000',
                addressCountry: 'RU',
              },
            },
          },
        },

        // === BreadcrumbList (отдельная сущность!) ===
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Главная',
              item: baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Каталог',
              item: `${baseUrl}/parts`,
            },
            ...(productWithVirtuals.category
              ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: productWithVirtuals.category,
                  item: `${baseUrl}/parts?category=${encodeURIComponent(
                    productWithVirtuals.category
                  )}`,
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: productWithVirtuals.name,
                  item: pageUrl,
                },
              ]
              : [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: productWithVirtuals.name,
                  item: pageUrl,
                },
              ]),
          ],
        },

        // === LocalBusiness (информация о магазине) ===
        {
          '@type': 'ElectronicsRepairService',
          '@id': `${baseUrl}#business`,
          name: 'ServiceBox - Сервисный центр на Северной',
          alternateName: ['Сервис Бокс', 'ServiceBox35'],
          url: baseUrl,
          telephone: ['+7-911-501-88-28', '+7-911-501-06-96'],
          email: '508828@bk.ru',
          priceRange: '₽₽',
          address: {
            '@type': 'PostalAddress',
            streetAddress: "ул. Северная, д. 7А, 1 этаж, ТЦ 'КИТ'",
            addressLocality: 'Вологда',
            addressRegion: 'Вологодская область',
            postalCode: '160000',
            addressCountry: 'RU',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 59.229445,
            longitude: 39.878542,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '10:00',
              closes: '20:00',
            },
          ],
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5.0',
            reviewCount: '150',
            bestRating: '5',
            worstRating: '1',
          },
          areaServed: { '@type': 'City', name: 'Вологда' },
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
          key="product-jsonld"
        />
        <ClientProductDisplay product={productWithVirtuals} />
      </>
    );
  } catch (error) {
    console.error('❌ [ProductPage] Error:', error.message);
    notFound();
  }
}