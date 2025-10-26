'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapLocation, 
  faMobilePhone, 
  faMailBulk,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { 
  faVk, 
  faTelegram, 
  faWhatsapp 
} from '@fortawesome/free-brands-svg-icons';

import styles from "./Contacts.module.css";

const Contacts = forwardRef((props, ref) => {
  const handlePhoneCall = () => {
    window.location.href = "tel:+79115018828";
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
      <div className={styles.contactsContainer}>
        <div className={styles.contactsHeader}>
          <h2 className={styles.animatedTitle}>Контактная информация</h2>
          <p className={styles.contactsIntro}>
            Ищете профессиональный ремонт ноутбуков, видеокарт, материнских плат, смартфонов и планшетов? 
            Сервисный центр ServiceBox предлагает комплексные решения для вашей электроники. 
            Наши квалифицированные специалисты с многолетним опытом оперативно диагностируют 
            и устранят любые неисправности, используя оригинальные комплектующие и современное оборудование.
          </p>
        </div>

        <div className={styles.contactsGrid}>
          <div className={styles.contactsInfo}>
            <h2 className={styles.contactsSubtitle}>Как с нами связаться</h2>
            
            <div className={styles.contactsBlock} onClick={handlePhoneCall}>
              <div className={styles.contactsIconWrapper}>
                <FontAwesomeIcon icon={faMobilePhone} className={styles.contactsIcon} />
              </div>
              <div className={styles.contactsTextWrapper}>
                <h3 className={styles.contactsBlockTitle}>Телефон</h3>
                <p className={`${styles.contactsText} ${styles.contactsLink}`}>+7 (911) 501-88-28</p>
                <p className={styles.contactsNote}>Звонки принимаем ежедневно с 9:00 до 20:00</p>
              </div>
            </div>

            <div className={styles.contactsBlock} onClick={handleMailTo}>
              <div className={styles.contactsIconWrapper}>
                <FontAwesomeIcon icon={faMailBulk} className={styles.contactsIcon} />
              </div>
              <div className={styles.contactsTextWrapper}>
                <h3 className={styles.contactsBlockTitle}>Электронная почта</h3>
                <p className={`${styles.contactsText} ${styles.contactsLink}`}>servicebox35@gmail.com</p>
                <p className={styles.contactsNote}>Отвечаем в течение 1 рабочего дня</p>
              </div>
            </div>

            <div className={styles.contactsBlock}>
              <div className={styles.contactsIconWrapper}>
                <FontAwesomeIcon icon={faClock} className={styles.contactsIcon} />
              </div>
              <div className={styles.contactsTextWrapper}>
                <h3 className={styles.contactsBlockTitle}>Режим работы</h3>
                <p className={styles.contactsText}>Пн-Пт: 10:00 - 19:00</p>
                <p className={styles.contactsText}>Сб-Вс: Выходные дни</p>
              </div>
            </div>

            <div className={styles.contactsSocial}>
              <h3 className={styles.contactsSubtitle}>Мы в социальных сетях</h3>
              <div className={styles.socialGrid}>
                <a 
                  href="https://vk.com/servicebox35" 
                  className={styles.socialLink}
                  aria-label="Наша группа ВКонтакте"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faVk} />
                  <span>ВКонтакте</span>
                </a>
                <a 
                  href="https://wa.me/79062960353" 
                  className={styles.socialLink}
                  aria-label="Написать в WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>WhatsApp</span>
                </a>
                <a 
                  href="https://t.me/Tomkka" 
                  className={styles.socialLink}
                  aria-label="Написать в Telegram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faTelegram} />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>

          <div className={styles.contactsLocations}>
            <h2 className={styles.contactsSubtitle}>Наши сервисные центры в Вологде</h2>
            
            <div className={styles.locationCard} onClick={() => openMap("г. Вологда, ул. Северная, 7А, офис 405")}>
              <div className={styles.locationHeader}>
                <FontAwesomeIcon icon={faMapLocation} className={styles.locationIcon} />
                <h3 className={styles.locationTitle}>Центральный сервис</h3>
              </div>
              <p className={styles.locationAddress}>
                г. Вологда, ул. Северная, 7А, офис 405
              </p>
              <p className={styles.locationDescription}>
                Наш главный сервисный центр с полным циклом ремонтных работ. 
                Здесь проводится сложный ремонт материнских плат, замена чипов, 
                восстановление после залития жидкостью.
              </p>
              <button className={styles.locationMapBtn}>
                Открыть на карте
              </button>
            </div>
            
            <div className={styles.locationCard} onClick={() => openMap("г. Вологда, ул. Ленина, 6")}>
              <div className={styles.locationHeader}>
                <FontAwesomeIcon icon={faMapLocation} className={styles.locationIcon} />
                <h3 className={styles.locationTitle}>Сервис в центре города</h3>
              </div>
              <p className={styles.locationAddress}>
                г. Вологда, ул. Ленина, 6
              </p>
              <p className={styles.locationDescription}>
                Удобно расположенный сервис для быстрого ремонта: замена экранов, 
                батарей, разъемов зарядки. Работаем без предварительной записи 
                в удобное для вас время.
              </p>
              <button className={styles.locationMapBtn}>
                Открыть на карте
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contactsSeo}>
          <h2 className={styles.contactsSubtitle}>Профессиональный ремонт техники</h2>
          <p className={styles.locationDescription}>
            ServiceBox - это современный сервисный центр, специализирующийся 
            на ремонте ноутбуков, смартфонов, планшетов и другой электроники. 
          </p>
          
          <p className={styles.contactsSubtitle}>Наши преимущества:</p>
          <ul className={styles.contactsBenefits}>
            <li>
              Бесплатная диагностика всех устройств при согласии на ремонт
              <span className={styles.paid}>***</span>
            </li>
            <li>Гарантия от 1 месяца до 6 месяцев на все виды работ</li>
            <li>Использование оригинальных запчастей и качественных аналогов</li>
            <li>Срочный ремонт за 30-60 минут</li>
            <li>Опытные инженеры с сертификатами производителей</li>
            <li>Прозрачное ценообразование с фиксированной стоимостью</li>
          </ul>

          <p className={styles.locationDescription}>
            <span className={styles.paid}>***</span>
            <strong>Важно: при отказе от ремонта взимается плата за диагностику.</strong> В сложных случаях, когда диагностика требует 
            значительного времени (замена компонентов для тестирования, поиск 
            микротрещин на плате), при отказе от ремонта взимается плата за 
            диагностические работы от 500 до 1500 рублей
            <span className={styles.lowercase}> (зависит от сложности)</span>.
          </p>
        </div>

        <div className={styles.contactsNavigation}>
          <Link href="/services" className={styles.navLink}>Наши услуги</Link>
          <Link href="/" className={styles.navLink}>На главную</Link>
        </div>
      </div>
    </section>
  );
});

export default Contacts;