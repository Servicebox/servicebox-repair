// components/MainBanner/MainBanner.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from "./MainBanner.module.css";
import Form from '../Form/Form';

// Абсолютные пути для изображений
const Diagnostics = "/images/notorang.svg";
const Cleane = "/images/cleane.svg";
const Eplaceable = "/images/telpodmena.svg";
const Example1 = '/images/1ak.webp';
const Example2 = '/images/2ak.webp';
const Example3 = '/images/3ak.webp';
const Example4 = '/images/4ak.webp';

const promoImages = [Example1, Example2, Example3, Example4];

function PromoImageSlider() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const next = () => setCurrent((prev) => (prev + 1) % promoImages.length);
  const prev = () => setCurrent((prev) => (prev - 1 + promoImages.length) % promoImages.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlay(false);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX > 40) prev();
    if (diffX < -40) next();
    touchStartX.current = null;
  };

  // Автослайдер
  useEffect(() => {
    let interval;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % promoImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  return (
    <div 
      className={styles.promoSlider}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      itemScope
      itemType="https://schema.org/ImageGallery"
    >
      <div className={styles.seoContent} aria-hidden="true">
        <h1>Акции и специальные предложения ServiceBox</h1>
        <p>Сервисный центр ServiceBox регулярно проводит акции и предлагает специальные условия 
        на ремонт техники. Узнайте о текущих предложениях на ремонт iPhone, MacBook, ноутбуков и другой техники.</p>
      </div>
      
      <button className={`${styles.promoSliderArrow} ${styles.left}`} onClick={prev} aria-label="Предыдущий слайд">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className={styles.promoSliderViewport}>
        <div className={styles.promoSliderTrack} style={{ transform: `translateX(-${current * 100}%)` }}>
          {promoImages.map((img, i) => (
            <div className={styles.promoSliderSlide} key={i} itemScope itemType="https://schema.org/ImageObject">
              <div className={styles.imageWrapper}>
                <Image 
                  src={img} 
                  alt={`Акция на ремонт техники в Вологде ${i + 1}`} 
                  className={styles.promoSliderImg}
                  itemProp="contentUrl"
                  width={800}  // Добавлен явный width
                  height={400} // Добавлен явный height
                  priority={i === 0}
                  quality={90}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  unoptimized // Для WebP изображений
                />
              </div>
              <meta itemProp="name" content={`Акция ServiceBox Вологда ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
      
      <button className={`${styles.promoSliderArrow} ${styles.right}`} onClick={next} aria-label="Следующий слайд">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className={styles.promoSliderDots}>
        {promoImages.map((_, i) =>
          <button
            key={i}
            className={i === current ? styles.active : ''}
            onClick={() => setCurrent(i)}
            aria-label={`Перейти к слайду ${i + 1}`}
          />
        )}
      </div>
    </div>
  );
}

const cards = [
  {
    frontTitle: 'Подменный телефон',
    frontIcon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <path d="M12 18h.01"/>
      </svg>
    ),
    img: Eplaceable,
    frontHint: 'подробности на обороте',
    backText: 'Если ремонт займет некоторое время, мы предоставим вам временный телефон — вы всегда останетесь на связи!',
    schemaType: 'https://schema.org/Service'
  },
  {
    frontTitle: 'Незначительные поломки',
    frontIcon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    img: Cleane,
    frontHint: 'подробности на обороте',
    backText: 'Получите бесплатный ремонт незначительных поломок цифровой техники. Обращайтесь прямо сегодня!',
    schemaType: 'https://schema.org/Service'
  },
  {
    frontTitle: 'Бесплатная диагностика',
    frontIcon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
    ),
    img: Diagnostics,
    frontHint: 'подробности на обороте',
    backText: 'Бесплатно диагностируем любые устройства. На ноутбуки/ПК/видеокарты — платно только при отказе от ремонта (от 500 ₽).',
    schemaType: 'https://schema.org/Service'
  }
];

function FlipCard({ frontTitle, frontIcon, img, frontHint, backText, schemaType }) {
  const [flipped, setFlipped] = useState(false);
  
  return (
    <div 
      className={`${styles.flipCard} ${flipped ? styles.flipped : ''}`} 
      tabIndex={0}
      onClick={() => setFlipped(f => !f)} 
      onBlur={() => setFlipped(false)}
      itemScope
      itemType={schemaType}
    >
      <div className={styles.flipCardInner}>
        <div className={styles.flipCardFront}>
          <div className={styles.cardIcon}>{frontIcon}</div>
          <h2 itemProp="name">{frontTitle}</h2>
          <div className={styles.cardImage}>
            <Image
              src={img} 
              alt={frontTitle} 
              itemProp="image"
              width={120}  // Явно указан width
              height={120} // Явно указан height
              quality={85}
              unoptimized // Для SVG изображений
            />
          </div>
          <div className={styles.flipCardHint}>{frontHint}</div>
        </div>
        <div className={styles.flipCardBack}>
          <div className={styles.flipCardBackText} itemProp="description">
            {backText}
          </div>
          <button 
            className={styles.flipCardBackBtn} 
            type="button"
            onClick={e => { e.stopPropagation(); setFlipped(false); }}
            aria-label="Закрыть информацию"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MainBanner() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleSent = () => {
    setIsFormOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <section className={styles.mainBannerSection} itemScope itemType="https://schema.org/Service">
      <meta itemProp="name" content="ServiceBox - ремонт техники в Вологде" />
      <meta itemProp="description" content="Профессиональный ремонт iPhone, MacBook, ноутбуков и другой техники в Вологде. Бесплатная диагностика, гарантия на работы." />
      <div itemProp="areaServed" itemScope itemType="https://schema.org/City">
        <meta itemProp="name" content="Вологда" />
      </div>
      <div itemProp="hasOfferCatalog" itemScope itemType="https://schema.org/OfferCatalog">
        <meta itemProp="name" content="Услуги сервисного центра ServiceBox" />
        <meta itemProp="description" content="Ремонт Apple техники, замена компонентов, диагностика, восстановление после залития" />
      </div>
      
      {isFormOpen && <Form onClose={handleCloseForm} onSent={handleSent} />}
      
      <div className={styles.bannerContent}>
        <PromoImageSlider />
        
        <div className={styles.btnForm}>
          <button onClick={handleOpenForm} aria-label="Записаться на ремонт">
            Записаться на ремонт
          </button>
        </div>
        
        <div className={styles.mainBannerContent}>
          <div className={styles.mainBannerText}>
            <p className={styles.mainBannerPreTitle}>всегда на связи с вами</p>
            <h1 className={styles.mainBannerTitle}>
              Ремонт цифровой техники
              <span className={styles.titleAccent}> в Вологде</span>
            </h1>
            <p className={styles.mainBannerSubtitle}>
              Центр ремонта цифровой техники «Servicebox» оказывает услуги по ремонту всех видов цифровой техники в Вологде.
            </p>
            <button className={styles.mainBannerForm} onClick={handleOpenForm} aria-label="Получить бесплатную консультацию">
              <span className={styles.titleSpan}>Бесплатная консультация</span>
            </button>
          </div>
        </div>
        
        <div className={styles.flipCardRow}>
          {cards.map((card, i) => <FlipCard {...card} key={i} />)}
        </div>
      </div>
      
      <div className={styles.seoText} aria-hidden="true">
        <h2>ServiceBox</h2>
        <p>Наш сервисный центр специализируется на ремонте цифровой техники: 
        iPhone, iPad, MacBook, ноутбуков, компьютеров и другой электроники. Мы предлагаем качественный 
        ремонт с гарантией, используем оригинальные и качественные совместимые запчасти. 
        Наши сервисные центры расположены по адресам: г. Вологда, ул. Северная 7А, офис 405 и 
        г. Вологда, ул. Ленина 6. Работаем с 10:00 до 18:00 понедельник-пятница.</p>
      </div>
    </section>
  );
}