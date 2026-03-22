'use client';

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import styles from "./CookieMessage.module.css";

function CookieMessage() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Проверяем куки только на клиентской стороне
    const cookieConsent = Cookies.get("cookieConsent");
    if (cookieConsent !== "true") {
      setShowMessage(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("cookieConsent", "true", { expires: 30 });
    setShowMessage(false);
  };

  if (!showMessage) {
    return null;
  }

  return (
    <div className={styles.cookieMessage}>
      <div className={styles.cookieMessageText}>
        Продолжая пользоваться сайтом, я даю согласие на использование файлов cookie.
      </div>
      <button 
        className={styles.cookieMessageButton}
        onClick={handleAccept}
      >
        Принять
      </button>
    </div>
  );
}

export default CookieMessage;