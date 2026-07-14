'use client';

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobilePhone, faMailBulk, faMapLocation, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faVk } from '@fortawesome/free-brands-svg-icons';

import styles from "./BurgerMenu.module.css";
import logoImage from "../../../public/favicon.webp";

function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleContactAction = (action) => {
    toggleMenu();
    if (action === 'tel') window.location.href = "tel:+7-911-501-88-28";
    if (action === 'mail') window.location.href = "mailto:508828@bk.ru";
  };

  return (
    <div className={`${styles.burgerMenu} ${isOpen ? styles.open : ""}`}>
      <button
        className={`${styles.burgerToggle} ${isOpen ? styles.open : ""}`}
        onClick={toggleMenu}
        aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={faBars} className={styles.burgerIcon} />
        <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} />
      </button>

      <div className={styles.menuOverlay} onClick={toggleMenu}></div>

      <nav className={styles.menuContent} aria-label="Мобильное меню">
        <div className={styles.menuHeader}>
          <Image
            className={styles.menuLogo}
            src={logoImage}
            alt="ServiceBox Logo"
            width={100}
            height={100}
            priority
          />
        </div>

        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <Link href="/services" className={styles.menuLink} onClick={toggleMenu}>Услуги и цены</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/about" className={styles.menuLink} onClick={toggleMenu}>О нас</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/gallery" className={styles.menuLink} onClick={toggleMenu}>Фото работ</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/parts" className={styles.menuLink} onClick={toggleMenu}>Каталог товаров</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/price" className={styles.menuLink} onClick={toggleMenu}>Прайс-лист</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/news" className={styles.menuLink} onClick={toggleMenu}>Новости</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href='/promotions-page' className={styles.menuLink} onClick={toggleMenu}>Акции</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/depository-public" className={styles.menuLink} onClick={toggleMenu}>Схемы/Bios</Link>
          </li>
        </ul>

        <div className={styles.menuFooter}>
          <div className={styles.statusCheck}>
            <Link className={styles.statusButton} href="/tracking" onClick={toggleMenu}>
              Проверить статус ремонта
            </Link>
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem} onClick={() => handleContactAction('mail')}>
              <FontAwesomeIcon icon={faMailBulk} />
              <span>508828@bk.ru</span>
            </div>

            <div className={styles.addressBlock}>
              <p>
                <FontAwesomeIcon icon={faMapLocation} />
                г. Вологда, ул. Северная, 7А, 1 этаж
              </p>
              <div className={styles.contactItem} onClick={() => handleContactAction('tel')}>
                <FontAwesomeIcon icon={faMobilePhone} />
                <span>+7 911 501 88 28</span>
              </div>
              <div className={styles.contactItem} onClick={() => handleContactAction('tel')}>
                <FontAwesomeIcon icon={faMobilePhone} />
                <span>+7 911 501 06 96</span>
              </div>
            </div>
          </div>

          <div className={styles.socialLinks}>
            <a
              href="https://vk.com/servicebox35"
              className={`${styles.socialLink} ${styles.vk}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать нам в ВКонтакте"
            >
              <FontAwesomeIcon icon={faVk} />
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default BurgerMenu;