// app/product/[slug]/page.js
// app/product/[slug]/page.js
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import ClientProductDisplay from '@/components/ProductDisplay/ProductDisplay';

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    await dbConnect();

    const product = await Product.findOne({
      slug,
      isActive: true,
      isDeleted: false
    }).lean();

    if (!product) {
      return {
        title: 'Товар не найден - ServiceBox35',
        description: 'Товар не найден в магазине ServiceBox35',
      };
    }

    // Преобразуем _id в строку и создаем plain object
    const plainProduct = {
      ...product,
      _id: product._id.toString(),
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://servicebox35.ru';
    const mainImage = plainProduct.images?.[0] || '/images/placeholder.jpg';
    const imageUrl = mainImage.startsWith('http') ? mainImage : `${baseUrl}${mainImage}`;

    return {
      title: `${plainProduct.name} - купить в ServiceBox35`,
      description: plainProduct.description?.substring(0, 155) || '',
      openGraph: {
        title: plainProduct.name,
        description: plainProduct.description?.substring(0, 155) || '',
        url: `${baseUrl}/product/${plainProduct.slug}`,
        siteName: 'ServiceBox35',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: plainProduct.name,
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'ServiceBox35 - Магазин запчастей',
      description: 'Интернет-магазин запчастей и комплектующих',
    };
  }
}

export default async function ProductPage({ params }) {
  try {
    const { slug } = await params;
    await dbConnect();

    const product = await Product.findOne({
      slug,
      isActive: true,
      isDeleted: false
    }).lean();

    if (!product) {
      notFound();
    }

    // ★ ВАЖНО: Полное преобразование в plain object ★
    const productWithVirtuals = JSON.parse(JSON.stringify({
      ...product,
      _id: product._id.toString(),
      availableQuantity: Math.max(0, product.quantity - (product.reservedQuantity || 0)),
      hasStock: Math.max(0, product.quantity - (product.reservedQuantity || 0)) > 0,
      mainImage: product.images?.[0] || '/images/placeholder.jpg'
    }));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://servicebox35.ru';
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productWithVirtuals.name,
      "description": productWithVirtuals.description || productWithVirtuals.name,
      "image": productWithVirtuals.images?.map(img =>
        img.startsWith('http') ? img : `${baseUrl}${img}`
      ) || [],
      "sku": productWithVirtuals.sku || productWithVirtuals.slug,
      "brand": {
        "@type": "Brand",
        "name": productWithVirtuals.brand || productWithVirtuals.vendor || 'ServiceBox35'
      },
      "offers": {
        "@type": "Offer",
        "url": `${baseUrl}/product/${productWithVirtuals.slug}`,
        "priceCurrency": "RUB",
        "price": productWithVirtuals.new_price,
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": productWithVirtuals.hasStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        "itemCondition": "https://schema.org/NewCondition"
      }
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
    console.error('Error loading product page:', error);
    notFound();
  }
}