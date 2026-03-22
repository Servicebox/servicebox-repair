// components/ContactsRef/ContactsRef.js
'use client';

import { forwardRef } from 'react';
import { 
  faMobilePhone, 
  faMailBulk, 
  faMapLocation 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faVk, 
  faTelegram, 
  faWhatsapp 
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from "./ContactsRef.module.css";

const ContactsRef = forwardRef((props, ref) => {
  const handlePhoneCall = () => {
    window.location.href = "tel:+7 911 501 88 28"; 
  };

  const handleMailTo = () => {
    window.location.href = "mailto:servicebox35@gmail.com"; 
  };

  return (
    <section id="contactsRef" className={styles.contactsRef} ref={ref}>
      <div className={styles.contactsList}>
        <h2 className="animated-title">Наши контакты</h2>
      </div>
      <div className={styles.contactsListInfo}>
        <div onClick={handlePhoneCall} className={styles.contactsBlock}>
          <p className={styles.contactText}>
            <FontAwesomeIcon icon={faMobilePhone} className={styles.icon} />
            +7 911 501 88 28
          </p>
        </div>
        
        <div onClick={handleMailTo} className={styles.contactsBlock}>
          <p className={styles.contactsText}>
            <FontAwesomeIcon icon={faMailBulk} className={styles.icon} />
            servicebox35@gmail.com
          </p>
        </div>
        
        <div className={styles.contactsBlock}>
          <p className={styles.contactsText}>
            <FontAwesomeIcon icon={faMapLocation} className={styles.icon} />
            г. Вологда, ул. Северная, 7А, офис 405
          </p>
        </div>
        
        <div onClick={handlePhoneCall} className={styles.contactsBlock}>
          <p className={styles.contactText}>
            <FontAwesomeIcon icon={faMobilePhone} className={styles.icon} />
            +7 911 501 88 28
          </p>
        </div>
        
        <div onClick={handleMailTo} className={styles.contactsBlock}>
          <p className={styles.contactsText}>
            <FontAwesomeIcon icon={faMailBulk} className={styles.icon} />
            servicebox35@gmail.com
          </p>
        </div>
        
        <div className={styles.contactsBlock}>
          <p className={styles.contactsText}>
            <FontAwesomeIcon icon={faMapLocation} className={styles.icon} />
            г. Вологда, ул. Ленина, 6
          </p>
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
    </section>
  );
});

ContactsRef.displayName = 'ContactsRef';

export default ContactsRef;