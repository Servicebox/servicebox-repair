// app/services/[slug]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BookingForm from '@/components/BookingForm/BookingForm';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

// Иконки для категорий
const categoryIcons = {
  'ремонт ноутбуков': '/images/notebook.webp',
  'ремонт телефонов': '/images/android.webp',
  'ремонт компьютеров': '/images/monoblok.webp',
  'техника apple': '/images/apple.webp',
  'ремонт планшетов': '/images/tablet.webp',
  'ремонт телевизоров': '/images/tv.webp',
  'замена стекла': '/images/glass.webp',
  'ремонт видеокарт': '/images/videocard.webp'
};

const defaultIcon = '/images/Devices.webp';
const geoKeywords = ['Вологда'];

// Основные цвета
const PRIMARY_COLOR = '#002147'; // Темно-синий для кнопок
const TEXT_COLOR = 'text-gray-800'; // Темно-серый для текста
const BORDER_COLOR = 'border-gray-200'; // Светло-серый для границ

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchService();
  }, [params?.slug]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const { slug } = params;

      if (!slug) {
        router.push('/services');
        return;
      }

      const decodedSlug = decodeURIComponent(slug);
      const response = await fetch(`/api/services/${encodeURIComponent(decodedSlug)}?breadcrumbs=true`);
      const data = await response.json();

      if (data.success) {
        setService(data.data);

        // Добавляем JSON-LD для SEO
        addJsonLd(data.data);
      } else {
        router.push('/services');
      }
    } catch (error) {
      console.error('Ошибка загрузки услуги:', error);
      router.push('/services');
    } finally {
      setLoading(false);
    }
  };

  // Формируем хлебные крошки для услуги
  const serviceBreadcrumbs = service ? [
    { name: 'Главная', url: '/' },
    { name: 'Услуги', url: '/services' },
    ...(service.breadcrumbs || []),
    { name: service.h1 || service.name, url: `#` }
  ] : [];

  // Устанавливаем хлебные крошки
  useBreadcrumbs(serviceBreadcrumbs, service?.h1 || service?.name);

  const addJsonLd = (serviceData) => {
    // Удаляем старый скрипт, если есть
    const oldScript = document.querySelector('script[data-service-jsonld]');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-service-jsonld', 'true');

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: serviceData.h1 || serviceData.name,
      description: serviceData.description,
      provider: { '@id': `${window.location.origin}#business` },  // ← только ссылка!
      areaServed: { '@type': 'City', name: 'Вологда' },
      offers: {
        '@type': 'Offer',
        price: extractPrice(serviceData.price),
        priceCurrency: 'RUB'
      }
    };

    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  };


  const extractPrice = (price) => {
    if (!price || price === 'Уточняйте') return '0';
    const match = price.match(/\d+/g);
    return match ? match.join('') : '0';
  };

  const handleBookingClick = () => {
    setShowBookingForm(true);
  };

  const formatPrice = (price) => {
    if (!price || price.trim() === '' || price.toLowerCase() === 'уточняйте') {
      return 'Уточняйте';
    }

    if (price.includes('₽') || price.toLowerCase().includes('руб')) {
      return price;
    }

    if (price.toLowerCase().startsWith('')) {
      return `${price} ₽`;
    }

    // Если это число
    const num = parseInt(price.replace(/\D/g, ''));
    if (!isNaN(num)) {
      return ` ${num.toLocaleString('ru-RU')} ₽`;
    }

    return `${price} ₽`;
  };

  const getIconForCategory = (categoryName) => {
    if (!categoryName) return defaultIcon;

    const lowerName = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    return defaultIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-800">Загружаем услугу...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Услуга не найдена</h1>
          <Link href="/services" className="text-gray-800 hover:text-blue-600 font-medium">
            ← Вернуться к услугам
          </Link>
        </div>
      </div>
    );
  }

  const isCategory = service.isCategory;
  const icon = getIconForCategory(service.name);

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className={`py-12 ${TEXT_COLOR}`}>
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-6">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Обслуживаем: {geoKeywords.join(', ')}</span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-300">
                    <Image
                      src={icon}
                      alt={service.name}
                      width={32}
                      height={32}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900">
                      {service.h1 || service.name}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      в {geoKeywords[0]}
                    </p>
                  </div>
                </div>

                <p className={`text-xl mb-8 max-w-3xl ${TEXT_COLOR}`}>
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Гарантия до 12 месяцев</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Ремонт от 1 дня</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-300">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold mb-2 text-gray-900">{formatPrice(service.price)}</div>
                    <p className="text-gray-600">Стоимость услуги</p>
                  </div>

                  <button
                    onClick={handleBookingClick}
                    className="w-full px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
                  >
                    Записаться онлайн
                  </button>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">или позвоните</p>
                    <a href="tel:+79115018828" className="text-2xl font-bold text-gray-900 hover:text-blue-900 transition-colors block">
                      +7 (911) 501-88-28
                    </a>
                    <a href="tel:+79115010696" className="text-2xl font-bold text-gray-900 hover:text-blue-800 transition-colors block mt-2">
                      +7 (911) 501-06-96
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="max-w-7xl mx-auto px-4 py-8">
          {isCategory ? (
            // Страница категории
            <CategoryPage service={service} formatPrice={formatPrice} />
          ) : (
            // Страница услуги
            <ServicePage
              service={service}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleBookingClick={handleBookingClick}
              formatPrice={formatPrice}
            />
          )}
        </div>

        {/* SEO блок */}
        <div className="py-12 border-t border-gray-300">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Профессиональный ремонт техники в {geoKeywords.join(', ')}
            </h2>
            <p className="text-gray-700 mb-4">
              Сервисный центр Сервис Бокс специализируется на профессиональном ремонте цифровой техники.
              Наши мастера имеют многолетний опыт работы с устройствами различных производителей.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Оригинальные запчасти</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Бесплатная диагностика</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Опытные мастера</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Форма записи */}
      {showBookingForm && (
        <BookingForm
          service={service}
          onClose={() => setShowBookingForm(false)}
          onBookingSuccess={() => {
            setShowBookingForm(false);
            alert('✅ Запись успешно создана! Проверьте email для получения кода отслеживания.');
          }}
        />
      )}
    </>
  );
}

