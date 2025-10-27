// app/components/Header/Header.jsx
'use client';
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '@/components/contexts/AuthContext';
import headerLogo from "../../../public/images/Servicebox6.svg";
import BurgerMenu from "../BurgerMenu/BurgerMenu";
import LoginSignup from "../LoginSignup/LoginSignup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBasketShopping,
  faMobilePhone,
  faUser,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { faVk, faTelegram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import styles from "./Header.module.css";

function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth(); // Теперь используем правильный контекст
  
  const [menu, setMenu] = useState("shop");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userMenuRef = useRef();

  // Заглушка для корзины
  const getTotalCartItems = () => {
    return 0;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const path = pathname;
    if (path.includes('/contacts')) setMenu("contacts");
    else if (path.includes('/about')) setMenu("about");
    else if (path.includes('/services')) setMenu("price-list");
    else if (path.includes('/image-gallery-api')) setMenu("gallery");
    else if (path.includes('/parts')) setMenu("parts");
    else if (path.includes('/news')) setMenu("newsdetail");
    else if (path.includes('/promotions-page')) setMenu("promotionspage");
    else if (path.includes('/depository-public')) setMenu("depository");
    else if (path.includes('/chat-with-gpt')) setMenu("chatwithgpt");
    else setMenu("shop");
  }, [pathname]);

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Защита от повторных кликов
    
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    try {
      await logout(); // Теперь это logout из правильного AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isMobile = typeof window !== 'undefined' ? window.matchMedia("(max-width: 768px)").matches : false;

  return (
    <>
      <div className={`${styles.headerTopBar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerTopBarContainer}>
          <div className={styles.headerContacts}>
            <a href="tel:+79115018828" className={styles.headerContactLink}>
              <FontAwesomeIcon icon={faMobilePhone} />
              <span>+7 (911) 501-88-28</span>
            </a>
            <a href="tel:+79115010696" className={styles.headerContactLink}>
              <FontAwesomeIcon icon={faMobilePhone} />
              <span>+7 (911) 501-06-96</span>
            </a>
            <span className={styles.headerWorkHours}>Пн-Пт: 10:00 - 19:00</span>
          </div>

          <div className={styles.headerSocials}>
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
      </div>

      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.headerLogoLink} aria-label="На главную страницу ServiceBox">
            <img 
              src={headerLogo.src} 
              alt="Логотип ServiceBox - ремонт техники в Вологде" 
              className={styles.headerLogo} 
              width="65" 
              height="45" 
            />
            <span className={styles.headerLogoText}>
              <span className={styles.headerLogoMain}>ServiceBox</span>
              <span className={styles.headerLogoSub}>Вологда</span>
            </span>
          </Link>

          <nav className={styles.headerNav} aria-label="Основная навигация">
            <ul className={styles.headerNavList}>
              <li className={`${styles.headerNavItem} ${menu === "about" ? styles.active : ''}`}>
                <Link href="/about" className={styles.headerNavLink}>О нас</Link>
              </li>
              <li className={`${styles.headerNavItem} ${menu === "parts" ? styles.active : ''}`}>
                <Link href="/parts" className={styles.headerNavLink}>Каталог</Link>
              </li>
              <li className={`${styles.headerNavItem} ${menu === "prices" ? styles.active : ''}`}>
                <Link href="/services" className={styles.headerNavLink}>Цены</Link>
              </li>
              <li className={`${styles.headerNavItem} ${menu === "gallery" ? styles.active : ''}`}>
                <Link href="/gallery" className={styles.headerNavLink}>Фото работ</Link>
              </li>
              <li className={`${styles.headerNavItem} ${styles.dropdown}`}>
                <button className={styles.headerNavLink} aria-haspopup="true">
                  Ещё <FontAwesomeIcon icon={faChevronDown} size="xs" />
                </button>
                <ul className={styles.dropdownMenu}>
                  <li><Link href="/news" className={styles.dropdownItem}>Блог</Link></li>
                  <li><Link href="/promotions-page" className={styles.dropdownItem}>Акции</Link></li>
                  <li><Link href="/depository-public" className={styles.dropdownItem}>Схемы/Bios</Link></li>
                  <li>
                    <a 
                      href="https://pm-31768.promaster.app/index_cl" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.dropdownItem}
                    >
                      Статус ремонта
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          <div className={styles.headerActions}>
           {user ? (
    <div className={styles.navUserGroup} ref={userMenuRef}>
      <button 
        className={styles.navUserIcon} 
        aria-label="Личный кабинет"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <FontAwesomeIcon icon={faUser} />
        {!isMobile && <span className={styles.navUsername}>
          {user.username || (user.role === "admin" ? "Админ" : "Пользователь")}
        </span>}
      </button>

      {showUserMenu && (
        <div className={styles.userMenuDropdown}>
          <div className={styles.userMenuHeader}>
            <span>Привет, {user.username || (user.role === "admin" ? "Админ" : "Пользователь")}</span>
          </div>
          <Link 
            href="/profile" 
            className={styles.dropdownItem} 
            onClick={() => setShowUserMenu(false)}
          >
            Профиль
          </Link>
          {user.role === "admin" && (
            <Link 
              href="/admin-panel" 
              className={styles.dropdownItem} 
              onClick={() => setShowUserMenu(false)}
            >
              Админ-панель
            </Link>
          )}
          <button 
            className={`${styles.dropdownItem} ${styles.logoutBtn}`} 
            onClick={handleLogout} 
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Выход...' : 'Выйти'}
          </button>
        </div>
      )}
    </div>
            ) : (
              <button 
                className={styles.headerLoginBtn} 
                onClick={() => setIsLoginOpen(true)}
                aria-label="Войти в аккаунт"
              >
                Вход
              </button>
            )}

            <Link href="/cart" className={styles.headerCartLink} aria-label="Корзина покупок">
              <FontAwesomeIcon icon={faBasketShopping} />
              {getTotalCartItems() > 0 && (
                <span className={styles.headerCartCount}>{getTotalCartItems()}</span>
              )}
            </Link>
               

            <BurgerMenu />
          </div>
        </div>
      </header>

      <LoginSignup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Header;