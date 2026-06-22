'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './CommentSection.module.css';

const LIMIT = 10;

function Avatar({ author }) {
  if (author?.avatar) {
    return <img src={author.avatar} alt="" className={styles.avatar} aria-hidden="true" />;
  }
  return (
    <span className={styles.avatarLetter} aria-hidden="true">
      {author?.username?.[0]?.toUpperCase() ?? '?'}
    </span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * targetId   — _id документа
 * targetType — 'news' | 'photo' | 'promotion'
 */
export default function CommentSection({ targetId, targetType }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]   = useState(false);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState('');

  const fetchComments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments?targetId=${targetId}&targetType=${targetType}&page=${page}&limit=${LIMIT}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
    } catch {
      // тихая ошибка — не критично
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => { fetchComments(1); }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetId, targetType, text: text.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Ошибка отправки');
        return;
      }

      setText('');
      // Перезагружаем список с первой страницы чтобы получить актуальные данные из БД
      await fetchComments(1);
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={styles.section} aria-label="Комментарии">
      <h2 className={styles.heading}>
        Комментарии
        {pagination.total > 0 && (
          <span className={styles.count}>{pagination.total}</span>
        )}
      </h2>

      {/* Форма — только для авторизованных */}
      {user ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Напишите комментарий…"
            maxLength={2000}
            rows={3}
            required
            aria-label="Текст комментария"
          />
          <div className={styles.formFooter}>
            <span className={styles.charCount}>{text.length}/2000</span>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={sending || text.trim().length < 2}
            >
              {sending ? 'Отправка…' : 'Отправить'}
            </button>
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </form>
      ) : (
        <p className={styles.authNote}>
          <a href="/loginsignup" className={styles.authLink}>Войдите</a>, чтобы оставить комментарий
        </p>
      )}

      {/* Список комментариев */}
      {loading && comments.length === 0 ? (
        <div className={styles.skeleton}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeletonItem} />)}
        </div>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>Комментариев пока нет. Будьте первым!</p>
      ) : (
        <ul className={styles.list}>
          {comments.map(c => (
            <li key={c._id} className={styles.item}>
              <div className={styles.itemHeader}>
                <Avatar author={c.author} />
                <span className={styles.username}>{c.author?.username ?? 'Пользователь'}</span>
                <time className={styles.date} dateTime={c.createdAt}>
                  {formatDate(c.createdAt)}
                </time>
              </div>
              <p className={styles.text}>{c.text}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={pagination.page === 1 || loading}
            onClick={() => fetchComments(pagination.page - 1)}
          >← Назад</button>
          <span className={styles.pageInfo}>{pagination.page} / {pagination.pages}</span>
          <button
            className={styles.pageBtn}
            disabled={pagination.page === pagination.pages || loading}
            onClick={() => fetchComments(pagination.page + 1)}
          >Далее →</button>
        </div>
      )}
    </section>
  );
}
