// src/components/HeaderTracking/HeaderTracking.js
'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark, faClock, faUser, faTools, faPhone, faCalendar } from "@fortawesome/free-solid-svg-icons";
import styles from './HeaderTracking.module.css';

export default function HeaderTracking() {
  const [isOpen, setIsOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    
    const code = trackingCode.trim().toUpperCase();
    if (!code) {
      setError('Пожалуйста, введите код отслеживания');
      return;
    }

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      console.log('🔍 Searching for booking with code:', code);
      
      const response = await fetch(`/api/bookings/track/${encodeURIComponent(code)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (data.success && data.booking) {
        setBooking(data.booking);
        setError('');
      } else {
        setError(data.error || 'Запись не найдена');
        setBooking(null);
      }
    } catch (err) {
      console.error('❌ Tracking error:', err);
      if (err.message.includes('404')) {
        setError('Запись с таким кодом не найдена');
      } else if (err.message.includes('500')) {
        setError('Ошибка сервера. Попробуйте позже.');
      } else {
        setError('Ошибка при поиске записи. Проверьте код и попробуйте снова.');
      }
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Ожидает подтверждения',
      'confirmed': '✅ Подтверждена', 
      'in_progress': '🔧 В работе',
      'completed': '🎉 Завершена',
      'canceled': '❌ Отменена'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return styles.statusCompleted;
      case 'in_progress': return styles.statusInProgress;
      case 'confirmed': return styles.statusConfirmed;
      case 'canceled': return styles.statusCanceled;
      default: return styles.statusPending;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Неверная дата';
    }
  };

  const resetForm = () => {
    setTrackingCode('');
    setBooking(null);
    setError('');
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={styles.trackingButton}
        aria-label="Отследить статус записи"
        title="Отследить статус записи"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <span className={styles.trackingText}>Отследить запись</span>
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={resetForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Отслеживание записи на услугу</h2>
              <button 
                onClick={resetForm}
                className={styles.closeButton}
                aria-label="Закрыть"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleTrack} className={styles.trackingForm}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Введите код отслеживания (например: BK123ABC45)"
                  className={styles.trackingInput}
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !trackingCode.trim()}
                  className={styles.trackButton}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Поиск...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                      Найти
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className={styles.errorMessage}>
                <FontAwesomeIcon icon={faXmark} className={styles.errorIcon} />
                <p>{error}</p>
              </div>
            )}

            {booking && (
              <div className={styles.bookingInfo}>
                <div className={styles.bookingHeader}>
                  <h3 className={styles.bookingTitle}>Информация о записи</h3>
                  <p className={styles.trackingCode}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    Код: <strong>{booking.trackingCode}</strong>
                  </p>
                </div>
                
                <div className={styles.statusSection}>
                  <div className={styles.statusHeader}>
                    <h4>
                      <FontAwesomeIcon icon={faClock} />
                      Статус записи
                    </h4>
                    <span className={`${styles.statusBadge} ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  
                  {booking.scheduledDate && (
                    <div className={styles.scheduledDate}>
                      <FontAwesomeIcon icon={faCalendar} />
                      Запланировано на: {formatDate(booking.scheduledDate)}
                    </div>
                  )}
                </div>

                <div className={styles.bookingDetails}>
                  <div className={styles.detailSection}>
                    <h4>
                      <FontAwesomeIcon icon={faTools} />
                      Детали услуги
                    </h4>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Услуга:</span>
                      <span className={styles.detailValue}>{booking.serviceName}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Устройство:</span>
                      <span className={styles.detailValue}>{booking.deviceModel || 'Не указано'}</span>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>
                      <FontAwesomeIcon icon={faUser} />
                      Информация о клиенте
                    </h4>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Имя:</span>
                      <span className={styles.detailValue}>{booking.userName}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>
                        <FontAwesomeIcon icon={faPhone} />
                        Телефон:
                      </span>
                      <span className={styles.detailValue}>{booking.userPhone}</span>
                    </div>
                    {booking.userEmail && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Email:</span>
                        <span className={styles.detailValue}>{booking.userEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {booking.notes && (
                  <div className={styles.notesSection}>
                    <h4>Заметки клиента</h4>
                    <p className={styles.notesText}>{booking.notes}</p>
                  </div>
                )}

                {booking.adminNotes && (
                  <div className={styles.adminNotesSection}>
                    <h4>Заметки от сервиса</h4>
                    <p className={styles.adminNotesText}>{booking.adminNotes}</p>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(booking.trackingCode);
                      alert('Код скопирован в буфер обмена!');
                    }}
                    className={styles.copyButton}
                  >
                    Скопировать код
                  </button>
                  <button 
                    onClick={resetForm}
                    className={styles.closeActionButton}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}

            {!booking && !error && !loading && (
              <div className={styles.helpText}>
                <p>Введите код отслеживания, который вы получили при записи на услугу.</p>
                <p className={styles.helpExample}>
                  Пример: <strong>BK123ABC45</strong> (обычно 10 символов)
                </p>
                <div className={styles.helpTips}>
                  <p><strong>Где найти код?</strong></p>
                  <ul>
                    <li>В личном кабинете (раздел "Мои записи")</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}