//components/Aboutref/AboutRef.js
// components/AboutRef/AboutRef.js
'use client';

import { forwardRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from './AboutRef.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';

// ✅ Безопасное получение домена (избегает гидратации и undefined при билде)
const BASE_URL = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
  : 'https://servicebox35.ru';

const AboutRef = forwardRef(({ className = '' }, ref) => {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const photos = useMemo(() => [
    { src: "/images/mestomastera1.webp", alt: "Рабочее место мастера по ремонту ноутбуков и видеокарт в ServiceBox" },
    { src: "/images/mestomastera2.webp", alt: "Оборудование для BGA-пайки и реболла видеочипов в мастерской" },
    { src: "/images/ya.webp", alt: "Мастер ServiceBox за диагностикой материнской платы" },
    { src: "/images/1.webp", alt: "Рабочая зона сервисного центра" },
    { src: "/images/7793.webp", alt: "Стенд для тестирования отремонтированных видеокарт и ноутбуков" },
    { src: "/images/vhod.webp", alt: "Зона приёма клиентов ServiceBox на Северной 7А" },
    { src: "/images/2.webp", alt: "Ресепшн мастерской ServiceBox" },
    { src: "/images/5060carta.webp", alt: "Ремонт видеокарты RTX на профессиональном оборудовании" },
    { src: "/images/magistr.webp", alt: "Инструменты для микропайки и диагностики электроники" },
  ], []);

  const Clock = "/images/clock.svg";
  const Card = "/images/Card.svg";
  const Secure = "/images/secure.svg";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhoto(prev => (prev === photos.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);


  return (
    <section id="aboutRef" className={`${styles.container} ${className}`} ref={ref}>

      <script
        id="about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <div className={styles.content}>
        <h1 className={styles.title}>
          Ремонт ноутбуков, видеокарт и техники Apple в Вологде — Сервис Бокс
        </h1>

        <h2 className={styles.heading}>
          Профессиональный ремонт цифровой техники с гарантией до 24 месяцев
        </h2>

        <p className={styles.subheading}>
          Сервисный центр <strong>ServiceBox</strong> выполняет сложный компонентный ремонт в Вологде:
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

        <div className={styles.galleryContainer}>
          <div className={styles.gallery}>
            {/* ✅ Убран unoptimized для .webp (Next.js сам оптимизирует), добавлен sizes для LCP */}
            <Image
              src={photos[currentPhoto].src}
              className={styles.image}
              alt={photos[currentPhoto].alt}
              width={800}
              height={450}
              priority={currentPhoto === 0}
              sizes="(max-width: 768px) 100vw, 800px"
              style={{ objectFit: 'cover' }}
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

        <div className={styles.featuresGrid}>
          {/* ✅ SVG иконки остаются с unoptimized, так как Next.js не оптимизирует вектор */}
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