'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from '../AdminPanel.module.css';

const STATUS_LABELS = { pending: 'На проверке', approved: 'Одобрен', rejected: 'Отклонён' };
const STATUS_COLOR  = { pending: '#f59e0b', approved: '#16a34a', rejected: '#dc2626' };
const STARS = [1, 2, 3, 4, 5];

function StarDisplay({ rating }) {
  return (
    <span aria-label={`${rating} из 5`}>
      {STARS.map(s => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#cbd5e1', fontSize: '1rem' }}>★</span>
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filterStatus, setFilter] = useState('pending');
  const [loading, setLoading]     = useState(false);

  // Редактирование текста
  const [editId, setEditId]   = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving]   = useState(false);

  const fetchReviews = useCallback(async (status, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${status}&page=${page}&limit=20`, { credentials: 'include' });
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

  useEffect(() => { fetchReviews(filterStatus, 1); }, [filterStatus, fetchReviews]);

  const updateReview = async (id, payload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      // Обновляем локально
      setReviews(prev => prev.map(r =>
        r._id === id ? { ...r, ...payload } : r
      ));
      setEditId(null);
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Удалить отзыв безвозвратно?')) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setReviews(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className={styles.pageTitle}>Модерация отзывов</h1>
        <span style={{ color: '#64748b', fontSize: '.875rem' }}>Всего: {pagination.total}</span>
      </div>

      {/* Фильтр */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
              borderColor: filterStatus === s ? '#2563eb' : '#e2e8f0',
              background: filterStatus === s ? '#eff6ff' : '#fff',
              color: filterStatus === s ? '#2563eb' : '#475569',
              fontSize: '.8rem', cursor: 'pointer', fontWeight: filterStatus === s ? 600 : 400,
            }}
          >
            {s === 'all' ? 'Все' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Загрузка…</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem 0' }}>Отзывов нет</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <article key={r._id} style={{
              background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14,
              padding: '1.25rem', position: 'relative',
            }}>
              {/* Заголовок */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '.875rem', color: '#1e293b' }}>
                  {r.author?.username ?? 'Клиент'} · {r.author?.email ?? ''}
                </span>
                <StarDisplay rating={r.rating} />
                <span style={{
                  padding: '2px 10px', borderRadius: 999, fontSize: '.75rem', fontWeight: 600,
                  background: STATUS_COLOR[r.status] + '20', color: STATUS_COLOR[r.status],
                }}>
                  {STATUS_LABELS[r.status]}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: '#94a3b8' }}>
                  {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>

              {/* Текст / редактор */}
              {editId === r._id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={5}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '.875rem', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => updateReview(r._id, { text: editText })} disabled={saving}
                      style={{ padding: '6px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem' }}>
                      {saving ? 'Сохранение…' : 'Сохранить'}
                    </button>
                    <button onClick={() => setEditId(null)}
                      style={{ padding: '6px 14px', border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: '.8rem' }}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '.875rem', color: '#475569', lineHeight: 1.6, marginBottom: 12, whiteSpace: 'pre-line' }}>{r.text}</p>
              )}

              {/* Кнопки действий */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.status !== 'approved' && (
                  <button onClick={() => updateReview(r._id, { status: 'approved' })}
                    style={{ padding: '5px 14px', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', borderRadius: 7, fontSize: '.8rem', cursor: 'pointer' }}>
                    ✓ Одобрить
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => updateReview(r._id, { status: 'rejected' })}
                    style={{ padding: '5px 14px', background: '#fff5f5', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 7, fontSize: '.8rem', cursor: 'pointer' }}>
                    ✕ Отклонить
                  </button>
                )}
                <button onClick={() => { setEditId(r._id); setEditText(r.text); }}
                  style={{ padding: '5px 14px', background: '#f8fafc', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: '.8rem', cursor: 'pointer' }}>
                  ✎ Редактировать
                </button>
                <button onClick={() => deleteReview(r._id)}
                  style={{ padding: '5px 14px', background: '#fff5f5', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 7, fontSize: '.8rem', cursor: 'pointer', marginLeft: 'auto' }}>
                  🗑 Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: '1.5rem', alignItems: 'center' }}>
          <button disabled={pagination.page === 1} onClick={() => fetchReviews(filterStatus, pagination.page - 1)}
            style={{ padding: '6px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
            ← Назад
          </button>
          <span style={{ fontSize: '.8rem', color: '#64748b' }}>{pagination.page} / {pagination.pages}</span>
          <button disabled={pagination.page === pagination.pages} onClick={() => fetchReviews(filterStatus, pagination.page + 1)}
            style={{ padding: '6px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
            Далее →
          </button>
        </div>
      )}
    </div>
  );
}
