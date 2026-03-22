// components/SuccessBookingModal/SuccessBookingModal.js
'use client';
import { useState } from 'react';
import styles from './SuccessBookingModal.module.css';

export default function SuccessBookingModal({ booking, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (booking?.trackingCode) {
      navigator.clipboard.writeText(booking.trackingCode)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Ошибка копирования:', err);
        });
    }
  };

  const handleTrack = () => {
    window.open(`/tracking?code=${booking.trackingCode}`, '_blank');
  };

  return (
    <div className={styles.successModal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>Запись успешно создана!</h2>
          <p className={styles.subtitle}>Сохраните код отслеживания</p>
        </div>
        
        <div className={styles.body}>
          <div className={styles.trackingCode}>
            <span className={styles.codeLabel}>Код отслеживания:</span>
            <p className={styles.codeValue}>{booking.trackingCode}</p>
            <button
              onClick={handleCopy}
              className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
            >
              {copied ? '✓ Скопировано' : 'Копировать код'}
            </button>
          </div>
          
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Услуга:</span>
              <span className={styles.detailValue}>{booking.serviceName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Клиент:</span>
              <span className={styles.detailValue}>{booking.userName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Телефон:</span>
              <span className={styles.detailValue}>{booking.userPhone}</span>
            </div>
            {booking.deviceModel && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Устройство:</span>
                <span className={styles.detailValue}>{booking.deviceModel}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.secondaryButton}>
            Закрыть
          </button>
          <button onClick={handleTrack} className={styles.primaryButton}>
            Отслеживать статус
          </button>
        </div>
      </div>
    </div>
  );
}