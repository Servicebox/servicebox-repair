'use client';

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobilePhone, faMailBulk, faMapLocation, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faVk, faTelegram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

import styles from "./BurgerMenu.module.css";
import logoImage from "../../../public/images/Servicebox6.svg";

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
    if (action === 'tel') window.location.href = "tel:+79115018828";
    if (action === 'mail') window.location.href = "mailto:servicebox35@gmail.com";
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
            <Link href="/about" className={styles.menuLink} onClick={toggleMenu}>О нас</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/services" className={styles.menuLink} onClick={toggleMenu}>Цены</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/gallery" className={styles.menuLink} onClick={toggleMenu}>Фото работ</Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/parts" className={styles.menuLink} onClick={toggleMenu}>Каталог товаров</Link>
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
            <a
              className={styles.statusButton}
              href="https://pm-31768.promaster.app/index_cl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Проверить статус ремонта
            </a>
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem} onClick={() => handleContactAction('mail')}>
              <FontAwesomeIcon icon={faMailBulk} />
              <span>servicebox35@gmail.com</span>
            </div>

            <div className={styles.addressBlock}>
              <p>
                <FontAwesomeIcon icon={faMapLocation} />
                г. Вологда, ул. Северная, 7А, офис 405
              </p>
              <div className={styles.contactItem} onClick={() => handleContactAction('tel')}>
                <FontAwesomeIcon icon={faMobilePhone} />
                <span>+7 911 501 88 28</span>
              </div>
            </div>

            <div className={styles.addressBlock}>
              <p>
                <FontAwesomeIcon icon={faMapLocation} />
                г. Вологда, ул. Ленина д.6, этаж 1
              </p>
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
            <a 
              href="https://wa.me/79062960353" 
              className={`${styles.socialLink} ${styles.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Написать нам в WhatsApp"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
            </a>
            <a 
              href="https://t.me/Tomkka" 
              className={`${styles.socialLink} ${styles.telegram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Написать нам в Telegram"
            >
              <FontAwesomeIcon icon={faTelegram} />
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default BurgerMenu;