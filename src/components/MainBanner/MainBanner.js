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
const Example5 = '/images/5ak.webp';
const Example6 = '/images/6ak.webp';
const Example7 = '/images/7ak.webp';

// Данные для слайдов с текстом поверх изображения
const promoSlides = [
  {
    img: Example1,
    title: 'Ремонт ноутбуков и компьютеров',
    subtitle: 'Скидка до 20% на первый ремонт',
    description: 'Только до конца месяца! Качественный ремонт с гарантией',
    accentColor: '#0F52BA'
  },
  {
    img: Example2,
    title: 'Бесплатная диагностика',
    subtitle: 'Для всех видов техники',
    description: 'Точная диагностика неисправностей от профессиональных мастеров',
    accentColor: '#002147'
  },
  {
    img: Example3,
    title: 'Ремонт игровых консолей и приставок',
    subtitle: 'Только оригинальные запчасти',
    description: 'Быстрое восстановление работоспособности вашего устройства',
    accentColor: '#073774'
  },
  {
    img: Example4,
    title: 'Ремонт Apple техники',
    subtitle: 'С гарантией качества',
    description: 'Используем только проверенные компоненты от производителей',
    accentColor: '#0F52BA'
  },
  {
    img: Example5,
    title: 'Ремонт видеокарт с последующим тестированием',
    subtitle: 'качественные комплектующие',
    description: 'Предоставляется полный отчет о проделанной работе и тестах',
    accentColor: '#002147'
  },
    {
    img: Example6,
   title: 'Подменный телефон',
    subtitle: 'На время ремонта',
    description: 'Останьтесь на связи даже во время ремонта вашего устройства',
    accentColor: '#002147'
  },
      {
    img: Example7,
   title: 'Ремонт телевизоров и мониторов',
    subtitle: 'Бесплатная диагностика',
    description: 'Точная диагностика и качественный ремонт вашей техники',
    accentColor: '#002147'
  }
];

function PromoImageSlider() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isTextVisible, setIsTextVisible] = useState(true);

  const next = () => {
    setIsTextVisible(false);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % promoSlides.length);
      setIsTextVisible(true);
    }, 300);
  };
  
  const prev = () => {
    setIsTextVisible(false);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + promoSlides.length) % promoSlides.length);
      setIsTextVisible(true);
    }, 300);
  };

  const goToSlide = (index) => {
    setIsTextVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setIsTextVisible(true);
    }, 300);
  };

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
        next();
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, current]);

  const currentSlide = promoSlides[current];

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
        <h1>Акции и специальные предложения Сервис Бокс</h1>
        <p>Сервисный центр Сервис Бокс регулярно проводит акции и предлагает специальные условия на ремонт техники.</p>
      </div>
      
      <button className={`${styles.promoSliderArrow} ${styles.left}`} onClick={prev} aria-label="Предыдущий слайд">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className={styles.promoSliderViewport}>
        <div className={styles.promoSliderTrack} style={{ transform: `translateX(-${current * 100}%)` }}>
          {promoSlides.map((slide, i) => (
            <div className={styles.promoSliderSlide} key={i} itemScope itemType="https://schema.org/ImageObject">
              <div className={styles.imageWrapper}>
                <Image 
                  src={slide.img} 
                  alt={slide.title}
                  className={styles.promoSliderImg}
                  itemProp="contentUrl"
                  width={1920}
                  height={1080}
                  priority={i === 0}
                  quality={90}
                  sizes="100vw"
                />
                <div className={styles.imageOverlay}></div>
              </div>
              {/* Текстовый блок поверх изображения */}
              <div className={`${styles.slideContent} ${isTextVisible ? styles.visible : ''}`}>
                <div className={styles.contentInner}>
                  <div className={styles.titleWrapper}>
                    <span className={styles.slideSubtitle} style={{ color: slide.accentColor }}>
                      {slide.subtitle}
                    </span>
                    <h2 className={styles.slideTitle}>
                      {slide.title}
                    </h2>
                    <p className={styles.slideDescription}>
                      {slide.description}
                    </p>
                  </div>
                  
                  <div className={styles.ctaWrapper}>
                    <button 
                      className={styles.primaryCta}
                      onClick={() => {
                        document.querySelector(`.${styles.mainBannerForm}`)?.click();
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '10px' }}>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Записаться на ремонт
                    </button>
                    <button 
                      className={styles.secondaryCta}
                      onClick={() => {
                        // Скролл к услугам или контактам
                        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '10px' }}>
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Наши услуги
                    </button>
                  </div>
                </div>
              </div>
              <meta itemProp="name" content={slide.title} />
              <meta itemProp="description" content={slide.description} />
            </div>
          ))}
        </div>
      </div>
      
      <button className={`${styles.promoSliderArrow} ${styles.right}`} onClick={next} aria-label="Следующий слайд">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className={styles.promoSliderDots}>
        {promoSlides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.active : ''}`}
            onClick={() => goToSlide(i)}
            aria-label={`Перейти к слайду ${i + 1}`}
          >
            <div className={styles.dotInner}></div>
          </button>
        ))}
      </div>
      
      <div className={styles.slideCounter}>
        <span className={styles.currentSlide}>0{current + 1}</span>
        <span className={styles.slideDivider}>/</span>
        <span className={styles.totalSlides}>0{promoSlides.length}</span>
      </div>
    </div>
  );
}

const cards = [
  {
    frontTitle: 'Подменный телефон',
    frontIcon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              width={130}
              height={130}
              quality={85}
              unoptimized
              priority
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
        
        <div className={styles.mainBannerContent}>
          <div className={styles.mainBannerText}>
            <p className={styles.mainBannerPreTitle}>Профессиональный сервисный центр</p>
            <h1 className={styles.mainBannerTitle}>
              Ремонт цифровой техники
              <span className={styles.titleAccent}> в Вологде</span>
            </h1>
            <p className={styles.mainBannerSubtitle}>
              Центр ремонта цифровой техники «Сервис Бокс» оказывает услуги по ремонту всех видов цифровой техники в Вологде. 
              Гарантия на работы, использование качественных запчастей и профессиональный подход.
            </p>
            <div className={styles.ctaButtons}>
              <button className={`${styles.mainBannerForm} ${styles.primary}`} onClick={handleOpenForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Записаться на ремонт
              </button>
              <button className={`${styles.mainBannerForm} ${styles.secondary}`} onClick={() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' })}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Контакты
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.flipCardRow}>
          {cards.map((card, i) => <FlipCard {...card} key={i} />)}
        </div>
      </div>
      
      <div className={styles.seoText} aria-hidden="true">
        <h2>Сервис Бокс</h2>
        <p>Наш сервисный центр специализируется на ремонте цифровой техники: iPhone, iPad, MacBook, ноутбуков, компьютеров и другой электроники.</p>
      </div>
    </section>
  );
}