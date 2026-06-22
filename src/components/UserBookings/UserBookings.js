'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './UserBookings.module.css';

const STATUS_LABELS = {
  pending:    'Ожидает подтверждения',
  confirmed:  'Подтверждена',
  in_progress:'В работе',
  completed:  'Завершена',
  canceled:   'Отменена',
};

const STATUS_CLASS = {
  pending:     'statusPending',
  confirmed:   'statusConfirmed',
  in_progress: 'statusInProgress',
  completed:   'statusCompleted',
  canceled:    'statusCanceled',
};

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[STATUS_CLASS[status] ?? 'statusPending']}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StatusTimeline({ history }) {
  if (!history?.length) return null;
  return (
    <div className={styles.timeline}>
      <p className={styles.timelineTitle}>История статусов</p>
      <ul className={styles.timelineList}>
        {history.map((entry, i) => (
          <li key={i} className={styles.timelineItem}>
            <span className={`${styles.timelineDot} ${styles[STATUS_CLASS[entry.status] ?? 'statusPending']}`} />
            <div className={styles.timelineBody}>
              <span className={styles.timelineStatus}>{STATUS_LABELS[entry.status] ?? entry.status}</span>
              {entry.note && <span className={styles.timelineNote}>{entry.note}</span>}
              <time className={styles.timelineDate}>
                {new Date(entry.changedAt).toLocaleString('ru-RU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (user) fetchUserBookings();
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      const response = await fetch('/api/bookings', { credentials: 'include' });
      if (response.ok) {
        const result = await response.json();
        let arr = [];
        if (result && Array.isArray(result.data)) arr = result.data;
        else if (Array.isArray(result)) arr = result;
        setBookings(arr);
      } else {
        setError('Ошибка при загрузке записей');
        setBookings([]);
      }
    } catch {
      setError('Ошибка при загрузке записей');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'canceled' }),
      });
      if (response.ok) {
        setBookings(prev =>
          prev.map(b =>
            b._id === bookingId
              ? {
                  ...b,
                  status: 'canceled',
                  statusHistory: [
                    ...(b.statusHistory ?? []),
                    { status: 'canceled', changedAt: new Date().toISOString(), note: 'Отменено пользователем' },
                  ],
                }
              : b
          )
        );
      }
    } catch {
      setError('Ошибка при отмене записи');
    }
  };

  const toggle = (id) => setExpanded(prev => (prev === id ? null : id));

  if (loading) {
    return (
      <div className={styles.wrap}>
        <h2 className={styles.title}>Мои записи на услуги</h2>
        <div className={styles.skeleton}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <h2 className={styles.title}>Мои записи на услуги</h2>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Мои записи на услуги</h2>

      {bookings.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>У вас пока нет записей на услуги</p>
          <p className={styles.emptyHint}>Запишитесь на услугу, чтобы отслеживать её статус здесь</p>
          <a href="/services" className={styles.emptyLink}>Записаться на услугу</a>
        </div>
      ) : (
        <ul className={styles.list}>
          {bookings.map((booking) => (
            <li key={booking._id} className={styles.card}>
              {/* Заголовок карточки */}
              <div className={styles.cardHeader} onClick={() => toggle(booking._id)} role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggle(booking._id)}>
                <div className={styles.cardMeta}>
                  <h3 className={styles.serviceName}>{booking.serviceName}</h3>
                  <span className={styles.tracking}>
                    Код: <strong>{booking.trackingCode}</strong>
                  </span>
                </div>
                <div className={styles.cardRight}>
                  <StatusBadge status={booking.status} />
                  <span className={styles.expandIcon}>{expanded === booking._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Детали */}
              {expanded === booking._id && (
                <div className={styles.cardBody}>
                  <dl className={styles.details}>
                    <div className={styles.detailRow}>
                      <dt>Дата записи</dt>
                      <dd>{new Date(booking.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
                    </div>
                    {booking.deviceModel && (
                      <div className={styles.detailRow}>
                        <dt>Устройство</dt>
                        <dd>{booking.deviceModel}</dd>
                      </div>
                    )}
                    {booking.notes && (
                      <div className={styles.detailRow}>
                        <dt>Примечание</dt>
                        <dd>{booking.notes}</dd>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <dt>Обновлено</dt>
                      <dd>{new Date(booking.updatedAt).toLocaleDateString('ru-RU')}</dd>
                    </div>
                  </dl>

                  {/* История статусов */}
                  <StatusTimeline history={booking.statusHistory} />

                  {/* Действия */}
                  <div className={styles.actions}>
                    <a href={`/tracking?code=${booking.trackingCode}`} className={styles.trackLink}>
                      Отследить онлайн
                    </a>
                    {booking.status !== 'canceled' && booking.status !== 'completed' && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => cancelBooking(booking._id)}
                      >
                        Отменить запись
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
