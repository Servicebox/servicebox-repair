'use client';

import { forwardRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import script from "next/script";
import styles from './About.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';

// ✅ Структурированные данные для ИИ и поисковиков
const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://servicebox35.ru#business",
      "name": "Сервисный центр ServiceBox (Сервис Бокс)",
      "alternateName": ["ServiceBox Вологда", "Ремонт техники Сервис Бокс"],
      "description": "Профессиональный ремонт ноутбуков, видеокарт, материнских плат, телефонов и техники Apple в Вологде. BGA-пайка, реболл, восстановление после залития. Опыт мастеров более 10 лет.",
      "url": "https://servicebox35.ru",
      "telephone": "+7-911-501-88-28",
      "email": "508828@bk.ru",
      "image": "https://servicebox35.ru/images/mestomastera1.webp",
      "priceRange": "₽₽",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "ул. Северная, д. 7А, 1 этаж, ТЦ КИТ",
        "addressLocality": "Вологда",
        "addressRegion": "Вологодская область",
        "postalCode": "160000",
        "addressCountry": "RU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 59.229445,
        "longitude": 39.878542
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "20:00"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "150",
        "bestRating": "5"
      },
      "sameAs": [
        "https://vk.com/servicebox35",
        "https://t.me/Tomkka"
      ]
    },
    {
      "@type": "Service",
      "serviceType": "Ремонт цифровой техники",
      "provider": { "@id": "https://servicebox35.ru#business" },
      "areaServed": "Вологда",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Услуги ремонта ServiceBox",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт видеокарт (BGA-пайка, реболл GPU, замена VRAM)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт ноутбуков (замена матриц, чистка, ремонт материнских плат)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт техники Apple (iPhone, iPad, MacBook)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт игровых приставок (PlayStation, Xbox, Nintendo Switch)" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Восстановление после залития жидкостью" } }
        ]
      }
    }
  ]
};

