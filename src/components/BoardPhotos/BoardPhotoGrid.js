// src/components/BoardPhotos/BoardPhotoGrid.js
'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DEVICE_TYPES, deviceTypeLabel } from '@/lib/boardPhotos';
import styles from './BoardPhotoGrid.module.css';

export default function BoardPhotoGrid({ initialItems }) {
  const [items, setItems] = useState(initialItems ?? []);
  const [loading, setLoading] = useState(!initialItems);
  const [deviceType, setDeviceType] = useState('');
  const [q, setQ] = useState('');
  const firstRun = useRef(true);

  useEffect(() => {
    // FIX 1: на первом прогоне, если серверные данные пришли и фильтры нетронуты,
    // не делаем повторный запрос — список уже отрисован из RSC.
    if (firstRun.current) {
      firstRun.current = false;
      if (initialItems && deviceType === '' && q.trim() === '') {
        return;
      }
    }

    // FIX 3: дебаунс 300 мс + защита от гонки ответов (ignore-флаг в cleanup).
    let ignore = false;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (deviceType) params.set('deviceType', deviceType);
      if (q.trim()) params.set('q', q.trim());
      setLoading(true);
      fetch(`/api/board-photos?${params}`)
        .then(r => r.ok ? r.json() : { boardPhotos: [] })
        .then(d => { if (!ignore) setItems(d.boardPhotos || []); })
        .catch(() => { if (!ignore) setItems([]); })
        .finally(() => { if (!ignore) setLoading(false); });
    }, 300);
    return () => { ignore = true; clearTimeout(t); };
    // initialItems — неизменяемый проп с монтирования, в зависимостях не нужен
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceType, q]);

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <input
          className={styles.search}
          type="text"
          aria-label="Поиск по названию платы или чипу"
          placeholder="Поиск по названию платы или чипу…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <div className={styles.chips}>
          <button
            type="button"
            className={`${styles.chip} ${deviceType === '' ? styles.chipActive : ''}`}
            onClick={() => setDeviceType('')}
          >Все</button>
          {DEVICE_TYPES.filter(t => t !== 'other').map(t => (
            <button
              key={t}
              type="button"
              className={`${styles.chip} ${deviceType === t ? styles.chipActive : ''}`}
              onClick={() => setDeviceType(t)}
            >{deviceTypeLabel(t)}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className={styles.state}>Загрузка…</p>
      ) : items.length === 0 ? (
        <p className={styles.state}>Пока нет фотографий плат по этому запросу.</p>
      ) : (
        <ul className={styles.grid}>
          {items.map(p => (
            <li key={p.slug} className={styles.card}>
              <Link href={`/platy/${p.slug}`} className={styles.cardLink}>
                <span className={styles.thumbWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/board-photos/${p.slug}/image`}
                    width={p.imageWidth}
                    height={p.imageHeight}
                    alt={p.title}
                    className={styles.thumb}
                    loading="lazy"
                  />
                </span>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.cardMeta}>
                  <span className={styles.cardBadge}>{deviceTypeLabel(p.deviceType)}</span>
                  {p.chip && <span className={styles.cardChip}>{p.chip}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
