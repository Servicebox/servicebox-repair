'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './MainBanner.module.css';
import Form from '../Form/Form';
import { BUSINESS } from '@/lib/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVk } from '@fortawesome/free-brands-svg-icons';

const trustPills = [
  'Гарантия 24 мес',
  'Без предоплаты',
  'От 30 минут',
  'Бесплатная диагностика',
];

const services = [
  { icon: '📱', name: 'Смартфоны', href: '/services/phones' },
  { icon: '💻', name: 'Ноутбуки', href: '/services/laptops' },
  { icon: '📲', name: 'Планшеты', href: '/services/tablets' },
  { icon: '📺', name: 'Телевизоры', href: '/services/tv' },
  { icon: '🎮', name: 'Видеокарты', href: '/services/videocards' },
  { icon: '🕹️', name: 'Приставки', href: '/services/consoles' },
];

const stats = [
  { value: '5 000+', label: 'устройств починено' },
  { value: '10 лет', label: 'опыта в Вологде' },
  { value: '5.0 ★', label: 'на Яндекс.Картах' },
];

const avatarColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
const avatarLabels = ['А', 'М', 'Д', '+'];

export default function MainBanner() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => {
    setIsFormOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeForm = () => {
    setIsFormOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToCalculator = () => {
    const el = document.getElementById('repair-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setTimeout(() => {
        document.getElementById('repair-calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  return (
    <section
      className={styles.mainBannerSection}
      itemScope
      itemType="https://schema.org/Service"
      suppressHydrationWarning
    >
      <meta itemProp="name" content="ServiceBox — ремонт техники в Вологде" />
      <meta itemProp="description" content="Профессиональный ремонт iPhone, MacBook, ноутбуков и другой техники в Вологде. Бесплатная диагностика, гарантия до 24 месяцев." />
      <meta itemProp="telephone" content={BUSINESS.phones.primary} />
      <div itemProp="areaServed" itemScope itemType="https://schema.org/City">
        <meta itemProp="name" content="Вологда" />
      </div>
      <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
        <meta itemProp="streetAddress" content={BUSINESS.mainAddress.street} />
        <meta itemProp="addressLocality" content={BUSINESS.mainAddress.city} />
        <meta itemProp="addressRegion" content={BUSINESS.mainAddress.region} />
        <meta itemProp="postalCode" content={BUSINESS.mainAddress.postalCode} />
        <meta itemProp="addressCountry" content={BUSINESS.mainAddress.country} />
      </div>

      {isFormOpen && <Form onClose={closeForm} onSent={closeForm} />}

      <div className={styles.bannerContent}>

        {/* LEFT: headline + trust + CTA */}
        <div className={styles.heroLeft}>

          <div className={styles.heroBadge}>
            <div className={styles.badgeStars}>⭐⭐⭐⭐⭐</div>
            <div className={styles.badgeText}>
              <strong>5.0</strong> на Яндекс.Картах · <strong>150+</strong> отзывов
            </div>
          </div>

          <h1 className={styles.heroTitle}>
            Починим вашу технику<br />
            <span className={styles.titleAccent}>быстро и надёжно</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Ремонт iPhone, MacBook, ноутбуков, телевизоров и PlayStation
            в Вологде. <strong>Опыт 10+ лет</strong>, гарантия до 24 месяцев.
          </p>

          <div className={styles.trustPills} aria-label="Наши преимущества">
            {trustPills.map((label) => (
              <div key={label} className={styles.trustPill}>
                <span className={styles.trustPillDot} aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>

          <div className={styles.heroCTA}>
            <button
              className={`${styles.heroBtn} ${styles.primary}`}
              onClick={openForm}
            >
              Записаться на ремонт
            </button>
            <button
              className={`${styles.heroBtn} ${styles.secondary}`}
              onClick={scrollToCalculator}
            >
              Рассчитать стоимость
            </button>
            <a
              href={BUSINESS.socials.vk}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.heroVkBtn}
              aria-label="Мы ВКонтакте"
            >
              <FontAwesomeIcon icon={faVk} />
            </a>
          </div>

          <div className={styles.heroMicro}>
            <div className={styles.microAvatars} aria-hidden="true">
              {avatarLabels.map((label, i) => (
                <div
                  key={i}
                  className={styles.avatar}
                  style={{ background: avatarColors[i] }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className={styles.microText}>
              <strong>Починили 5000+</strong> устройств в Вологде с 2016 года
            </div>
          </div>

        </div>

        {/* RIGHT: service card */}
        <div className={styles.heroRight}>
          <div className={styles.heroVisual}>

            <div className={styles.floatingRating} aria-label="Рейтинг 5 звёзд">
              <span>⭐</span> 5.0 — Яндекс.Карты
            </div>

            <div className={styles.visualCard}>
              <div className={styles.visualHeader}>
                <span className={styles.visualHeaderTitle}>Что мы ремонтируем</span>
                <span className={styles.visualHeaderBadge}>
                  <span className={styles.visualHeaderBadgeDot} aria-hidden="true" />
                  Принимаем заявки
                </span>
              </div>

              <nav className={styles.servicesGrid} aria-label="Категории ремонта">
                {services.map((svc) => (
                  <Link key={svc.href} href={svc.href} className={styles.serviceChip}>
                    <span className={styles.serviceIcon} aria-hidden="true">{svc.icon}</span>
                    <span className={styles.serviceName}>{svc.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className={styles.floatingSpeed}>
              ⚡ Готово от 30 минут
            </div>

          </div>
        </div>

      </div>

      {/* Stats strip */}
      <div className={styles.statsStrip} aria-label="Статистика сервиса">
        {stats.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
