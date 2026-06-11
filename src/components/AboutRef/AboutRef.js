'use client';

import { forwardRef } from "react";

import {
  FaLaptop, FaTabletAlt, FaTv, FaMobile, FaBookReader, FaGamepad,
  FaDesktop, FaWrench, FaApple, FaRobot, FaRegClock, FaShieldAlt,
  FaCreditCard, FaMicroscope, FaFire, FaBath
} from "react-icons/fa";
import styles from "./AboutRef.module.css";

// Группируем услуги для лучшего восприятия и SEO
const serviceCategories = [
  {
    category: "Мобильная техника",
    items: [
      { icon: <FaApple />, title: "Ремонт iPhone", text: "Замена экранов, батарей, стекол. Сохраняем True Tone и Face ID." },
      { icon: <FaMobile />, title: "Смартфоны Android", text: "Samsung, Xiaomi, Huawei. Замена шлейфов, разъемов Type-C." },
      { icon: <FaTabletAlt />, title: "Планшеты и iPad", text: "Замена тачскринов, дисплейных модулей, восстановление после воды." },
    ]
  },
  {
    category: "Компьютеры и ноутбуки",
    items: [
      { icon: <FaLaptop />, title: "Ноутбуки", text: "Чистка, замена матриц, клавиатур. Ремонт материнских плат." },
      { icon: <FaDesktop />, title: "ПК и моноблоки", text: "Апгрейд, сборка, устранение перегрева, восстановление данных." },
      { icon: <FaWrench />, title: "Видеокарты", text: "Реболл GPU, замена VRAM, ремонт цепей питания после майнинга." },
    ]
  },
  {
    category: "Мультимедиа и другое",
    items: [
      { icon: <FaTv />, title: "Телевизоры", text: "Замена LED-подсветки, ремонт блоков питания и T-Con плат." },
      { icon: <FaGamepad />, title: "Игровые приставки", text: "PS4/PS5, Xbox, Switch. Чистка, замена термопасты, ремонт HDMI." },
      { icon: <FaRobot />, title: "Роботы-пылесосы", text: "Замена аккумуляторов, ремонт моторов и лидаров." },
    ]
  }
];

// JSON-LD для ИИ-поисковиков и Google/Yandex
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://servicebox35.ru#business",
      "name": "Сервисный центр ServiceBox",
      "description": "Профессиональный ремонт цифровой техники в Вологде. Основан в 2016 году. Специализация: BGA-пайка, восстановление после залития, замена экранов.",
      "image": "https://servicebox35.ru/images/logo.png",
      "telephone": "+7-911-501-88-28",
      "email": "servicebox35@gmail.com",
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
        "latitude": "59.229445",
        "longitude": "39.878542"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "150",
        "bestRating": "5"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "20:00"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Услуги ремонта техники",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт смартфонов" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт ноутбуков" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт видеокарт" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Ремонт телевизоров" } }
        ]
      }
    }
  ]
};

const AboutRef = forwardRef((_props, ref) => {
  return (
    <section id="aboutRef" className={styles.aboutRef} ref={ref}>
      {/* Скрытый JSON-LD для ИИ и поисковиков */}
      <script
        id="about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.aboutContent}>
        {/* Введение с фактами */}
        <div className={styles.introBlock}>
          <h2 className={styles.animatedTitle}>Сервисный центр ServiceBox в Вологде</h2>
          <p className={styles.leadText}>
            Работаем с <strong>2016 года</strong>. Выполняем сложный компонентный ремонт там, где другие предлагают только замену деталей.
            Официальный рейтинг <strong>5.0 на Яндекс.Картах</strong> на основе <strong>150+ отзывов</strong>.
          </p>
        </div>

        {/* Блок: Почему мы (УТП) */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaRegClock className={styles.featureIcon} />
            <h3>Экспресс от 30 минут</h3>
            <p>80% поломок (экраны, батареи, разъемы) устраняем в день обращения при вас.</p>
          </div>
          <div className={styles.featureCard}>
            <FaShieldAlt className={styles.featureIcon} />
            <h3>Гарантия до 24 месяцев</h3>
            <p>Выдаем официальный чек и гарантийный талон. Отвечаем за свою работу.</p>
          </div>
          <div className={styles.featureCard}>
            <FaCreditCard className={styles.featureIcon} />
            <h3>Оплата после ремонта</h3>
            <p>Никаких предоплат. Вы платите только когда устройство проверено и работает.</p>
          </div>
        </div>

        {/* Блок: Оборудование (Критически важно для ИИ и доверия) */}
        <div className={styles.equipmentBlock}>
          <h3 className={styles.sectionTitle}>Профессиональное оборудование</h3>
          <p className={styles.sectionSubtitle}>Мы не используем "кустарные" методы. В нашей лаборатории установлены:</p>
          <div className={styles.equipmentGrid}>
            <div className={styles.equipItem}>
              <FaFire className={styles.equipIcon} />
              <span>Инфракрасные и термовоздушные BGA-станции для пайки чипов</span>
            </div>
            <div className={styles.equipItem}>
              <FaBath className={styles.equipIcon} />
              <span>Ультразвуковые ванны для восстановления после залития жидкостью</span>
            </div>
            <div className={styles.equipItem}>
              <FaMicroscope className={styles.equipIcon} />
              <span>Лабораторные микроскопы для работы с микрокомпонентами</span>
            </div>
          </div>
        </div>

        {/* Блок: Услуги */}
        <div className={styles.repairServices}>
          <h2 className={styles.sectionTitle}>Что мы ремонтируем</h2>
          <div className={styles.categoriesWrapper}>
            {serviceCategories.map((cat, catIndex) => (
              <div key={catIndex} className={styles.categoryBlock}>
                <h3 className={styles.categoryTitle}>{cat.category}</h3>
                <div className={styles.servicesGrid}>
                  {cat.items.map((service, index) => (
                    <article className={styles.serviceCard} key={index}>
                      <div className={styles.serviceIconWrapper}>
                        {service.icon}
                      </div>
                      <div className={styles.serviceInfo}>
                        <h4 className={styles.serviceTitle}>{service.title}</h4>
                        <p className={styles.serviceText}>{service.text}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

AboutRef.displayName = "AboutRef";
export default AboutRef;