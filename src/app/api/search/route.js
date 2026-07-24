// app/api/search/route.js
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Service from '@/models/Service';
import News from '@/models/News';
import Promotion from '@/models/Promotion';
import { PROBLEMS } from '@/lib/problems-data';
import { ANSWERS } from '@/lib/ai-answers-data';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    console.log(`🔍 API поиск: "${query}"`);

    if (!query || query.length < 2) {
      return Response.json({
        success: true,
        results: [],
        counts: { total: 0 },
        message: 'Введите минимум 2 символа для поиска'
      });
    }

    const allResults = [];
    const searchRegex = new RegExp(query, 'i'); // case-insensitive

    try {
      // 🔎 Поиск по УСЛУГАМ
      console.log('🔍 Ищу услуги...');
      const services = await Service.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { content: searchRegex },
          { keywords: searchRegex },
          { slug: searchRegex }
        ]
      })
        .select('name slug description price isCategory level')
        .limit(10)
        .lean();

      console.log(`✅ Найдено услуг: ${services.length}`);

      services.forEach(service => {
        const score = calculateRelevanceScore(service.name, service.description, query);
        allResults.push({
          id: service._id.toString(),
          title: service.name,
          description: service.description || 'Услуга по ремонту техники',
          url: service.isCategory ? `/services/${service.slug}` : `/services/${service.slug}`,
          type: 'service',
          price: service.price,
          category: service.isCategory ? 'Категория услуг' : 'Услуга',
          score: score + 100 // Бонус за услуги
        });
      });
    } catch (serviceError) {
      console.error('❌ Ошибка поиска услуг:', serviceError.message);
    }

    try {
      // 🔎 Поиск по ТОВАРАМ
      console.log('🔍 Ищу товары...');
      const products = await Product.find({
        $and: [
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex },
              { category: searchRegex },
              { brand: searchRegex },
              { slug: searchRegex }
            ]
          },
          { isActive: true },
          { isDeleted: { $ne: true } },
          {
            $or: [
              { status: 'active' },
              { status: { $exists: false } }
            ]
          }
        ]
      })
        .select('name slug description new_price old_price images category brand')
        .limit(10)
        .lean();

      console.log(`✅ Найдено товаров: ${products.length}`);

      products.forEach(product => {
        const score = calculateRelevanceScore(product.name, product.description, query);
        allResults.push({
          id: product._id.toString(),
          title: product.name,
          description: product.description || `Товар: ${product.category}`,
          url: `/product/${product.slug}`,
          type: 'product',
          price: product.new_price,
          oldPrice: product.old_price,
          image: product.images?.[0],
          category: product.category,
          brand: product.brand,
          score: score + 90 // Бонус за товары
        });
      });
    } catch (productError) {
      console.error('❌ Ошибка поиска товаров:', productError.message);
    }

    try {
      // 🔎 Поиск по НОВОСТЯМ
      console.log('🔍 Ищу новости...');
      const news = await News.find({
        $and: [
          {
            $or: [
              { title: searchRegex },
              { excerpt: searchRegex },
              { metaDescription: searchRegex },
              { slug: searchRegex }
            ]
          },
          { isPublished: true }
        ]
      })
        .select('title slug excerpt metaDescription publishedAt featuredImage')
        .limit(10)
        .lean();

      console.log(`✅ Найдено новостей: ${news.length}`);

      news.forEach(newsItem => {
        const score = calculateRelevanceScore(newsItem.title, newsItem.excerpt, query);
        allResults.push({
          id: newsItem._id.toString(),
          title: newsItem.title,
          description: newsItem.excerpt || newsItem.metaDescription || 'Новость',
          url: `/news/${newsItem.slug}`,
          type: 'news',
          date: newsItem.publishedAt,
          image: newsItem.featuredImage,
          score: score + 80 // Бонус за новости
        });
      });
    } catch (newsError) {
      console.error('❌ Ошибка поиска новостей:', newsError.message);
    }

    try {
      // 🔎 Поиск по АКЦИЯМ
      console.log('🔍 Ищу акции...');
      const promotions = await Promotion.find({
        isActive: true,
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex }
        ]
      })
        .select('title shortDescription description')
        .limit(10)
        .lean();

      console.log(`✅ Найдено акций: ${promotions.length}`);

      promotions.forEach(promo => {
        const score = calculateRelevanceScore(promo.title, promo.shortDescription || promo.description, query);
        allResults.push({
          id: promo._id.toString(),
          title: promo.title,
          description: promo.shortDescription || 'Акция сервисного центра',
          url: `/promotions-page`,
          type: 'promotion',
          category: 'Акция',
          score: score + 70
        });
      });
    } catch (promoError) {
      console.error('❌ Ошибка поиска акций:', promoError.message);
    }

    try {
      // 🔎 Поиск по СТАТЬЯМ-ДИАГНОСТИКЕ (/problems/*)
      Object.entries(PROBLEMS).forEach(([slug, problem]) => {
        const haystack = `${problem.title} ${problem.shortAnswer}`;
        if (searchRegex.test(haystack)) {
          const score = calculateRelevanceScore(problem.title, problem.shortAnswer, query);
          allResults.push({
            id: `problem-${slug}`,
            title: problem.title,
            description: problem.shortAnswer,
            url: `/problems/${slug}`,
            type: 'article',
            category: problem.category,
            score: score + 60
          });
        }
      });
    } catch (problemsError) {
      console.error('❌ Ошибка поиска статей-диагностики:', problemsError.message);
    }

    try {
      // 🔎 Поиск по AI-ОТВЕТАМ (/ai-answers/*)
      Object.entries(ANSWERS).forEach(([slug, answer]) => {
        const haystack = `${answer.question} ${answer.shortAnswer}`;
        if (searchRegex.test(haystack)) {
          const score = calculateRelevanceScore(answer.question, answer.shortAnswer, query);
          allResults.push({
            id: `ai-answer-${slug}`,
            title: answer.question,
            description: answer.shortAnswer,
            url: `/ai-answers/${slug}`,
            type: 'article',
            category: answer.category,
            score: score + 60
          });
        }
      });
    } catch (answersError) {
      console.error('❌ Ошибка поиска AI-ответов:', answersError.message);
    }

    // Сортируем по релевантности
    const sortedResults = allResults.sort((a, b) => b.score - a.score).slice(0, 15);

    console.log(`🎯 Итоговый поиск "${query}": найдено ${sortedResults.length} результатов`);

    return Response.json({
      success: true,
      results: sortedResults,
      counts: {
        total: sortedResults.length,
        services: sortedResults.filter(r => r.type === 'service').length,
        products: sortedResults.filter(r => r.type === 'product').length,
        news: sortedResults.filter(r => r.type === 'news').length,
        promotions: sortedResults.filter(r => r.type === 'promotion').length,
        articles: sortedResults.filter(r => r.type === 'article').length
      },
      query
    });

  } catch (error) {
    console.error('💥 Критическая ошибка поиска:', error);
    return Response.json({
      success: false,
      error: error.message,
      results: [],
      counts: { total: 0 }
    }, { status: 500 });
  }
}

