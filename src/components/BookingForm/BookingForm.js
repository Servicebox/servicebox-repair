// components/BookingForm/BookingForm.js
'use client';
import { useState, useEffect } from 'react';
import SuccessBookingModal from '@/components/SuccessBookingModal/SuccessBookingModal';
import PrivacyCheckbox from '../PrivacyCheckbox/PrivacyCheckbox';
import styles from './BookingForm.module.css';

const extractDeviceModel = (serviceName) => {
  const patterns = [
    /(iPhone\s+\d+\s*\w*)/i,
    /(iPad\s+\d+\s*\w*)/i,
    /(MacBook\s+\w*\s*\d+)/i,
    /(Samsung\s+Galaxy\s+\w+\s*\d*)/i,
    /(Xiaomi\s+\w+\s*\d*)/i,
    /(Huawei\s+\w+\s*\d*)/i,
    /(Apple\s+Watch\s+\w*\s*\d*)/i,
    /(Google\s+Pixel\s+\d+)/i
  ];

  for (let pattern of patterns) {
    const match = serviceName.match(pattern);
    if (match) return match[0];
  }

  return serviceName;
};

const BookingForm = ({ service, onClose, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    userName: '',
    userPhone: '',
    userEmail: '',
    deviceModel: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  useEffect(() => {
    if (service) {
      const autoDeviceModel = extractDeviceModel(service.name);
      setFormData(prev => ({
        ...prev,
        deviceModel: autoDeviceModel
      }));
    }
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!privacyAgreed) {
      setError('Необходимо согласие на обработку персональных данных');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 Отправка данных бронирования для услуги:', service.name);

      const bookingData = {
        serviceId: service._id,
        userName: formData.userName.trim(),
        userPhone: formData.userPhone.trim(),
        userEmail: formData.userEmail.trim(),
        serviceName: service.name,
        deviceModel: formData.deviceModel.trim(),
        notes: formData.notes.trim()
      };

      console.log('📦 Данные для отправки:', bookingData);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при создании записи');
      }

      // ИСПРАВЛЕНИЕ: Проверяем разные форматы ответа
      let bookingDataResult;

      if (result.success && result.data) {
        // Формат: {success: true, data: {...}}
        bookingDataResult = result.data;
      } else if (result._id) {
        // Формат: просто объект бронирования
        bookingDataResult = result;
      } else {
        bookingDataResult = result;
      }

      console.log('✅ Бронирование создано успешно:', bookingDataResult);

      // Телеграм уведомление
      try {
        await fetch('/api/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.userName,
            phone: formData.userPhone,
            description: `Запись на услугу: ${service.name}`,
            promotion: formData.notes
          }),
        });
        console.log('✅ Уведомление отправлено в Telegram');
      } catch (telegramError) {
        console.warn('⚠️ Ошибка Telegram:', telegramError);
      }

      // Показываем SuccessBookingModal
      setSuccessBooking(bookingDataResult);

      if (onBookingSuccess) {
        onBookingSuccess(bookingDataResult);
      }

    } catch (error) {
      console.error('❌ Ошибка при создании бронирования:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuccessModalClose = () => {
    setSuccessBooking(null);
    onClose();
  };

  return (
    <>
      {/* Основное окно бронирования */}
      <div className={styles.bookingOverlay}>
        <div className={styles.bookingForm}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Запись на услугу</h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>

          {service && (
            <div className={styles.serviceInfo}>
              <h3>Выбранная услуга:</h3>
              <p>{service.name}</p>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.formContent}>
            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.required}`}>
                Ваше имя
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                disabled={loading}
                className={styles.formInput}
                placeholder="Иван Иванов"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.required}`}>
                Телефон
              </label>
              <input
                type="tel"
                name="userPhone"
                value={formData.userPhone}
                onChange={handleChange}
                required
                disabled={loading}
                className={styles.formInput}
                placeholder="+7 (911) 501-88-28"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Email
              </label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                disabled={loading}
                className={styles.formInput}
                placeholder="ivan@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Модель устройства
              </label>
              <input
                type="text"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleChange}
                disabled={loading}
                className={styles.formInput}
                placeholder="Модель будет определена автоматически"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Дополнительные заметки
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
                className={`${styles.formInput} ${styles.formTextarea}`}
                placeholder="Опишите проблему или особые пожелания..."
                rows="3"
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <PrivacyCheckbox
                onAgreementChange={setPrivacyAgreed}
                required={true}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={styles.cancelButton}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || !privacyAgreed}
                className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
              >
                {loading ? 'Отправка...' : 'Записаться'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SuccessBookingModal показывается поверх всего */}
      {successBooking && (
        <SuccessBookingModal
          booking={successBooking}
          onClose={handleSuccessModalClose}
        />
      )}
    </>
  );
};

export default BookingForm;