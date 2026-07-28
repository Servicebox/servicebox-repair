'use client';

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

const Oplata = "/images/ruble.svg";
const Sbp = "/images/MNP.svg";
const Beznal = "/images/Payment methods.svg";
const Dolyami = '/images/Dolyame.svg';

const SERVICES_LINKS = [
  { href: '/services/phones', label: 'Ремонт смартфонов в Вологде' },
  { href: '/services/laptops', label: 'Ремонт ноутбуков в Вологде' },
  { href: '/services/tablets', label: 'Ремонт планшетов в Вологде' },
  { href: '/services/tv', label: 'Ремонт телевизоров в Вологде' },
  { href: '/services/videocards', label: 'Ремонт видеокарт в Вологде' },
  { href: '/services/consoles', label: 'Ремонт приставок в Вологде' },
];

const QUICK_LINKS = [
  { href: '/#repair-calculator', label: 'Калькулятор цен' },
  { href: '/price', label: 'Прайс-лист' },
  { href: '/brands', label: 'Все бренды' },
  { href: '/promotions-page', label: 'Акции и скидки' },
  { href: '/news', label: 'Новости' },
  { href: '/reviews', label: 'Отзывы клиентов' },
  { href: '/gallery', label: 'Наши работы' },
  { href: '/parts', label: 'Каталог запчастей' },
  { href: '/contacts', label: 'Контакты' },
];

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerNav}>
        {/* Колонка: Услуги */}
        <nav aria-label="Услуги сервисного центра" className={styles.navColumn}>
          <h3 className={styles.navTitle}>Услуги в Вологде</h3>
          <ul className={styles.navList}>
            {SERVICES_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.footerLink}>{label}</Link>
              </li>
            ))}
            <li>
              <Link href="/services" className={styles.footerLink}>Все услуги →</Link>
            </li>
          </ul>
        </nav>

        {/* Колонка: Быстрые ссылки */}
        <nav aria-label="Быстрые ссылки" className={styles.navColumn}>
          <h3 className={styles.navTitle}>Быстрые ссылки</h3>
          <ul className={styles.navList}>
            {QUICK_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.footerLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Колонка: Контакты */}
        <div className={styles.navColumn}>
          <h3 className={styles.navTitle}>Контакты</h3>
          <address className={styles.contactBlock}>
            <p className={styles.contactItem}>
              <span className={styles.contactIcon}>📍</span>
              <span>ул. Северная, д. 7А, ТЦ «КИТ», Вологда</span>
            </p>
            <p className={styles.contactItem}>
              <span className={styles.contactIcon}>📞</span>
              <a href="tel:+79115018828" className={styles.footerLink}>+7 (911) 501-88-28</a>
            </p>
            <p className={styles.contactItem}>
              <span className={styles.contactIcon}>📞</span>
              <a href="tel:+79115010696" className={styles.footerLink}>+7 (911) 501-06-96</a>
            </p>
            <p className={styles.contactItem}>
              <span className={styles.contactIcon}>🕐</span>
              <span>Ежедневно 10:00–20:00</span>
            </p>
          </address>

          <div className={styles.socials}>
            <a
              href="https://vk.com/servicebox35"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ВКонтакте ServiceBox"
            >
              ВКонтакте
            </a>
          </div>
        </div>

        {/* Колонка: Компания + Оплата */}
        <div className={styles.navColumn}>
          <h3 className={styles.navTitle}>О компании</h3>
          <p className={styles.footerText}>
            ООО «СЕРВИС БОКС»<br />
            ИНН: 3525475916<br />
            КПП: 352501001<br />
            ОГРН: 1213500018522
          </p>
          <Link href="/privacy-policy" className={`${styles.footerLink} ${styles.privacyLink}`}>
            Политика конфиденциальности
          </Link>
          <Link href="/oferta" className={`${styles.footerLink} ${styles.privacyLink}`}>
            Публичная оферта
          </Link>

          <h3 className={`${styles.navTitle} ${styles.paymentTitle}`}>Способы оплаты</h3>
          <div className={styles.paymentMethods}>
            <Image src={Beznal} alt="Безналичный расчёт" width={80} height={48} className={styles.paymentLogo} loading="lazy" decoding="async" />
            <Image src={Sbp} alt="СБП" width={80} height={48} className={styles.paymentLogo} loading="lazy" decoding="async" />
            <Image src={Dolyami} alt="Оплата Долями" width={80} height={48} className={styles.paymentLogo} loading="lazy" decoding="async" />
            <Image src={Oplata} alt="Наличные" width={80} height={48} className={styles.paymentLogo} loading="lazy" decoding="async" />
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerAuthor}>
          © {new Date().getFullYear()} ServiceBox Вологда · Ремонт цифровой техники с 2016 года
        </p>
        <p className={styles.footerSeo}>
          Сервисный центр в Вологде · ул. Северная, 7А ·{' '}
          <a href="tel:+79115018828" className={styles.footerLink}>+7 (911) 501-88-28</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
