'use client';
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '@/components/contexts/AuthContext';
import headerLogo from "../../../public/favicon.webp";
import BurgerMenu from "../BurgerMenu/BurgerMenu";
import PhosphorCube from "../PhosphorCube/PhosphorCube";
import LoginSignup from "../LoginSignup/LoginSignup";
import GlobalSearch from '../GlobalSearch/GlobalSearch';
import HeaderTracking from "../HeaderTracking/HeaderTracking";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBasketShopping,
  faMobilePhone,
  faUser,
  faChevronDown,
  faSun,
  faMoon,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { faVk } from "@fortawesome/free-brands-svg-icons";
import styles from "./Header.module.css";
import { useTheme } from '@/hooks/useTheme';
import { useFontSize } from '@/hooks/useFontSize';
import { useHighContrast } from '@/hooks/useHighContrast';

function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const { fontSize, cycleFontSize } = useFontSize();
  const { isHighContrast, toggleHighContrast } = useHighContrast();

  const [menu, setMenu] = useState("home");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userMenuRef = useRef(null);

  // ✅ ИСПРАВЛЕНО: Логика подсветки активного пункта теперь совпадает с href
  useEffect(() => {
    if (pathname.includes('/contacts')) setMenu("contacts");
    else if (pathname.includes('/about')) setMenu("about");
    else if (pathname.includes('/services')) setMenu("services");
    else if (pathname.includes('/parts')) setMenu("parts");
    else if (pathname.includes('/gallery')) setMenu("gallery");
    else if (pathname.includes('/news')) setMenu("news");
    else if (pathname.includes('/promotions-page')) setMenu("promotions");
    else if (pathname.includes('/price')) setMenu("price");
    else if (pathname.includes('/depository-public')) setMenu("depository");
    else setMenu("home");
  }, [pathname]);

  // Оптимизированный обработчик скролла
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрытие меню пользователя при клике вне его
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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setShowUserMenu(false);
    try { await logout(); }
    catch (error) { console.error('Logout error:', error); }
    finally { setIsLoggingOut(false); }
  };

  const isMobile = typeof window !== 'undefined' ? window.matchMedia("(max-width: 768px)").matches : false;

  return (
    <>
      {/* Верхняя информационная панель */}
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
            <span className={styles.headerWorkHours}>Ежедневно: 10:00 - 20:00</span>
          </div>

          <div className={styles.headerSocials}>
            <a href="https://vk.com/servicebox35" className={`${styles.socialLink} ${styles.vk}`} target="_blank" rel="noopener noreferrer" aria-label="Мы ВКонтакте">
              <FontAwesomeIcon icon={faVk} />
            </a>
          </div>
        </div>
      </div>

      {/* Основная шапка */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          {/* Логотип */}
          <Link href="/" className={styles.headerLogoLink} aria-label="На главную страницу ServiceBox">
            <img src={headerLogo.src} alt="Логотип ServiceBox" className={styles.headerLogo} width="65" height="45" />
            <PhosphorCube size="sm" />
            <span className={styles.headerLogoText}>
              <span className={styles.headerLogoMain}>Сервис Бокс</span>
              <span className={styles.headerLogoSub}>Вологда</span>
            </span>
          </Link>

          {/* Навигация */}
          <nav className={styles.headerNav} aria-label="Основная навигация">
            <ul className={styles.headerNavList}>
              <li className={`${styles.headerNavItem} ${menu === "services" ? styles.active : ''}`}>
                <Link href="/services" className={styles.headerNavLink}>Услуги и цены</Link>
              </li>

              <li className={`${styles.headerNavItem} ${menu === "about" ? styles.active : ''}`}>
                <Link href="/about" className={styles.headerNavLink}>О нас</Link>
              </li>

              <li className={`${styles.headerNavItem} ${menu === "parts" ? styles.active : ''}`}>
                <Link href="/parts" className={styles.headerNavLink}>Каталог</Link>
              </li>

              <li className={`${styles.headerNavItem} ${menu === "gallery" ? styles.active : ''}`}>
                <Link href="/gallery" className={styles.headerNavLink}>Фото работ</Link>
              </li>

              {/* Выпадающее меню */}
              <li className={`${styles.headerNavItem} ${styles.dropdown}`}>
                <button className={styles.headerNavLink} aria-haspopup="true">
                  Ещё <FontAwesomeIcon icon={faChevronDown} size="xs" />
                </button>
                <ul className={styles.dropdownMenu}>
                  <li><Link href="/news" className={styles.dropdownItem}>Новости</Link></li>
                  <li><Link href="/promotions-page" className={styles.dropdownItem}>Акции</Link></li>
                  <li><Link href="/price" className={styles.dropdownItem}>Прайс-лист</Link></li>
                  <li><Link href="/depository-public" className={styles.dropdownItem}>Схемы/Bios</Link></li>
                  <li>
                    <a href="https://pm-31768.promaster.app/index_cl" target="_blank" rel="noopener noreferrer" className={styles.dropdownItem}>
                      Статус ремонта
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          {/* Действия справа */}
          <div className={styles.headerActions}>
            <HeaderTracking />

            {user ? (
              <div className={styles.navUserGroup} ref={userMenuRef}>
                <button
                  className={styles.navUserIcon}
                  aria-label="Личный кабинет"
                  aria-expanded={showUserMenu}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <FontAwesomeIcon icon={faUser} />
                  {!isMobile && <span className={styles.navUsername}>{user.username || (user.role === "admin" ? "Админ" : "Пользователь")}</span>}
                </button>

                {showUserMenu && (
                  <div className={styles.userMenuDropdown}>
                    <div className={styles.userMenuHeader}>
                      <span>Привет, {user.username || (user.role === "admin" ? "Админ" : "Пользователь")}</span>
                    </div>
                    <Link href="/profile" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>Профиль</Link>
                    {user.role === "admin" && (
                      <Link href="/admin-panel" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>Админ-панель</Link>
                    )}
                    <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout} disabled={isLoggingOut}>
                      {isLoggingOut ? 'Выход...' : 'Выйти'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.headerLoginBtn} onClick={() => setIsLoginOpen(true)} aria-label="Войти в аккаунт">Вход</button>
            )}

            <Link href="/cart" className={styles.headerCartLink} aria-label="Корзина покупок">
              <FontAwesomeIcon icon={faBasketShopping} />
              {/* Счётчик корзины можно добавить позже, когда подключишь реальную логику */}
            </Link>

            <div
              role="group"
              aria-label="Настройки отображения"
              className={styles.a11yControls}
            >
              <button
                type="button"
                className={styles.themeToggle}
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
                aria-pressed={theme === 'dark'}
              >
                <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
              </button>

              <button
                type="button"
                className={styles.fontSizeBtn}
                onClick={cycleFontSize}
                aria-label={`Размер текста: ${fontSize === 'normal' ? 'нормальный' : fontSize === 'lg' ? 'большой' : 'очень большой'}`}
              >
                {fontSize === 'normal' ? 'A' : fontSize === 'lg' ? 'A+' : 'A++'}
              </button>

              <button
                type="button"
                className={styles.contrastToggle}
                onClick={toggleHighContrast}
                aria-label="Высокий контраст"
                aria-pressed={isHighContrast}
              >
                <FontAwesomeIcon icon={faEye} />
              </button>
            </div>

            <BurgerMenu />
          </div>
        </div>
      </header>

      {/* Модальные окна */}
      <LoginSignup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={() => setIsLoginOpen(false)} />
      <GlobalSearch />
    </>
  );
}

export default Header;