// Компонент страницы категории
function CategoryPage({ service, formatPrice }) {
  return (
    <div className="space-y-8">
      {/* Заголовок категории */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.h1 || service.name}</h1>
        <p className="text-gray-700 text-lg">{service.description}</p>
      </div>

      {/* Подкатегории/услуги */}
      {service.children && service.children.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {service.children[0]?.isCategory ? 'Подкатегории' : 'Услуги'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.children.map((child) => (
              <Link
                key={child._id}
                href={`/services/${encodeURIComponent(child.slug)}`}
                className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-6 border border-gray-300 hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{child.name}</h3>
                  {!child.isCategory && child.price && (
                    <span className="text-blue-600 font-bold">{formatPrice(child.price)}</span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mb-4">{child.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-medium">
                    {child.isCategory ? 'Смотреть все' : 'Подробнее'}
                  </span>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SEO контент */}
      {service.content && (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-300">
          <div
            className="prose prose-lg max-w-none"
            style={{ color: '#374151' }}
            dangerouslySetInnerHTML={{ __html: service.content }}
          />
        </div>
      )}
    </div>
  );
}

// Компонент страницы услуги
function ServicePage({ service, activeTab, setActiveTab, handleBookingClick, formatPrice }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Основной контент */}
      <div className="lg:col-span-2 space-y-8">
        {/* Навигация по вкладкам */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-300">
          <div className="border-b border-gray-300">
            <nav className="flex -mb-px">
              {['description', 'process', 'features', 'faq'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                    ? `border-blue-600 text-white-600`
                    : 'border-transparent text-white-600 hover:text-white-900'
                    }`}
                >
                  {getTabName(tab)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {renderTabContent(service, activeTab)}
          </div>
        </div>

        {/* Особенности */}
        {service.features && service.features.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Что входит в услугу</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0 border border-blue-200">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO контент */}
        {service.content && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Подробное описание</h2>
            <div
              className="prose prose-lg max-w-none"
              style={{ color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: service.content }}
            />
          </div>
        )}
      </div>

      {/* Сайдбар */}
      <div className="space-y-8">
        {/* Цена и запись */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-300">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(service.price)}</div>
            <p className="text-gray-600">Стоимость услуги</p>
          </div>

          <button
            onClick={handleBookingClick}
            className="w-full py-3 rounded-lg transition-colors font-semibold mb-4 shadow-md hover:shadow-lg"
            style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
          >
            Записаться на ремонт
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">или позвоните</p>
            <a href="tel:+79115018828" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors block">
              +7 (911) 501-88-28
            </a>
            <a href="tel:+79115010696" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors block mt-1">
              +7 (911) 501-06-96
            </a>
          </div>
        </div>

        {/* Города */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-300">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Обслуживаем
          </h3>
          <ul className="space-y-2">
            {geoKeywords.map((city, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">{city}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Время работы */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Время работы</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Пн-Пт:</span>
              <span className="font-semibold text-gray-900">10:00-19:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Сб-Вс:</span>
              <span className="font-semibold text-gray-900">Выходные</span>
            </div>
          </div>
          <button
            className="w-full mt-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-colors"
            style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
          >
            Онлайн запись 24/7
          </button>
        </div>
      </div>
    </div>
  );
}

// Вспомогательные функции
function getTabName(tab) {
  const names = {
    description: 'Описание услуги',
    process: 'Процесс ремонта',
    features: 'Что входит',
    faq: 'Вопросы'
  };
  return names[tab] || tab;
}

function renderTabContent(service, tab) {
  switch (tab) {
    case 'description':
      return (
        <div>
          <p className="text-gray-700 mb-4">{service.description}</p>
          {service.content && (
            <div
              className="mt-4 prose prose-lg"
              style={{ color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: service.content }}
            />
          )}
        </div>
      );

    case 'process':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { step: 1, title: 'Диагностика', desc: 'Бесплатная диагностика оборудования' },
              { step: 2, title: 'Согласование', desc: 'Обсуждение стоимости и сроков' },
              { step: 3, title: 'Ремонт', desc: 'Профессиональный ремонт мастерами' },
              { step: 4, title: 'Тестирование', desc: 'Проверка всех функций после ремонта' }
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 rounded-xl p-6 border border-gray-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 border border-blue-200">
                  <span className="text-blue-600 font-bold">{item.step}</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h4>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'features':
      return service.features ? (
        <ul className="space-y-3">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-800">{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Особенности не указаны</p>
      );

    case 'faq':
      return (
        <div className="space-y-4">
          {[
            { q: 'Сколько стоит диагностика?', a: 'Бесплатно при условии ремонта у нас' },
            { q: 'Какая гарантия?', a: 'До 12 месяцев на работу и запчасти' },
            { q: 'Сколько времени занимает ремонт?', a: 'Обычно 1-3 дня, зависит от сложности и наличия запчастей' }
          ].map((item, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{item.q}</h4>
              <p className="text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}