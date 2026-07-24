'use client';
import { useState } from 'react';
import styles from './Tracking.module.css';

const STATUS_LABELS = {
  new: 'Принят',
  diagnostics: 'Диагностика',
  waiting_approval: 'Ожидает согласования',
  waiting_parts: 'Ожидает запчасти',
  in_repair: 'В ремонте',
  quality_check: 'Проверка качества',
  ready: 'Готов к выдаче',
  issued: 'Выдан',
  cancelled: 'Отменён',
  client_declined: 'Клиент отказался',
};

const STATUS_CLASS = {
  new: 'statusPending',
  diagnostics: 'statusProgress',
  waiting_approval: 'statusPending',
  waiting_parts: 'statusPending',
  in_repair: 'statusProgress',
  quality_check: 'statusProgress',
  ready: 'statusDone',
  issued: 'statusDone',
  cancelled: 'statusCancelled',
  client_declined: 'statusCancelled',
};

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[STATUS_CLASS[status] ?? 'statusPending']}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function OrderCard({ order, expanded, onToggle }) {
  const device = [order.deviceBrand, order.deviceModel].filter(Boolean).join(' ') || order.deviceType;

  return (
    <li className={styles.card}>
      <div
        className={styles.cardHeader}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
        <div className={styles.cardMeta}>
          <h3 className={styles.deviceName}>{device || 'Устройство не указано'}</h3>
          <span className={styles.orderNumber}>
            Заказ <strong>{order.number}</strong>
          </span>
        </div>
        <div className={styles.cardRight}>
          <StatusBadge status={order.status} />
          <span className={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.cardBody}>
          <dl className={styles.details}>
            <div className={styles.detailRow}>
              <dt>Клиент</dt>
              <dd>{order.clientName}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Телефон</dt>
              <dd>{order.clientPhone}</dd>
            </div>
            <div className={styles.detailRow}>
              <dt>Принят</dt>
              <dd>{formatDate(order.createdAt)}</dd>
            </div>
            {order.dueDate && (
              <div className={styles.detailRow}>
                <dt>Срок готовности</dt>
                <dd>{formatDate(order.dueDate)}</dd>
              </div>
            )}
            {order.issuedAt && (
              <div className={styles.detailRow}>
                <dt>Выдан</dt>
                <dd>{formatDate(order.issuedAt)}</dd>
              </div>
            )}
            {order.defectDescription && (
              <div className={styles.detailRow}>
                <dt>Неисправность</dt>
                <dd>{order.defectDescription}</dd>
              </div>
            )}
            {order.masterComment && (
              <div className={styles.detailRow}>
                <dt>Комментарий мастера</dt>
                <dd>{order.masterComment}</dd>
              </div>
            )}
            {typeof order.finalCost === 'number' && order.finalCost > 0 && (
              <div className={styles.detailRow}>
                <dt>Стоимость</dt>
                <dd>{order.finalCost.toLocaleString('ru-RU')} ₽</dd>
              </div>
            )}
            {order.warrantyExpires && (
              <div className={styles.detailRow}>
                <dt>Гарантия до</dt>
                <dd>{formatDate(order.warrantyExpires)}</dd>
              </div>
            )}
          </dl>

          {order.history?.length > 0 && (
            <div className={styles.timeline}>
              <p className={styles.timelineTitle}>История статусов</p>
              <ul className={styles.timelineList}>
                {order.history.map((entry, i) => (
                  <li key={i} className={styles.timelineItem}>
                    <span className={`${styles.timelineDot} ${styles[STATUS_CLASS[entry.status] ?? 'statusPending']}`} />
                    <div className={styles.timelineBody}>
                      <span className={styles.timelineStatus}>{entry.statusLabel}</span>
                      {entry.comment && <span className={styles.timelineNote}>{entry.comment}</span>}
                      <time className={styles.timelineDate}>
                        {new Date(entry.date).toLocaleString('ru-RU', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!order.defectDescription && (
            <p className={styles.hint}>
              Укажите телефон при поиске, чтобы увидеть полную информацию по заказу.
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export default function PublicTrackingPage() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedNumber, setExpandedNumber] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim() && name.trim().length < 2) {
      setError('Введите номер телефона или фамилию (минимум 2 символа)');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setExpandedNumber(null);

    try {
      const response = await fetch('/api/tracking/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setResults(data.results);
      } else {
        setError(data.error || 'Заказы не найдены');
      }
    } catch {
      setError('Ошибка при поиске заказа. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Отследить статус ремонта</h1>
          <p className={styles.subtitle}>
            Введите номер телефона или фамилию, указанные при оформлении заказа
          </p>
        </div>

        <form onSubmit={handleSearch} className={styles.form}>
          <div className={styles.formRow}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Телефон, например +7 900 000-00-00"
              className={styles.input}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Фамилия"
              className={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Поиск…' : 'Найти заказ'}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {results && (
          <ul className={styles.list}>
            {results.map((order) => (
              <OrderCard
                key={order.number}
                order={order}
                expanded={expandedNumber === order.number}
                onToggle={() => setExpandedNumber((prev) => (prev === order.number ? null : order.number))}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
