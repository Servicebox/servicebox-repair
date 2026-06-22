'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { Bookmark } from 'lucide-react';
import styles from './FavoriteButton.module.css';

// itemId   — _id документа (string)
// itemType — 'product' | 'news' | 'photo' | 'promotion'
export default function FavoriteButton({ itemId, itemType, className = '' }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !itemId) return;
    fetch(
      `/api/favorites?itemType=${itemType}&checkId=${itemId}`,
      { credentials: 'include' }
    )
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isSaved !== undefined) setSaved(data.isSaved); })
      .catch(() => {});
  }, [user, itemId, itemType]);

  const handleClick = async (e) => {
    e.preventDefault();
    if (!user || loading) return;

    const prev = saved;
    setSaved(!saved);
    setLoading(true);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, itemType }),
      });

      if (!res.ok) {
        setSaved(prev);
      } else {
        const data = await res.json();
        setSaved(data.action === 'added');
      }
    } catch {
      setSaved(prev);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      className={`${styles.btn} ${saved ? styles.saved : ''} ${className}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? 'Убрать из избранного' : 'Добавить в избранное'}
      title={saved ? 'Убрать из избранного' : 'Сохранить в избранное'}
    >
      <Bookmark
        size={18}
        className={styles.icon}
        fill={saved ? 'currentColor' : 'none'}
      />
      <span className={styles.label}>{saved ? 'Сохранено' : 'Сохранить'}</span>
    </button>
  );
}
