// app/sitemap.js
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicebox35.ru';
  const currentDate = new Date();

  // Все статические страницы с AI-оптимизированными приоритетами
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      // AI-метаданные
      aiMetadata: {
        pageType: 'home',
        contentFocus: 'services_overview',
        primaryKeywords: ['ремонт техники Вологда', 'сервисный центр Вологда'],
        contentSummary: 'Главная страница сервисного центра ServiceBox в Вологде - ремонт ноутбуков, телефонов, видеокарт и другой техники'
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
        primaryKeywords: ['о компании ServiceBox', 'наша история', 'опыт работы'],
        contentSummary: 'Информация о компании ServiceBox - сервисном центре в Вологде с опытом работы с 2016 года'
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
        primaryKeywords: ['контакты сервиса', 'адрес ремонта техники Вологда', 'телефон сервисного центра'],
        contentSummary: 'Контакты сервисных центров ServiceBox в Вологде: адреса, телефоны, часы работы'
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
        primaryKeywords: ['запчасти для ремонта', 'оригинальные комплектующие', 'аксессуары'],
        contentSummary: 'Запчасти и комплектующие для ремонта техники в Вологде - экраны, аккумуляторы, детали'
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
        primaryKeywords: ['услуги ремонта', 'виды ремонта техники', 'ремонтные услуги'],
        contentSummary: 'Полный список услуг по ремонту техники в сервисном центре ServiceBox в Вологде'
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
        primaryKeywords: ['цены на ремонт', 'стоимость услуг', 'прайс-лист'],
        contentSummary: 'Прайс-лист на услуги ремонта техники в Вологде - прозрачное ценообразование'
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
        primaryKeywords: ['фото работ', 'примеры ремонта', 'галерея работ'],
        contentSummary: 'Фотогалерея выполненных работ сервисного центра ServiceBox в Вологде'
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
        primaryKeywords: ['новости сервиса', 'статьи о ремонте', 'технические статьи'],
        contentSummary: 'Новости и статьи о ремонте техники от сервисного центра ServiceBox в Вологде'
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
        primaryKeywords: ['акции на ремонт', 'скидки сервиса', 'специальные предложения'],
        contentSummary: 'Акции и специальные предложения на ремонт техники в сервисном центре ServiceBox'
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
        primaryKeywords: ['хранение техники', 'депозитарий', 'временное хранение'],
        contentSummary: 'Услуги хранения техники в сервисном центре ServiceBox в Вологде'
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
        primaryKeywords: ['отслеживание ремонта', 'статус заказа', 'статус ремонта'],
        contentSummary: 'Отслеживание статуса ремонта техники в сервисном центре ServiceBox'
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
        primaryKeywords: ['схема работы', 'процесс ремонта', 'этапы работы'],
        contentSummary: 'Пошаговая схема работы сервисного центра ServiceBox - от приема техники до выдачи'
      }
    },

  ];

  // AI API эндпоинты для AI-ассистентов
  const apiPages = [
    {
      url: `${baseUrl}/api/ai/v1/business`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      aiMetadata: {
        pageType: 'api',
        contentFocus: 'structured_data',
        primaryKeywords: ['AI данные', 'структурированная информация', 'бизнес информация'],
        contentSummary: 'Структурированные данные о бизнесе ServiceBox для AI-ассистентов и поисковых систем'
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
        primaryKeywords: ['цены API', 'стоимость услуг API', 'прайс API'],
        contentSummary: 'API с информацией о ценах на услуги ремонта для AI-ассистентов'
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
        primaryKeywords: ['экстренные инструкции', 'первая помощь технике', 'аварийные ситуации'],
        contentSummary: 'Инструкции по экстренным ситуациям с техникой для AI-ассистентов'
      }
    }
  ];

  try {
    // Получаем все услуги
    let servicePages = [];
    try {
      const servicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || baseUrl}/api/services/all`, {
        next: { revalidate: 3600 },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ServiceBox-Sitemap-Generator/1.0'
        }
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
              primaryKeywords: [
                `ремонт ${service.name.toLowerCase()} Вологда`,
                `${service.name.toLowerCase()} сервис`,
                `починить ${service.name.toLowerCase()}`
              ],
              contentSummary: `Ремонт ${service.name} в сервисном центре ServiceBox в Вологде`
            }
          }));
        }
      }
    } catch (error) {
      console.warn('Error fetching services for sitemap:', error.message);
    }

    // Получаем все товары
    let productPages = [];
    try {
      const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || baseUrl}/api/products?limit=1000`, {
        next: { revalidate: 3600 },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ServiceBox-Sitemap-Generator/1.0'
        }
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
              primaryKeywords: [
                `${product.name} купить Вологда`,
                `запчасть ${product.name}`,
                `${product.name} цена`
              ],
              contentSummary: `Купить ${product.name} для ремонта техники в Вологде`
            }
          }));
        }
      }
    } catch (error) {
      console.warn('Error fetching products for sitemap:', error.message);
    }

    // Получаем все новости
    let newsPages = [];
    try {
      const newsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || baseUrl}/api/news?limit=1000`, {
        next: { revalidate: 3600 },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ServiceBox-Sitemap-Generator/1.0'
        }
      });

      if (newsResponse.ok) {
        const newsData = await newsResponse.json();

        if (newsData.news) {
          newsPages = newsData.news.map(newsItem => ({
            url: `${baseUrl}/news/${encodeURIComponent(newsItem.slug)}`,
            lastModified: new Date(newsItem.updatedAt || currentDate),
            changeFrequency: 'monthly',
            priority: 0.7,
            aiMetadata: {
              pageType: 'article',
              contentFocus: 'news_detail',
              primaryKeywords: [
                `${newsItem.title}`,
                `статья о ремонте`,
                `технический блог`
              ],
              contentSummary: newsItem.excerpt || `Статья: ${newsItem.title} от сервисного центра ServiceBox`
            }
          }));
        }
      }
    } catch (error) {
      console.warn('Error fetching news for sitemap:', error.message);
    }

    // Получаем страницы услуг по категориям (для AI-оптимизации)
    const serviceCategoryPages = [
      {
        url: `${baseUrl}/services/notebooks`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
        aiMetadata: {
          pageType: 'service_category',
          contentFocus: 'notebook_repair',
          primaryKeywords: ['ремонт ноутбуков Вологда', 'починить ноутбук', 'сервис ноутбуков'],
          contentSummary: 'Ремонт ноутбуков всех брендов в Вологде - замена экранов, ремонт материнских плат, чистка'
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
          primaryKeywords: ['ремонт телефонов Вологда', 'починить телефон', 'сервис телефонов'],
          contentSummary: 'Ремонт телефонов и смартфонов в Вологде - замена дисплеев, аккумуляторов, ремонт после воды'
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
          primaryKeywords: ['ремонт компьютеров Вологда', 'ремонт ПК', 'починить компьютер'],
          contentSummary: 'Ремонт компьютеров и системных блоков в Вологде - диагностика, замена комплектующих'
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
          primaryKeywords: ['ремонт видеокарт Вологда', 'починить видеокарту', 'видеокарта ремонт'],
          contentSummary: 'Ремонт видеокарт в Вологде - замена видеочипов, ремонт системы питания, чистка'
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
          primaryKeywords: ['ремонт телевизоров Вологда', 'починить телевизор', 'сервис телевизоров'],
          contentSummary: 'Ремонт телевизоров в Вологде - замена подсветки, ремонт блоков питания, настройка'
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
          primaryKeywords: ['ремонт Apple Вологда', 'починить iPhone', 'сервис MacBook'],
          contentSummary: 'Ремонт техники Apple в Вологде - iPhone, iPad, MacBook, iMac, Apple Watch'
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
          primaryKeywords: ['ремонт приставок Вологда', 'починить PlayStation', 'сервис Xbox'],
          contentSummary: 'Ремонт игровых приставок в Вологде - PlayStation, Xbox, Nintendo Switch'
        }
      }
    ];


    const allPages = [
      ...staticPages,
      ...apiPages,
      ...serviceCategoryPages,
      ...servicePages,
      ...productPages,
      ...newsPages,
    ].map(page => ({
      ...page,

      _ai_optimized: true,
      _content_language: 'ru',
      _country: 'RU',
      _business_type: 'electronics_repair_service',
      _business_city: 'Вологда',
      _business_region: 'Вологодская область',
    }));


    const urlSet = new Set();
    const uniquePages = [];

    for (const page of allPages) {
      if (!urlSet.has(page.url)) {
        urlSet.add(page.url);
        uniquePages.push(page);
      }
    }


    uniquePages.sort((a, b) => b.priority - a.priority);


    const maxPages = 10000;
    const finalPages = uniquePages.slice(0, maxPages);


    console.log(`Generated sitemap with ${finalPages.length} pages, ${servicePages.length} services, ${productPages.length} products, ${newsPages.length} news`);

    return finalPages;

  } catch (error) {
    console.error('Error generating sitemap:', error);

    return [...staticPages, ...apiPages];
  }
}


export async function generateSitemaps() {

  return [{ id: 0 }];
}


export async function getServerSideProps() {

  return {
    props: {},
  };
}