// Улучшенная функция расчета релевантности
function calculateRelevanceScore(title = '', description = '', query) {
  let score = 0;
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const queryLower = query.toLowerCase();

  // Экспоненциальный бонус за точные совпадения
  if (titleLower === queryLower) score += 1000;
  if (descLower === queryLower) score += 500;

  // Бонус за совпадение в начале
  if (titleLower.startsWith(queryLower)) score += 200;
  if (descLower.startsWith(queryLower)) score += 100;

  // Бонус за слово в начале
  const titleWords = titleLower.split(' ');
  const descWords = descLower.split(' ');

  titleWords.forEach((word, index) => {
    if (word.startsWith(queryLower)) {
      score += 150 - (index * 10); // Больше бонус за первые слова
    } else if (word.includes(queryLower)) {
      score += 50 - (index * 5);
    }
  });

  descWords.forEach((word, index) => {
    if (word.startsWith(queryLower)) {
      score += 75 - (index * 5);
    } else if (word.includes(queryLower)) {
      score += 25 - (index * 2);
    }
  });

  // Бонус за длину запроса (короткие запросы должны быть точнее)
  if (queryLower.length <= 3) {
    if (titleLower.includes(queryLower)) score += 100;
    if (descLower.includes(queryLower)) score += 50;
  }

  return score;
}