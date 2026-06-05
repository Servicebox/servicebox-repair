'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocation,
  faMobilePhone,
  faEnvelope,
  faClock,
  faArrowRight,
  faCheckCircle,
  faPhoneVolume
} from '@fortawesome/free-solid-svg-icons';
import { faVk, faTelegram } from '@fortawesome/free-brands-svg-icons';

import styles from "./Contacts.module.css";

const Contacts = forwardRef((props, ref) => {
  const handlePhoneCall = (phone) => {
    window.location.href = `tel:${phone.replace(/\s|\(|\)|-/g, '')}`;
  };

  const handleMailTo = () => {
    window.location.href = "mailto:servicebox35@gmail.com";
  };

  const openMap = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://yandex.ru/maps/?text=${encodedAddress}`, '_blank');
  };

  return (
    <section id="contacts" className={styles.contacts} ref={ref}>
      <div className={styles.container}>

        {/* 🎯 HERO - Главный призыв к действию */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>📍 Сервисный центр в Вологде</span>
            <h1 className={styles.heroTitle}>
              Свяжитесь с нами <span className={styles.heroAccent}>прямо сейчас</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Бесплатная консультация и диагностика. Ответим на все вопросы и рассчитаем стоимость ремонта за 2 минуты.
            </p>

            {/* Крупные CTA кнопки */}
            <div className={styles.heroCta}>
              <a
                href="tel:+79115018828"
                className={styles.ctaPrimary}
                onClick={(e) => { e.preventDefault(); handlePhoneCall('+79115018828'); }}
              >
                <FontAwesomeIcon icon={faPhoneVolume} className={styles.ctaIcon} />
                <div className={styles.ctaContent}>
                  <span className={styles.ctaLabel}>Позвонить сейчас</span>
                  <span className={styles.ctaValue}>+7 (911) 501-88-28</span>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className={styles.ctaArrow} />
              </a>

              <a
                href="tel:+79115010696"
                className={styles.ctaSecondary}
                onClick={(e) => { e.preventDefault(); handlePhoneCall('+79115010696'); }}
              >
                <FontAwesomeIcon icon={faMobilePhone} className={styles.ctaIcon} />
                <div className={styles.ctaContent}>
                  <span className={styles.ctaLabel}>Второй номер</span>
                  <span className={styles.ctaValue}>+7 (911) 501-06-96</span>
                </div>
              </a>
            </div>

            <div className={styles.heroNote}>
              <FontAwesomeIcon icon={faClock} /> Работаем ежедневно с 10:00 до 20:00
            </div>
          </div>
        </div>

        {/* 📋 БЛОК КОНТАКТОВ */}
        <div className={styles.contactsGrid}>

          {/* Левая колонка - контактная информация */}
          <div className={styles.infoColumn}>
            <h2 className={styles.sectionTitle}>Как с нами связаться</h2>
            <p className={styles.sectionSubtitle}>
              Выберите удобный способ связи — ответим в течение 15 минут
            </p>

            {/* Телефон */}
            <div
              className={styles.contactCard}
              onClick={() => handlePhoneCall('+79115018828')}
            >
              <div className={styles.contactIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <FontAwesomeIcon icon={faMobilePhone} />
              </div>
              <div className={styles.contactContent}>
                <h3 className={styles.contactTitle}>Телефон</h3>
                <p className={styles.contactValue}>+7 (911) 501-88-28</p>
                <p className={styles.contactValue}>+7 (911) 501-06-96</p>
                <p className={styles.contactNote}>Звонки принимаем ежедневно с 10:00 до 20:00</p>
              </div>
              <div className={styles.contactArrow}>
                <FontAwesomeIcon icon={faArrowRight} />
              </div>
            </div>

            {/* Email */}
            <div
              className={styles.contactCard}
              onClick={handleMailTo}
            >
              <div className={styles.contactIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <div className={styles.contactContent}>
                <h3 className={styles.contactTitle}>Электронная почта</h3>
                <p className={styles.contactValue}>servicebox35@gmail.com</p>
                <p className={styles.contactNote}>Отвечаем в течение 1 рабочего дня</p>
              </div>
              <div className={styles.contactArrow}>
                <FontAwesomeIcon icon={faArrowRight} />
              </div>
            </div>

            {/* Режим работы */}
            <div className={styles.contactCard}>
              <div className={styles.contactIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <FontAwesomeIcon icon={faClock} />
              </div>
              <div className={styles.contactContent}>
                <h3 className={styles.contactTitle}>Режим работы</h3>
                <p className={styles.contactValue}>Ежедневно: 10:00 - 20:00</p>
                <p className={styles.contactNote}>Без выходных и перерывов</p>
              </div>
            </div>

            {/* Соцсети */}
            <div className={styles.socialSection}>
              <h3 className={styles.socialTitle}>Мы в социальных сетях</h3>
              <div className={styles.socialGrid}>
                <a
                  href="https://vk.com/servicebox35"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ВКонтакте"
                >
                  <FontAwesomeIcon icon={faVk} className={styles.socialIcon} />
                  <span>ВКонтакте</span>
                </a>
                <a
                  href="https://t.me/Tomkka"
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  <FontAwesomeIcon icon={faTelegram} className={styles.socialIcon} />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Правая колонка - адрес и карта */}
          <div className={styles.locationColumn}>
            <h2 className={styles.sectionTitle}>Наш сервисный центр</h2>
            <p className={styles.sectionSubtitle}>
              Приезжайте к нам — проведем диагностику и назовём точную стоимость
            </p>

            <div
              className={styles.locationCard}
              onClick={() => openMap("г. Вологда, ул. Северная, 7А, 1 этаж")}
            >
              <div className={styles.locationHeader}>
                <div className={styles.locationIconWrapper}>
                  <FontAwesomeIcon icon={faMapLocation} />
                </div>
                <div>
                  <h3 className={styles.locationTitle}>Сервис на Северной</h3>
                  <p className={styles.locationLandmark}>Ориентир: ТЦ "КИТ"</p>
                </div>
              </div>

              <div className={styles.locationAddress}>
                <p className={styles.addressText}>г. Вологда, ул. Северная, 7А</p>
                <p className={styles.addressFloor}>1 этаж</p>
              </div>

              <p className={styles.locationDescription}>
                Наш основной сервисный центр с полным циклом ремонтных работ.
                Здесь проводится сложный ремонт материнских плат, замена чипов,
                восстановление после залития, замена экранов и батарей.
              </p>

              <button className={styles.mapButton}>
                <FontAwesomeIcon icon={faMapLocation} />
                Открыть на карте
                <FontAwesomeIcon icon={faArrowRight} className={styles.buttonArrow} />
              </button>
            </div>

            {/* Мини-преимущества */}
            <div className={styles.miniFeatures}>
              <div className={styles.miniFeature}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.miniIcon} />
                <span>Бесплатная диагностика</span>
              </div>
              <div className={styles.miniFeature}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.miniIcon} />
                <span>Гарантия до 24 месяцев</span>
              </div>
              <div className={styles.miniFeature}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.miniIcon} />
                <span>Ремонт от 30 минут</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 CTA БЛОК */}
        <div className={styles.ctaBlock}>
          <div className={styles.ctaBlockContent}>
            <h2 className={styles.ctaBlockTitle}>Нужна срочная консультация?</h2>
            <p className={styles.ctaBlockText}>
              Позвоните нам прямо сейчас — расскажем о стоимости и сроках ремонта вашей техники
            </p>
            <div className={styles.ctaBlockButtons}>
              <a
                href="tel:+79115018828"
                className={styles.ctaBlockPrimary}
                onClick={(e) => { e.preventDefault(); handlePhoneCall('+79115018828'); }}
              >
                <FontAwesomeIcon icon={faPhoneVolume} />
                Позвонить
              </a>
            </div>
          </div>
        </div>

        {/* 📝 SEO БЛОК */}
        <div className={styles.seoSection}>
          <h2 className={styles.seoTitle}>Профессиональный ремонт техники в Вологде</h2>
          <p className={styles.seoText}>
            Сервис Бокс — это современный сервисный центр, специализирующийся
            на ремонте ноутбуков, смартфонов, планшетов, телевизоров и другой электроники.
            Наши квалифицированные специалисты с многолетним опытом оперативно диагностируют
            и устранят любые неисправности, используя оригинальные комплектующие и современное оборудование.
          </p>

          <h3 className={styles.seoSubtitle}>Наши преимущества:</h3>
          <ul className={styles.seoBenefits}>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.benefitIcon} />
              Бесплатная диагностика всех устройств при согласии на ремонт
              <span className={styles.paidMark}>***</span>
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.benefitIcon} />
              Гарантия от 1 месяца до 24 месяцев на все виды работ
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.benefitIcon} />
              Использование оригинальных запчастей и качественных аналогов
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.benefitIcon} />
              Срочный ремонт за 30-60 минут
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.benefitIcon} />
              Опытные инженеры с сертификатами производителей
            </li>
            <li>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.benefitIcon} />
              Прозрачное ценообразование с фиксированной стоимостью
            </li>
          </ul>

          <div className={styles.seoDisclaimer}>
            <span className={styles.paidMark}>***</span>
            <strong>Важно:</strong> при отказе от ремонта взимается плата за диагностику.
            В сложных случаях, когда диагностика требует значительного времени
            (замена компонентов для тестирования, поиск микротрещин на плате),
            при отказе от ремонта взимается плата за диагностические работы
            от 500 до 1500 рублей <em>(зависит от сложности)</em>.
          </div>
        </div>

      </div>
    </section>
  );
});

Contacts.displayName = 'Contacts';
export default Contacts;