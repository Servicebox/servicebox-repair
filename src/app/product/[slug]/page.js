// app/product/[slug]/page.js

import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ClientProductDisplay from '@/components/ProductDisplay/ProductDisplay';
import { BASE_URL } from '@/lib/constants';

// ============================================
// ⚙️ НАСТРОЙКИ КЭШИРОВАНИЯ И СТАТИЗАЦИИ
// ============================================
export const dynamic = 'force-static';
export const revalidate = 3600;
export const fetchCache = 'force-cache';
export const dynamicParams = true;

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

    const pageUrl = `${BASE_URL}/product/${product.slug}`;
    const mainImage = product.images?.[0] || '/images/placeholder.jpg';
    const imageUrl = mainImage.startsWith('http')
      ? mainImage
      : `${BASE_URL}${mainImage}`;
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

    const pageUrl = `${BASE_URL}/product/${productWithVirtuals.slug}`;
    const productImages =
      productWithVirtuals.images?.map(img =>
        img.startsWith('http') ? img : `${BASE_URL}${img}`
      ) || [`${BASE_URL}/images/placeholder.jpg`];

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
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        // 1. WebPage
        {
          '@type': 'WebPage',
          '@id': pageUrl,
          url: pageUrl,
          name: productWithVirtuals.name,
          isPartOf: { '@id': `${BASE_URL}#website` },
          about: { '@id': `${BASE_URL}#business` },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: productImages[0],
          },
        },

        // 2. Product
        {
          '@type': 'Product',
          '@id': `${pageUrl}#product`,
          name: productWithVirtuals.name,
          description: productWithVirtuals.description || productWithVirtuals.name,
          image: productImages,
          sku: productWithVirtuals.sku || productWithVirtuals.slug,
          mpn: productWithVirtuals.sku || productWithVirtuals.slug,
          url: pageUrl,
          mainEntityOfPage: { '@id': pageUrl },

          // Бренд
          ...(productWithVirtuals.brand || productWithVirtuals.vendor
            ? {
              brand: {
                '@type': 'Brand',
                name: productWithVirtuals.brand || productWithVirtuals.vendor,
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

          // Агрегированный рейтинг (только если есть отзывы)
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

          // Offer
          offers: {
            '@type': 'Offer',
            '@id': `${pageUrl}#offer`,
            url: pageUrl,
            priceCurrency: 'RUB',
            price: price.toString(),
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            availability: productWithVirtuals.hasStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',

            // Продавец – только ссылка на глобальный бизнес
            seller: { '@id': `${BASE_URL}#business` },

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

            // Самовывоз – только ссылка на глобальный бизнес
            availableAtOrFrom: { '@id': `${BASE_URL}#business` },
          },
        },

        // 3. BreadcrumbList
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${BASE_URL}/parts` },
            ...(productWithVirtuals.category
              ? [
                { '@type': 'ListItem', position: 3, name: productWithVirtuals.category, item: `${BASE_URL}/parts?category=${encodeURIComponent(productWithVirtuals.category)}` },
                { '@type': 'ListItem', position: 4, name: productWithVirtuals.name, item: pageUrl },
              ]
              : [
                { '@type': 'ListItem', position: 3, name: productWithVirtuals.name, item: pageUrl },
              ]),
          ],
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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