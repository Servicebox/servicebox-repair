'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { Heart } from 'lucide-react';
import styles from './LikeButton.module.css';

export default function LikeButton({ entityId, entityType, initialCount = 0 }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!user || !entityId || !entityType) return;
    fetch(`/api/likes?entityId=${entityId}&entityType=${entityType}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setLiked(data.liked); setCount(data.likesCount); } })
      .catch(() => {});
  }, [user, entityId, entityType]);

  const handleClick = async () => {
    if (!user) return;

    // Оптимистичный update — меняем стейт немедленно
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(c => liked ? c - 1 : c + 1);

    try {
      const res = liked
        ? await fetch(`/api/likes?entityId=${entityId}&entityType=${entityType}`, {
            method: 'DELETE', credentials: 'include'
          })
        : await fetch('/api/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ entityId, entityType })
          });

      if (!res.ok && res.status !== 409) {
        // Rollback при ошибке
        setLiked(prevLiked);
        setCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    }
  };

  return (
    <button
      className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
      onClick={handleClick}
      disabled={!user}
      title={user ? 'Нравится' : 'Войдите, чтобы ставить лайки'}
      aria-pressed={liked}
      aria-label={`${liked ? 'Убрать лайк' : 'Поставить лайк'} (${count})`}
    >
      <Heart size={20} className={styles.icon} fill={liked ? 'currentColor' : 'none'} />
      <span className={styles.count}>{count}</span>
    </button>
  );
}
