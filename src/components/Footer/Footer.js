'use client';

import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

// Импортируем изображения
import Oplata from "../../../public/images/ruble.svg";
import Sbp from "../../../public/images/MNP.svg";
import Beznal from "../../../public/images/Payment methods.svg";
import Dolyami from '../../../public/images/Dolyame.svg';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerInfo}>
          <div className={styles.companyInfo}>
            <h2 className={styles.infoTitle}>Реквизиты компании</h2>
            <p className={styles.footerText}>
              Название организации: ООО &quot;СЕРВИС БОКС&quot;<br />
              ИНН: 3525475916<br />
              КПП: 352501001<br />
              ОГРН: 1213800018522
            </p>
          </div>
          
          <div className={styles.footerLinks}>
            <h3 className={styles.footerLinkTitle}>
              Дубль по всем услугам, ценам, фото. Пишите в чат, если есть вопросы
            </h3>
            <ul>
              <li><Link href="/about" className={styles.footerLink}>Схемы/Bios</Link></li>
              <li><Link href="/services" className={styles.footerLink}>Цены</Link></li>
              <li><Link href="/gallery" className={styles.footerLink}>Наши фото</Link></li>
              <li><Link href="/news" className={styles.footerLink}>Блог</Link></li>
              <li><Link href="/promotions-page" className={styles.footerLink}>Акции</Link></li>
              <li><Link href="/parts" className={styles.footerLink}>Каталог</Link></li>
              <li><Link href="/depository-public" className={styles.footerLink}>Схемы/Bios</Link></li>
            </ul>
          </div>

          <Link href="/privacy-policy" className={styles.privacyLink}>
            Политика конфиденциальности
          </Link>
        </div>

        <div className={styles.paymentSection}>
          <h3 className={styles.paymentTitle}>Удобные способы оплаты</h3>
          <div className={styles.paymentMethods}>
            <Image 
              className={styles.paymentLogo}
              src={Beznal} 
              alt="Безналичный расчет"
              width={80}
              height={48}
            />
            <Image 
              className={styles.paymentLogo}
              src={Sbp} 
              alt="СБП"
              width={80}
              height={48}
            />
            <Image 
              className={styles.paymentLogo}
              src={Dolyami} 
              alt="Долями"
              width={80}
              height={48}
            />
            <Image 
              className={styles.paymentLogo}
              src={Oplata} 
              alt="Наличные"
              width={80}
              height={48}
            />
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerAuthor}>&copy; Кознова T.А. 2023</p>
      </div>
    </footer>
  );
}

export default Footer;