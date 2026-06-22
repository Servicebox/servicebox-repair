'use client';
import { useState, useEffect } from 'react';
import styles from './AnalyticsDashboard.module.css';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/visits?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка аналитики...</div>;
  }

  if (!stats) {
    return <div className={styles.error}>Ошибка при загрузке аналитики</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Аналитика посещений</h1>
        <div className={styles.periodSelector}>
          <label>Период:</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={1}>Сегодня</option>
            <option value={7}>Неделя</option>
            <option value={30}>Месяц</option>
          </select>
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.card}>
          <div className={styles.label}>Всего визитов</div>
          <div className={styles.value}>{stats.totalVisits}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Уникальные пользователи</div>
          <div className={styles.value}>{stats.uniqueUsers}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>По устройствам</h2>
        <div className={styles.list}>
          {Object.entries(stats.devices).map(([device, count]) => (
            <div key={device} className={styles.item}>
              <span>{device}</span>
              <span className={styles.count}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2>По браузерам</h2>
        <div className={styles.list}>
          {Object.entries(stats.browsers).map(([browser, count]) => (
            <div key={browser} className={styles.item}>
              <span>{browser}</span>
              <span className={styles.count}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2>Популярные страницы</h2>
        <div className={styles.list}>
          {Object.entries(stats.topPages)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([page, count]) => (
              <div key={page} className={styles.item}>
                <span className={styles.pageUrl}>{page}</span>
                <span className={styles.count}>{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
