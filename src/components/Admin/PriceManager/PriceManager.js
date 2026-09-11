'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PriceItemForm from './PriceItemForm';
import styles from './PriceManager.module.css';

const LIMIT = 30;
const currency = (n) =>
  n === null || n === undefined || n === ''
    ? '—'
    : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(n);

export default function PriceManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [editing, setEditing] = useState(null); // null=закрыто, {}=создание, item=редактирование
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef(null);

  const [dangerConfirm, setDangerConfirm] = useState('');
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (q.trim()) params.set('q', q.trim());
      if (category) params.set('category', category);

      const res = await fetch(`/api/admin/price-items?${params}`, { credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось загрузить прайс-лист');

      setItems(json.items);
      setTotal(json.total);
      setCategories(json.categories || []);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, q, category]);

  useEffect(() => {
    load();
  }, [load]);

  // Поиск/фильтр — со сбросом на первую страницу, без лишних перезагрузок на каждый символ.
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 350);
    return () => clearTimeout(t);
  }, [q, category]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const isEdit = editing && editing._id;
      const url = isEdit ? `/api/admin/price-items/${editing._id}` : '/api/admin/price-items';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось сохранить позицию');

      setEditing(null);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Удалить «${item.name}»?`)) return;
    setDeletingId(item._id);
    try {
      const res = await fetch(`/api/admin/price-items/${item._id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось удалить позицию');
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    if (!confirm('Загрузка файла заменит ВСЕ текущие позиции прайса содержимым файла. Продолжить?')) {
      e.target.reset();
      return;
    }

    setUploading(true);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/price/upload', { method: 'POST', body: formData, credentials: 'include' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Ошибка загрузки файла');

      setUploadMsg({ type: 'success', text: json.message });
      e.target.reset();
      setPage(1);
      await load();
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleClearAll = async () => {
    if (dangerConfirm !== 'УДАЛИТЬ') return;
    setClearing(true);
    try {
      const res = await fetch('/api/admin/price-items?confirm=DELETE_ALL', {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Не удалось очистить прайс-лист');
      setDangerConfirm('');
      setPage(1);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Прайс-лист запчастей</h1>
          <p className={styles.subtitle}>
            {loading ? 'Загрузка…' : `${total} ${pluralize(total)} · показаны на servicebox35.ru/price`}
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={() => setEditing({})}>
          + Добавить позицию
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по наименованию, модели, описанию…"
        />
        <select className={styles.categorySelect} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {listError && <div className={styles.listError}>{listError}</div>}

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.empty}>Загрузка…</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            {q || category ? 'Ничего не найдено по заданным условиям' : 'Прайс-лист пуст — добавьте первую позицию'}
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Модель</th>
                  <th>Ревизия</th>
                  <th>Категория</th>
                  <th className={styles.numCol}>Розница</th>
                  <th className={styles.numCol}>Закупка</th>
                  <th className={styles.numCol}>Наличие</th>
                  <th className={styles.actionsCol} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td className={styles.nameCell}>
                      {item.name}
                      {item.description && <span className={styles.descHint}>{item.description}</span>}
                    </td>
                    <td>{item.model || '—'}</td>
                    <td>{item.revision || '—'}</td>
                    <td>
                      {item.category ? <span className={styles.categoryBadge}>{item.category}</span> : '—'}
                    </td>
                    <td className={styles.numCol}>
                      <strong>{currency(item.retailPrice)}</strong>
                    </td>
                    <td className={styles.numCol}>{currency(item.purchasePrice)}</td>
                    <td className={styles.numCol}>
                      <span className={item.quantity > 0 ? styles.inStock : styles.outOfStock}>
                        {item.quantity ?? 0}
                      </span>
                    </td>
                    <td className={styles.actionsCol}>
                      <button type="button" className={styles.iconBtn} onClick={() => setEditing(item)} title="Редактировать">
                        ✎
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item._id}
                        title="Удалить"
                      >
                        {deletingId === item._id ? '…' : '✕'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ← Назад
            </button>
            <span>
              Стр. {page} из {totalPages}
            </span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Вперёд →
            </button>
          </div>
        )}
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Импорт из Excel</h2>
          <p className={styles.cardText}>
            Файл целиком заменит текущий прайс-лист. Колонки: наименование, модель, ревизия, категория, розница,
            закуп, наличие, описание (порядок любой, лишние — игнорируются).
          </p>
          <form onSubmit={handleUpload} className={styles.uploadForm}>
            <input ref={fileInputRef} type="file" accept=".xlsx" required className={styles.fileInput} />
            <button type="submit" className={styles.uploadBtn} disabled={uploading}>
              {uploading ? 'Загрузка…' : 'Загрузить и заменить всё'}
            </button>
          </form>
          {uploadMsg && (
            <div className={uploadMsg.type === 'success' ? styles.msgSuccess : styles.msgError}>{uploadMsg.text}</div>
          )}
          <a href="/api/price/current" className={styles.downloadLink}>
            ⬇ Скачать текущий прайс в Excel
          </a>
        </div>

        <div className={`${styles.card} ${styles.dangerCard}`}>
          <h2 className={styles.dangerTitle}>Опасная зона</h2>
          <p className={styles.cardText}>
            Удалит все {total} {pluralize(total)} без возможности восстановления. Чтобы подтвердить, введите{' '}
            <strong>УДАЛИТЬ</strong>.
          </p>
          <div className={styles.dangerRow}>
            <input
              className={styles.input}
              value={dangerConfirm}
              onChange={(e) => setDangerConfirm(e.target.value)}
              placeholder="УДАЛИТЬ"
            />
            <button
              type="button"
              className={styles.dangerBtn}
              disabled={dangerConfirm !== 'УДАЛИТЬ' || clearing || total === 0}
              onClick={handleClearAll}
            >
              {clearing ? 'Удаление…' : 'Удалить все позиции'}
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)} role="presentation">
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <PriceItemForm
              initial={editing._id ? editing : null}
              categories={categories}
              saving={saving}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function pluralize(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'позиция';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'позиции';
  return 'позиций';
}
