'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from "./MainBanner.module.css";
import Form from '../Form/Form';

// ============================================================================
// ДАННЫЕ ДЛЯ TRUST-СИГНАЛОВ
// ============================================================================

const trustSignals = [
  { icon: '⚡', title: 'От 30 минут', desc: 'Срочный ремонт при вас' },
  { icon: '🛡️', title: 'Гарантия 24 мес', desc: 'Официально, на бумаге' },
  { icon: '💰', title: 'Без предоплаты', desc: 'Оплата после ремонта' },
];

const services = [
  { icon: '📱', name: 'Смартфоны' },
  { icon: '💻', name: 'Ноутбуки' },
  { icon: '📲', name: 'Планшеты' },
  { icon: '📺', name: 'Телевизоры' },
  { icon: '🎮', name: 'Видеокарты' },
  { icon: '🕹️', name: 'Приставки' },
];

// ============================================================================
// ОСНОВНОЙ КОМПОНЕНТ: MainBanner (Hero)
// ============================================================================

export default function MainBanner() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [freeSlotsToday, setFreeSlotsToday] = useState(3);

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

  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById('repair-calculator');

    if (calculatorSection) {
      calculatorSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: если калькулятор еще не смонтирован, ждем и пробуем снова
      console.warn('Калькулятор не найден, повторная попытка через 300мс...');
      setTimeout(() => {
        const retrySection = document.getElementById('repair-calculator');
        if (retrySection) {
          retrySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Последний fallback — скролл на примерную позицию
          window.scrollTo({ top: 900, behavior: 'smooth' });
        }
      }, 300);
    }
  };

  return (
    <section
      className={styles.mainBannerSection}
      itemScope
      itemType="https://schema.org/Service"
    >
      {/* Schema.org разметка */}
      <meta itemProp="name" content="ServiceBox - ремонт техники в Вологде" />
      <meta itemProp="description" content="Профессиональный ремонт iPhone, MacBook, ноутбуков и другой техники в Вологде. Бесплатная диагностика, гарантия до 24 месяцев." />
      <div itemProp="areaServed" itemScope itemType="https://schema.org/City">
        <meta itemProp="name" content="Вологда" />
      </div>

      {/* Модальное окно формы */}
      {isFormOpen && <Form onClose={handleCloseForm} onSent={handleSent} />}

      <div className={styles.bannerContent}>

        {/* === ЛЕВАЯ КОЛОНКА: ТЕКСТ + CTA === */}
        <div className={styles.heroLeft}>

          {/* Бейдж с социальным доказательством */}
          <div className={styles.heroBadge}>
            <div className={styles.badgeStars}>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
            <div className={styles.badgeText}>
              <strong>5.0</strong> на Яндекс.Картах · <strong>150+</strong> отзывов
            </div>
          </div>

          {/* Главный заголовок */}
          <h1 className={styles.heroTitle}>
            Починим вашу технику
            <span className={styles.titleAccent}> сегодня</span>
          </h1>

          {/* Подзаголовок */}
          <p className={styles.heroSubtitle}>
            Ремонт iPhone, MacBook, ноутбуков, телевизоров и PlayStation
            в Вологде. <strong>Опыт 10+ лет</strong>, гарантия до 24 месяцев.
          </p>

          {/* Trust-сигналы */}
          <div className={styles.trustSignals}>
            {trustSignals.map((signal, i) => (
              <div key={i} className={styles.trustItem}>
                <div className={styles.trustIcon}>{signal.icon}</div>
                <div className={styles.trustText}>
                  <div className={styles.trustTitle}>{signal.title}</div>
                  <div className={styles.trustDesc}>{signal.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA-кнопки */}
          <div className={styles.heroCTA}>
            <button
              className={`${styles.heroBtn} ${styles.primary}`}
              onClick={handleOpenForm}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Записаться на ремонт
            </button>

            <button
              className={`${styles.heroBtn} ${styles.secondary}`}
              onClick={scrollToCalculator}
            >
              <span>🧮</span>
              Рассчитать стоимость
            </button>
          </div>

          {/* Микродоказательство */}
          <div className={styles.heroMicro}>
            <div className={styles.microAvatars}>
              <div className={styles.avatar} style={{ background: '#3b82f6' }}>А</div>
              <div className={styles.avatar} style={{ background: '#ef4444' }}>М</div>
              <div className={styles.avatar} style={{ background: '#10b981' }}>Д</div>
              <div className={styles.avatar} style={{ background: '#f59e0b' }}>+</div>
            </div>
            <div className={styles.microText}>
              <strong>Починили 5000+</strong> устройств в Вологде с 2016 года
            </div>
          </div>

        </div>

        {/* === ПРАВАЯ КОЛОНКА: ВИЗУАЛ === */}
        <div className={styles.heroRight}>

          {/* Главная карточка с визуалом */}
          <div className={styles.heroVisual}>
            <div className={styles.visualGradient} />

            {/* Иконки услуг (сетка) */}
            <div className={styles.servicesGrid}>
              {services.map((svc, i) => (
                <div key={i} className={styles.serviceChip}>
                  <span className={styles.serviceIcon}>{svc.icon}</span>
                  <span className={styles.serviceName}>{svc.name}</span>
                </div>
              ))}
            </div>

            {/* Плавающий бейдж срочности */}
            <div className={styles.floatingBadge}>
              <div className={styles.pulse} />
              <div className={styles.floatingContent}>
                <div className={styles.floatingIcon}>🔥</div>
                <div className={styles.floatingText}>
                  <strong>{freeSlotsToday} свободных слота</strong>
                  <span>на сегодня</span>
                </div>
              </div>
            </div>

            {/* Плавающий бейдж гарантии */}
            <div className={styles.floatingBadgeBottom}>
              <div className={styles.guaranteeIcon}>🛡️</div>
              <div className={styles.guaranteeText}>
                <strong>Гарантия</strong>
                <span>до 24 месяцев</span>
              </div>
            </div>

          </div>

        </div>

      </div>
      <div className={styles.heroWave}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C240,100 480,0 720,40 C960,80 1200,20 1440,60 L1440,120 L0,120 Z"
            fill="#f5f7fa"
          />
        </svg>
      </div>

    </section>
  );
}