'use client';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faRubleSign } from '@fortawesome/free-solid-svg-icons';
import { BUSINESS } from '@/lib/constants';
import styles from './MobileStickyCta.module.css';

// Видна только на мобильных (см. media query в CSS-модуле) — на десктопе
// звонок и цены уже доступны в шапке, дублировать там нечего.
function MobileStickyCta() {
  return (
    <div className={styles.bar} role="group" aria-label="Быстрые действия">
      <a href={`tel:${BUSINESS.phones.primary}`} className={styles.callButton}>
        <FontAwesomeIcon icon={faPhone} />
        <span>Позвонить</span>
      </a>
      {/* /price — прайс-лист донорских плат для ремонта, а не цены на услуги.
          Услуги + цены на них — /services (см. пункт шапки "Услуги и цены"). */}
      <Link href="/services" className={styles.priceButton}>
        <FontAwesomeIcon icon={faRubleSign} />
        <span>Цены</span>
      </Link>
    </div>
  );
}

export default MobileStickyCta;
