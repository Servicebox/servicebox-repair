// components/BookingForm/BookingForm.js
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PrivacyCheckbox from '../PrivacyCheckbox/PrivacyCheckbox';
import styles from './BookingForm.module.css';

export default function BookingForm({ service, onClose, onBookingSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deviceModel: '',
    notes: ''
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!privacyAgreed) {
      setError('Необходимо согласие на обработку персональных данных');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Отправка в Telegram
      const telegramResponse = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          serviceName: service?.serviceName,
          deviceModel: formData.deviceModel,
          notes: formData.notes,
          source: 'BookingForm'
        })
      });

      const telegramResult = await telegramResponse.json();

      if (!telegramResponse.ok || !telegramResult.success) {
        throw new Error(telegramResult.error || 'Ошибка при отправке заявки');
      }

      // Дополнительно сохраняем в базу данных (если нужно)
      if (service?._id) {
        const dbResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            serviceId: service._id,
            serviceName: service.serviceName,
            userName: formData.name,
            userPhone: formData.phone,
            userEmail: formData.email,
            deviceModel: formData.deviceModel,
            notes: formData.notes
          })
        });

        if (!dbResponse.ok) {
          console.warn('Не удалось сохранить в базу данных, но заявка отправлена в Telegram');
        }
      }

      setSuccess(true);
      onBookingSuccess && onBookingSuccess({
        name: formData.name,
        phone: formData.phone,
        service: service?.serviceName
      });
      
      // Сбрасываем форму
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          deviceModel: '',
          notes: ''
        });
        setPrivacyAgreed(false);
        setSuccess(false);
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Ошибка при создании записи. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.phone && privacyAgreed;

  return (
    <div className={styles.bookingOverlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={styles.bookingForm}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Запись на услугу</h2>
          <button 
            onClick={onClose}
            className={styles.closeButton}
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {service && (
          <div className={styles.serviceInfo}>
            <h3>{service.serviceName}</h3>
            <p>{service.description}</p>
            <p className={styles.servicePrice}>Цена: {service.price}</p>
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h4>Запись успешно создана!</h4>
            <p>Мы свяжемся с вами для подтверждения</p>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className={styles.formContent}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={`${styles.formLabel} ${styles.required}`}>
                Имя *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Введите ваше имя"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={`${styles.formLabel} ${styles.required}`}>
                Телефон *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="your@email.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="deviceModel" className={styles.formLabel}>
                Модель устройства
              </label>
              <input
                type="text"
                id="deviceModel"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Например: iPhone 14 Pro"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.formLabel}>
                Дополнительная информация
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className={`${styles.formInput} ${styles.formTextarea}`}
                placeholder="Опишите проблему или оставьте комментарий..."
              />
            </div>

            {/* Чекбокс согласия */}
            <div className={styles.privacySection}>
              <PrivacyCheckbox 
                onAgreementChange={setPrivacyAgreed}
                required={true}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`${styles.submitButton} ${isSubmitting ? styles.loading : ''}`}
              >
                {isSubmitting ? 'Отправка...' : 'Записаться'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}