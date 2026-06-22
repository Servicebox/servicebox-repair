'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './reviews.module.css';

const STARS = [5, 4, 3, 2, 1];

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.stars} aria-label={`Оценка: ${value} из 5`}>
      {STARS.map(s => (
        <button
          key={s}
          type="button"
          aria-label={`${s} звёзд`}
          className={`${styles.star} ${s <= (hovered || value) ? styles.starFilled : ''}`}
          onClick={readonly ? undefined : () => onChange(s)}
          onMouseEnter={readonly ? undefined : () => setHovered(s)}
          onMouseLeave={readonly ? undefined : () => setHovered(0)}
          disabled={readonly}
          tabIndex={readonly ? -1 : 0}
        >★</button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.cardAvatar}>
          {review.author?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className={styles.cardAuthor}>{review.author?.username ?? 'Клиент'}</p>
          <time className={styles.cardDate} dateTime={review.createdAt}>
            {new Date(review.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </time>
        </div>
        <div className={styles.cardRating}>
          <StarRating value={review.rating} readonly />
        </div>
      </header>
      <p className={styles.cardText}>{review.text}</p>
    </article>
  );
}

export default function ReviewsClient() {
  const { user } = useAuth();

  const [reviews, setReviews]   = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]   = useState(false);

  // Форма
  const [rating, setRating]     = useState(5);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [formMsg, setFormMsg]   = useState({ text: '', ok: false });
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?page=${page}&limit=12`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReviews(data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setFormMsg({ text: '', ok: false });

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormMsg({ text: data.error ?? 'Ошибка отправки', ok: false });
        return;
      }

      setFormMsg({ text: 'Отзыв отправлен на модерацию. Спасибо!', ok: true });
      setSubmitted(true);
      setText('');
      setRating(5);
    } catch {
      setFormMsg({ text: 'Ошибка сети. Попробуйте ещё раз.', ok: false });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Отзывы клиентов</h1>
        {pagination.total > 0 && (
          <p className={styles.subtitle}>{pagination.total} отзывов о ServiceBox</p>
        )}
      </header>

      {/* Форма */}
      {user && !submitted && (
        <section className={styles.formSection} aria-label="Оставить отзыв">
          <h2 className={styles.formTitle}>Оставить отзыв</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.ratingRow}>
              <span className={styles.ratingLabel}>Оценка:</span>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Расскажите о вашем опыте ремонта в ServiceBox…"
              minLength={10}
              maxLength={3000}
              rows={5}
              required
              aria-label="Текст отзыва"
            />
            <div className={styles.formFooter}>
              <span className={styles.charCount}>{text.length}/3000</span>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={sending || text.trim().length < 10}
              >
                {sending ? 'Отправка…' : 'Отправить отзыв'}
              </button>
            </div>
            {formMsg.text && (
              <p className={formMsg.ok ? styles.success : styles.error} role="alert">
                {formMsg.text}
              </p>
            )}
          </form>
        </section>
      )}

      {!user && (
        <p className={styles.authNote}>
          <a href="/loginsignup" className={styles.authLink}>Войдите</a>, чтобы оставить отзыв
        </p>
      )}

      {submitted && (
        <div className={styles.thankYou}>
          ✓ Спасибо! Ваш отзыв отправлен на модерацию.
        </div>
      )}

      {/* Сетка отзывов */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className={styles.empty}>Отзывов пока нет.</p>
      ) : (
        <div className={styles.grid}>
          {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
        </div>
      )}

      {pagination.pages > 1 && (
        <nav className={styles.pagination} aria-label="Страницы отзывов">
          <button
            className={styles.pageBtn}
            disabled={pagination.page === 1 || loading}
            onClick={() => fetchReviews(pagination.page - 1)}
          >← Назад</button>
          <span className={styles.pageInfo}>{pagination.page} / {pagination.pages}</span>
          <button
            className={styles.pageBtn}
            disabled={pagination.page === pagination.pages || loading}
            onClick={() => fetchReviews(pagination.page + 1)}
          >Далее →</button>
        </nav>
      )}
    </main>
  );
}
