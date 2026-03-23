// app/sitemap.js

/**
 * Создание валидного entry для sitemap с дополнительными метаданными
 */
const createSitemapEntry = ({ url, lastModified, changeFrequency, priority, aiMetadata = {} }) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    console.warn('⚠️ Invalid URL in sitemap entry:', url);
    return null;
  }

  const formatDate = (date) => {
    if (!date) return new Date().toISOString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  };

  const normalizedPriority = typeof priority === 'number'
    ? Math.max(0, Math.min(1, priority))
    : 0.5;

  const entry = {
    loc: url,
    lastmod: formatDate(lastModified),
    changefreq: changeFrequency || 'monthly',
    priority: normalizedPriority,
  };

  if (aiMetadata.pageType) {
    entry['x-ai:type'] = aiMetadata.pageType;
  }
  if (aiMetadata.contentFocus) {
    entry['x-ai:focus'] = aiMetadata.contentFocus;
  }
  if (Array.isArray(aiMetadata.primaryKeywords) && aiMetadata.primaryKeywords.length > 0) {
    entry['x-ai:keywords'] = aiMetadata.primaryKeywords.slice(0, 5).join(', ');
  }
  if (aiMetadata.contentSummary) {
    entry['x-ai:summary'] = aiMetadata.contentSummary.substring(0, 200);
  }

  entry['x-business:city'] = 'Вологда';
  entry['x-business:region'] = 'Вологодская область';
  entry['x-business:category'] = 'electronics_repair_service';
  entry['x-business:language'] = 'ru';

  if (aiMetadata.article) {
    entry['x-article:title'] = aiMetadata.article.title?.substring(0, 100);
    entry['x-article:published'] = aiMetadata.article.publishedAt;
    entry['x-article:updated'] = aiMetadata.article.updatedAt;
    entry['x-article:has-image'] = aiMetadata.article.hasImage ? 'true' : 'false';
  }

  return entry;
};

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru';
  const currentDate = new Date();

  // Все статические страницы
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      aiMetadata: {
        pageType: 'home',
        contentFocus: 'services_overview',
        primaryKeywords: ['ремонт техники Вологда', 'сервисный центр Вологда'],
        contentSummary: 'Главная страница сервисного центра ServiceBox в Вологде'
      }
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      aiMetadata: {
        pageType: 'about',
        contentFocus: 'company_info',
        primaryKeywords: ['о компании ServiceBox', 'наша история'],
        contentSummary: 'Информация о компании ServiceBox'
      }
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      aiMetadata: {
        pageType: 'contacts',
        contentFocus: 'contact_info',
        primaryKeywords: ['контакты сервиса', 'адрес ремонта техники Вологда'],
        contentSummary: 'Контакты сервисных центров ServiceBox в Вологде'
      }
    },
    {
      url: `${baseUrl}/parts`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
      aiMetadata: {
        pageType: 'products',
        contentFocus: 'spare_parts',
        primaryKeywords: ['запчасти для ремонта', 'оригинальные комплектующие'],
        contentSummary: 'Запчасти и комплектующие для ремонта техники'
      }
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
      aiMetadata: {
        pageType: 'services_list',
        contentFocus: 'services_overview',
        primaryKeywords: ['услуги ремонта', 'виды ремонта техники'],
        contentSummary: 'Полный список услуг по ремонту техники'
      }
    },
    {
      url: `${baseUrl}/prices`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      aiMetadata: {
        pageType: 'pricing',
        contentFocus: 'price_list',
        primaryKeywords: ['цены на ремонт', 'стоимость услуг'],
        contentSummary: 'Прайс-лист на услуги ремонта техники'
      }
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      aiMetadata: {
        pageType: 'gallery',
        contentFocus: 'portfolio',
        primaryKeywords: ['фото работ', 'примеры ремонта'],
        contentSummary: 'Фотогалерея выполненных работ'
      }
    },
    {
      url: `${baseUrl}/news`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      aiMetadata: {
        pageType: 'blog',
        contentFocus: 'news_articles',
        primaryKeywords: ['новости сервиса', 'статьи о ремонте'],
        contentSummary: 'Новости и статьи о ремонте техники'
      }
    },
    {
      url: `${baseUrl}/promotions-page`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
      aiMetadata: {
        pageType: 'promotions',
        contentFocus: 'discounts_specials',
        primaryKeywords: ['акции на ремонт', 'скидки сервиса'],
        contentSummary: 'Акции и специальные предложения'
      }
    },
    {
      url: `${baseUrl}/depository-public`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
      aiMetadata: {
        pageType: 'depository',
        contentFocus: 'storage_info',
        primaryKeywords: ['хранение техники', 'депозитарий'],
        contentSummary: 'Услуги хранения техники'
      }
    },
    {
      url: `${baseUrl}/tracking`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
      aiMetadata: {
        pageType: 'tracking',
        contentFocus: 'order_status',
        primaryKeywords: ['отслеживание ремонта', 'статус заказа'],
        contentSummary: 'Отслеживание статуса ремонта техники'
      }
    },
    {
      url: `${baseUrl}/worksteps`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
      aiMetadata: {
        pageType: 'process',
        contentFocus: 'workflow_steps',
        primaryKeywords: ['схема работы', 'процесс ремонта'],
        contentSummary: 'Пошаговая схема работы сервисного центра'
      }
    },
  ];

  // AI API эндпоинты
  const apiPages = [
    {
      url: `${baseUrl}/api/ai/v1/business`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      aiMetadata: {
        pageType: 'api',
        contentFocus: 'structured_data',
        primaryKeywords: ['AI данные', 'структурированная информация'],
        contentSummary: 'Структурированные данные о бизнесе ServiceBox для AI-ассистентов'
      }
    },
    {
      url: `${baseUrl}/api/ai/v1/prices`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
      aiMetadata: {
        pageType: 'api',
        contentFocus: 'pricing_data',
        primaryKeywords: ['цены API', 'стоимость услуг API'],
        contentSummary: 'API с информацией о ценах на услуги ремонта'
      }
    },
    {
      url: `${baseUrl}/api/ai/v1/emergency`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
      aiMetadata: {
        pageType: 'api',
        contentFocus: 'emergency_instructions',
        primaryKeywords: ['экстренные инструкции', 'первая помощь технике'],
        contentSummary: 'Инструкции по экстренным ситуациям с техникой'
      }
    }
  ];

  // Страницы услуг по категориям
  const serviceCategoryPages = [
    {
      url: `${baseUrl}/services/notebooks`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      aiMetadata: {
        pageType: 'service_category',
        contentFocus: 'notebook_repair',
        primaryKeywords: ['ремонт ноутбуков Вологда', 'починить ноутбук'],
        contentSummary: 'Ремонт ноутбуков всех брендов в Вологде'
      }
    },
    {
      url: `${baseUrl}/services/phones`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      aiMetadata: {
        pageType: 'service_category',
        contentFocus: 'phone_repair',
        primaryKeywords: ['ремонт телефонов Вологда', 'починить телефон'],
        contentSummary: 'Ремонт телефонов и смартфонов в Вологде'
      }
    },
    {
      url: `${baseUrl}/services/computers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      aiMetadata: {
        pageType: 'service_category',
        contentFocus: 'computer_repair',
        primaryKeywords: ['ремонт компьютеров Вологда', 'ремонт ПК'],
        contentSummary: 'Ремонт компьютеров и системных блоков'
      }
    },
    {
      url: `${baseUrl}/services/videocards`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      aiMetadata: {
        pageType: 'service_category',
        contentFocus: 'videocard_repair',
        primaryKeywords: ['ремонт видеокарт Вологда', 'починить видеокарту'],
        contentSummary: 'Ремонт видеокарт в Вологде'
      }
    },
    {
      url: `${baseUrl}/services/tv`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
      aiMetadata: {
        pageType: 'service_category',
        contentFocus: 'tv_repair',
        primaryKeywords: ['ремонт телевизоров Вологда', 'починить телевизор'],
        contentSummary: 'Ремонт телевизоров в Вологде'
      }
    },
    {
      url: `${baseUrl}/services/apple`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
      aiMetadata: {
        pageType: 'service_category',
        contentFocus: 'apple_repair',
        primaryKeywords: ['ремонт Apple Вологда', 'починить iPhone'],
        contentSummary: 'Ремонт техники Apple в Вологде'
      }
    },
    {
      url: `${baseUrl}/services/consoles`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
      aiMetadata: {
        pageType: 'service_category',
        contentFocus: 'console_repair',
        primaryKeywords: ['ремонт приставок Вологда', 'починить PlayStation'],
        contentSummary: 'Ремонт игровых приставок в Вологде'
      }
    }
  ];

  // Получаем динамические данные
  let servicePages = [];
  let productPages = [];
  let newsEntries = [];

  // 1. Услуги
  try {
    const servicesResponse = await fetch(`${baseUrl}/api/services/all`, {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' }
    });

    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      if (servicesData.success && servicesData.data) {
        servicePages = servicesData.data.map(service => ({
          url: `${baseUrl}/services/${encodeURIComponent(service.slug)}`,
          lastModified: new Date(service.updatedAt || currentDate),
          changeFrequency: service.isCategory ? 'weekly' : 'monthly',
          priority: service.level === 0 ? 0.9 : service.level === 1 ? 0.8 : 0.7,
          aiMetadata: {
            pageType: 'service_detail',
            contentFocus: 'specific_service',
            primaryKeywords: [`ремонт ${service.name?.toLowerCase() || ''} Вологда`],
            contentSummary: `Ремонт ${service.name} в сервисном центре ServiceBox в Вологде`
          }
        }));
      }
    }
  } catch (error) {
    console.warn('Error fetching services for sitemap:', error.message);
  }

  // 2. Товары
  try {
    const productsResponse = await fetch(`${baseUrl}/api/products?limit=1000`, {
      next: { revalidate: 3600 }
    });

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.products) {
        productPages = productsData.products.map(product => ({
          url: `${baseUrl}/product/${encodeURIComponent(product.slug)}`,
          lastModified: new Date(product.updatedAt || currentDate),
          changeFrequency: 'weekly',
          priority: 0.8,
          aiMetadata: {
            pageType: 'product_detail',
            contentFocus: 'product_info',
            primaryKeywords: [`${product.name} купить Вологда`],
            contentSummary: `Купить ${product.name} для ремонта техники в Вологде`
          }
        }));
      }
    }
  } catch (error) {
    console.warn('Error fetching products for sitemap:', error.message);
  }

  // 3. Новости (исправлено: используем baseUrl, а не API_URL)
  try {
    console.log('📰 Fetching news for sitemap...');
    const newsResponse = await fetch(`${baseUrl}/api/news?all=1&limit=500`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }
    });

    if (newsResponse.ok) {
      const newsData = await newsResponse.json();
      if (newsData?.success && Array.isArray(newsData.data)) {
        const publishedNews = newsData.data.filter(news => news.isPublished === true && news.slug);

        newsEntries = publishedNews.map(news => {
          let validSlug = news.slug.trim().toLowerCase();
          const lastModified = news.updatedAt ? new Date(news.updatedAt) :
            news.publishedAt ? new Date(news.publishedAt) : currentDate;

          const allKeywords = [news.title, 'ремонт техники Вологда', 'сервисный центр статьи'];
          const summary = news.excerpt ? news.excerpt.substring(0, 200) : `Статья: ${news.title}`;

          return createSitemapEntry({
            url: `${baseUrl}/news/${validSlug}`, // исправлено: baseUrl вместо BASE_URL
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
            aiMetadata: {
              pageType: 'news_article',
              contentFocus: 'expert_advice',
              primaryKeywords: allKeywords,
              contentSummary: summary,
              article: {
                title: news.title,
                publishedAt: news.publishedAt ? new Date(news.publishedAt).toISOString() : null,
                updatedAt: news.updatedAt ? new Date(news.updatedAt).toISOString() : null,
                hasImage: !!news.featuredImage,
              }
            }
          });
        }).filter(Boolean).slice(0, 500);

        console.log(`✅ Generated ${newsEntries.length} news entries for sitemap`);
      }
    }
  } catch (error) {
    console.warn('Error fetching news for sitemap:', error.message);
    newsEntries = [];
  }

  // Объединяем все страницы (исправлено: newsEntries вместо newsPages)
  const allPages = [
    ...staticPages,
    ...apiPages,
    ...serviceCategoryPages,
    ...servicePages,
    ...productPages,
    ...newsEntries,
  ].map(page => ({
    ...page,
    _ai_optimized: true,
    _content_language: 'ru',
    _country: 'RU',
    _business_type: 'electronics_repair_service',
    _business_city: 'Вологда',
    _business_region: 'Вологодская область',
  }));

  // Убираем дубликаты
  const urlSet = new Set();
  const uniquePages = [];
  for (const page of allPages) {
    if (!urlSet.has(page.url)) {
      urlSet.add(page.url);
      uniquePages.push(page);
    }
  }

  uniquePages.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Исправлено: используем newsEntries вместо newsPages
  console.log(`Generated sitemap with ${uniquePages.length} pages, ${servicePages.length} services, ${productPages.length} products, ${newsEntries.length} news`);

  return uniquePages.slice(0, 10000);
}

// Экспорт для больших sitemap (если страниц > 50000)
export async function generateSitemaps() {
  return [{ id: 0 }];
}