const AboutRef = forwardRef((_props, ref) => {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // ✅ Уникальные alt-тексты с ключевыми словами для SEO
  const photos = [

    { src: "/images/mestomastera1.webp", alt: "Рабочее место мастера по ремонту ноутбуков и видеокарт в сервисном центре ServiceBox Вологда" },
    { src: "/images/mestomastera2.webp", alt: "Оборудование для BGA-пайки и реболла видеочипов в мастерской ServiceBox" },
    { src: "/images/ya.webp", alt: "Мастер сервисного центра ServiceBox за диагностикой материнской платы" },
    { src: "/images/1.webp", alt: "Рабочая зона сервисного центра ServiceBox" },
    { src: "/images/7793.webp", alt: "Стенд для тестирования отремонтированных видеокарт и ноутбуков" },
    { src: "/images/vhod.webp", alt: "Зона приёма клиентов в сервисном центре ServiceBox на Северной 7А" },
    { src: "/images/2.webp", alt: "ресепшн мастерской ServiceBox" },
    { src: "/images/5060carta.webp", alt: "Ремонт видеокарты RTX на профессиональном оборудовании" },
    { src: "/images/magistr.webp", alt: "Инструменты для микропайки и диагностики электроники" },

  ];

  const Clock = "/images/clock.svg";
  const Card = "/images/Card.svg";
  const Secure = "/images/secure.svg";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="aboutRef" className={styles.container} ref={ref} itemScope itemType="https://schema.org/LocalBusiness">

      {/* ✅ JSON-LD для ИИ-поисковиков */}
      <script
        id="about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ABOUT_JSON_LD) }}
      />

      {/* Скрытые мета-данные Schema.org Microdata */}
      <meta itemProp="name" content="Сервисный центр ServiceBox (Сервис Бокс)" />
      <meta itemProp="telephone" content="+7-911-501-88-28" />
      <meta itemProp="email" content="508828@bk.ru" />
      <meta itemProp="url" content="https://servicebox35.ru" />
      <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress" style={{ display: 'none' }}>
        <span itemProp="streetAddress">ул. Северная, д. 7А, 1 этаж, ТЦ КИТ</span>
        <span itemProp="addressLocality">Вологда</span>
        <span itemProp="addressRegion">Вологодская область</span>
        <span itemProp="postalCode">160000</span>
        <span itemProp="addressCountry">RU</span>
      </div>

      <div className={styles.content}>
        {/* ✅ H1 содержит основную услугу + гео */}
        <h1 className={styles.title} itemProp="description">
          Ремонт ноутбуков, видеокарт и техники Apple в Вологде — Сервис Бокс
        </h1>

        <h2 className={styles.heading}>
          Профессиональный ремонт цифровой техники с гарантией до 24 месяцев
        </h2>

        {/* ✅ Фактологичный текст вместо маркетинга */}
        <p className={styles.subheading} itemProp="description">
          Сервисный центр <strong itemProp="name">ServiceBox</strong> выполняет сложный компонентный ремонт в Вологде:
          BGA-пайка видеочипов и хабов, реболл GPU, замена видеопамяти, устранение прогаров на материнских платах,
          восстановление техники после залития и механических повреждений. Ремонтируем ноутбуки, видеокарты,
          ПК, игровые консоли (PlayStation, Xbox), технику Apple, телефоны, планшеты и телевизоры.
        </p>

        <p className={styles.subheading}>
          Прозрачное ценообразование: стоимость работ согласуется до начала ремонта и не меняется после диагностики.
          Бесплатная диагностика при согласии на ремонт. Оплата только после проверки работоспособности устройства.
        </p>

        <h3 className={styles.heading}>Почему выбирают ServiceBox в Вологде</h3>
        <p className={styles.subheading}>
          Мастера с опытом более 10 лет берутся за случаи, от которых отказались другие сервисы.
          Используем профессиональное оборудование: инфракрасные BGA-станции, микроскопы, осциллографы.
          Онлайн-консультации через сайт и Telegram. Официальная гарантия на все виды работ и установленные запчасти.
        </p>

        {/* ✅ CTA с реальной ссылкой на автора (E-E-A-T) */}
        <div className={styles.quoteBlock}>
          <p className={styles.quote}>
            Есть замечания, пожелания или идеи по улучшению сервиса? Напишите напрямую руководителю в{' '}
            <a
              href="https://t.me/Tomkka"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quoteLink}
              aria-label="Написать руководителю ServiceBox в Telegram"
            >
              <FontAwesomeIcon icon={faTelegram} />
              <span>Telegram @Tomkka</span>
            </a>.
            Мы учитываем каждый отзыв клиентов для улучшения качества обслуживания.
          </p>
        </div>

        {/* ✅ Галерея с семантическими alt */}
        <div className={styles.galleryContainer}>
          <div className={styles.gallery}>
            <Image
              src={photos[currentPhoto].src}
              className={styles.image}
              alt={photos[currentPhoto].alt}
              width={500}
              height={300}
              priority={currentPhoto === 0}
              unoptimized
            />
            <div className={styles.dots} role="tablist" aria-label="Фотографии сервисного центра">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${currentPhoto === index ? styles.dotActive : ""}`}
                  onClick={() => setCurrentPhoto(index)}
                  role="tab"
                  aria-selected={currentPhoto === index}
                  aria-label={`Фото ${index + 1}: ${photo.alt}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ✅ Преимущества с иконками */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <Image src={Clock} className={styles.featureIcon} alt="" width={50} height={50} unoptimized aria-hidden="true" />
            <h3 className={styles.featureTitle}>Ремонт от 30 минут</h3>
            <p className={styles.featureText}>Срочный ремонт без очередей — большинство работ выполняем при вас</p>
          </div>

          <div className={styles.featureCard}>
            <Image src={Secure} className={styles.featureIcon} alt="" width={50} height={50} unoptimized aria-hidden="true" />
            <h3 className={styles.featureTitle}>Гарантия до 24 месяцев</h3>
            <p className={styles.featureText}>Официальная гарантия на все виды работ и установленные запчасти</p>
          </div>

          <div className={styles.featureCard}>
            <Image src={Card} className={styles.featureIcon} alt="" width={50} height={50} unoptimized aria-hidden="true" />
            <h3 className={styles.featureTitle}>Любые формы оплаты</h3>
            <p className={styles.featureText}>Наличные, карты, безнал для юрлиц — оплата после проверки устройства</p>
          </div>
        </div>
      </div>

      <nav className={styles.backButton} aria-label="Навигация">
        <ul className={styles.backList}>
          <li className={styles.backItem}>
            <Link href="/" className={styles.backLink}>← На главную</Link>
          </li>
        </ul>
      </nav>
    </section>
  );
});

AboutRef.displayName = "AboutRef";
export default AboutRef;