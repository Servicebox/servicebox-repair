// app/services/[slug]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BookingForm from '@/components/BookingForm/BookingForm';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import styles from './services-detail.module.css';

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

  const serviceBreadcrumbs = service ? [
    { name: 'Главная', url: '/' },
    { name: 'Услуги', url: '/services' },
    ...(service.breadcrumbs || []),
    { name: service.h1 || service.name, url: `#` }
  ] : [];

  useBreadcrumbs(serviceBreadcrumbs, service?.h1 || service?.name);

  const addJsonLd = (serviceData) => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': serviceData.h1 || serviceData.name,
      'description': serviceData.description,
      'provider': {
        '@type': 'LocalBusiness',
        'name': 'ServiceBox',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Вологда',
          'addressRegion': 'Вологодская область'
        }
      },
      'areaServed': geoKeywords,
      'offers': {
        '@type': 'Offer',
        'price': extractPrice(serviceData.price),
        'priceCurrency': 'RUB'
      }
    };

    const oldScript = document.querySelector('script[type="application/ld+json"]');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Загружаем услугу...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.notFoundContainer}>
        <h1 className={styles.notFoundTitle}>Услуга не найдена</h1>
        <Link href="/services" className={styles.notFoundLink}>
          ← Вернуться к услугам
        </Link>
      </div>
    );
  }

  const isCategory = service.isCategory;
  const icon = getIconForCategory(service.name);

  return (
    <>
      <div className={styles.servicesDetailPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <div className={styles.heroLeft}>
                <div className={styles.geoBadge}>
                  <svg className={styles.geoBadgeIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className={styles.geoBadgeText}>Обслуживаем: {geoKeywords.join(', ')}</span>
                </div>

                <div className={styles.serviceHeader}>
                  <div className={styles.serviceIconWrapper}>
                    <Image
                      src={icon}
                      alt={service.name}
                      width={32}
                      height={32}
                      className={styles.serviceIcon}
                      priority
                    />
                  </div>
                  <div className={styles.serviceTitleBlock}>
                    <h1>{service.h1 || service.name}</h1>
                    <p>в {geoKeywords[0]}</p>
                  </div>
                </div>

                <p className={styles.serviceDescription}>
                  {service.description}
                </p>

                <div className={styles.heroFeatures}>
                  <div className={styles.heroFeature}>
                    <div className={styles.heroFeatureIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={styles.heroFeatureText}>Гарантия до 12 месяцев</span>
                  </div>
                  <div className={styles.heroFeature}>
                    <div className={styles.heroFeatureIcon}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3b82f6' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={styles.heroFeatureText}>Ремонт от 1 дня</span>
                  </div>
                </div>
              </div>

              <div className={styles.heroRight}>
                <div className={styles.priceCard}>
                  <div className={styles.priceCardContent}>
                    <div className={styles.priceValue}>{formatPrice(service.price)}</div>
                    <p className={styles.priceLabel}>Стоимость услуги</p>
                  </div>

                  <button
                    onClick={handleBookingClick}
                    className={styles.bookingButton}
                  >
                    Записаться онлайн
                  </button>

                  <div className={styles.phoneBlock}>
                    <p className={styles.phoneLabel}>или позвоните</p>
                    <a href="tel:+7-911-501-88-28" className={styles.phoneNumber}>
                      +7 (911) 501-88-28
                    </a>
                    <a href="tel:+79115010696" className={styles.phoneNumber}>
                      +7 (911) 501-06-96
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.mainContent}>
          {isCategory ? (
            <CategoryPage service={service} formatPrice={formatPrice} />
          ) : (
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
        <section className={styles.seoSection}>
          <div className={styles.seoContainer}>
            <h2 className={styles.seoTitle}>
              Профессиональный ремонт техники в {geoKeywords.join(', ')}
            </h2>
            <p className={styles.seoText}>
              Сервисный центр Сервис Бокс специализируется на профессиональном ремонте цифровой техники.
              Наши мастера имеют многолетний опыт работы с устройствами различных производителей.
            </p>
            <div className={styles.seoFeatures}>
              <div className={styles.seoFeature}>
                <div className={styles.seoFeatureIcon}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={styles.seoFeatureText}>Оригинальные запчасти</span>
              </div>
              <div className={styles.seoFeature}>
                <div className={styles.seoFeatureIcon}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3b82f6' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={styles.seoFeatureText}>Бесплатная диагностика</span>
              </div>
              <div className={styles.seoFeature}>
                <div className={styles.seoFeatureIcon}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#8b5cf6' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className={styles.seoFeatureText}>Опытные мастера</span>
              </div>
            </div>
          </div>
        </section>
      </div>

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

function CategoryPage({ service, formatPrice }) {
  return (
    <div className={styles.categoryPage}>
      <div className={styles.categoryHeader}>
        <h1 className={styles.categoryTitle}>{service.h1 || service.name}</h1>
        <p className={styles.categoryDescription}>{service.description}</p>
      </div>

      {service.children && service.children.length > 0 && (
        <div className={styles.servicesSection}>
          <h2 className={styles.servicesTitle}>
            {service.children[0]?.isCategory ? 'Подкатегории' : 'Услуги'}
          </h2>
          <div className={styles.servicesGrid}>
            {service.children.map((child) => (
              <Link
                key={child._id}
                href={`/services/${encodeURIComponent(child.slug)}`}
                className={styles.serviceCard}
              >
                <div className={styles.serviceCardHeader}>
                  <h3 className={styles.serviceCardTitle}>{child.name}</h3>
                  {!child.isCategory && child.price && (
                    <span className={styles.serviceCardPrice}>{formatPrice(child.price)}</span>
                  )}
                </div>
                <p className={styles.serviceCardDescription}>{child.description}</p>
                <div className={styles.serviceCardFooter}>
                  <span className={styles.serviceCardLink}>
                    {child.isCategory ? 'Смотреть все' : 'Подробнее'}
                  </span>
                  <span className={styles.serviceCardArrow}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {service.content && (
        <div className={styles.servicesSection}>
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

function ServicePage({ service, activeTab, setActiveTab, handleBookingClick, formatPrice }) {
  return (
    <div className={styles.servicePageGrid}>
      <div className={styles.servicePageMain}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabsNav}>
            {['description', 'process', 'features', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
              >
                {getTabName(tab)}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {renderTabContent(service, activeTab)}
          </div>
        </div>

        {service.features && service.features.length > 0 && (
          <div className={styles.featuresSection}>
            <h2 className={styles.featuresTitle}>Что входит в услугу</h2>
            <div className={styles.featuresGrid}>
              {service.features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3b82f6' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {service.content && (
          <div className={styles.servicesSection}>
            <h2 className={styles.servicesTitle}>Подробное описание</h2>
            <div
              className="prose prose-lg max-w-none"
              style={{ color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: service.content }}
            />
          </div>
        )}
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sidebarCard}>
          <div className={styles.priceCardContent}>
            <div className={styles.priceValue}>{formatPrice(service.price)}</div>
            <p className={styles.priceLabel}>Стоимость услуги</p>
          </div>

          <button
            onClick={handleBookingClick}
            className={styles.bookingButton}
          >
            Записаться на ремонт
          </button>

          <div className={styles.phoneBlock}>
            <p className={styles.phoneLabel}>или позвоните</p>
            <a href="tel:+7-911-501-88-28" className={styles.phoneNumber}>
              +7 (911) 501-88-28
            </a>
            <a href="tel:+79115010696" className={styles.phoneNumber}>
              +7 (911) 501-06-96
            </a>
          </div>
        </div>

        <div className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#64748b' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Обслуживаем
          </h3>
          <ul className={styles.geoList}>
            {geoKeywords.map((city, index) => (
              <li key={index} className={styles.geoListItem}>
                <div className={styles.geoDot}></div>
                <span>{city}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>Время работы</h3>
          <div className={styles.scheduleList}>
            <div className={styles.scheduleItem}>
              <span className={styles.scheduleDay}>Пн-Вс:</span>
              <span className={styles.scheduleTime}>10:00-20:00</span>
            </div>
          </div>
          <button className={styles.bookingButton}>
            Онлайн запись 24/7
          </button>
        </div>
      </div>
    </div>
  );
}

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
          <p style={{ color: '#475569', marginBottom: '1rem', lineHeight: '1.7' }}>{service.description}</p>
          {service.content && (
            <div
              className="prose prose-lg mt-4"
              style={{ color: '#374151' }}
              dangerouslySetInnerHTML={{ __html: service.content }}
            />
          )}
        </div>
      );

    case 'process':
      return (
        <div className={styles.processGrid}>
          {[
            { step: 1, title: 'Диагностика', desc: 'Бесплатная диагностика оборудования' },
            { step: 2, title: 'Согласование', desc: 'Обсуждение стоимости и сроков' },
            { step: 3, title: 'Ремонт', desc: 'Профессиональный ремонт мастерами' },
            { step: 4, title: 'Тестирование', desc: 'Проверка всех функций после ремонта' }
          ].map((item) => (
            <div key={item.step} className={styles.processStep}>
              <div className={styles.processStepNumber}>{item.step}</div>
              <h4 className={styles.processStepTitle}>{item.title}</h4>
              <p className={styles.processStepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      );

    case 'features':
      return service.features ? (
        <ul className={styles.faqList}>
          {service.features.map((feature, index) => (
            <li key={index} className={styles.faqItem}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981', flexShrink: 0, marginTop: '0.125rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span style={{ color: '#475569', lineHeight: '1.6' }}>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: '#64748b' }}>Особенности не указаны</p>
      );

    case 'faq':
      return (
        <div className={styles.faqList}>
          {[
            { q: 'Сколько стоит диагностика?', a: 'Бесплатно при условии ремонта у нас' },
            { q: 'Какая гарантия?', a: 'До 12 месяцев на работу и запчасти' },
            { q: 'Сколько времени занимает ремонт?', a: 'Обычно 1-3 дня, зависит от сложности и наличия запчастей' }
          ].map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>{item.q}</h4>
              <p className={styles.faqAnswer}>{item.a}</p>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}