// src/components/depository/BoardPhotoAdminList.js
'use client';
import { useEffect, useState, useCallback } from 'react';
import { DEVICE_TYPES, deviceTypeLabel } from '@/lib/boardPhotos';
import styles from './BoardPhotoAdminList.module.css';

export default function BoardPhotoAdminList({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({});

  const load = useCallback(() => {
    // Админский список: видит и неактивные фото, и поле isActive для чекбокса.
    fetch('/api/admin/board-photos')
      .then(r => r.json())
      .then(d => setItems(d.boardPhotos || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const startEdit = (p) => { setEditId(p._id); setDraft({ ...p }); };
  const save = async () => {
    try {
      const res = await fetch(`/api/admin/board-photos/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title, slug: draft.slug, deviceType: draft.deviceType,
          chip: draft.chip, description: draft.description, isActive: draft.isActive,
        }),
      });
      if (res.ok) { setEditId(null); load(); return; }
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Ошибка сохранения');
    } catch {
      alert('Сеть недоступна — не удалось сохранить');
    }
  };
  const remove = async (id) => {
    if (!confirm('Удалить фото платы?')) return;
    try {
      const res = await fetch(`/api/admin/board-photos/${id}`, { method: 'DELETE' });
      if (res.ok) { load(); return; }
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Ошибка удаления');
    } catch {
      alert('Сеть недоступна — не удалось удалить');
    }
  };

  return (
    <div className={styles.list}>
      {items.length === 0 && <p>Пока нет фотографий плат.</p>}
      {items.map(p => (
        <div key={p._id} className={styles.row}>
          <img src={`/api/board-photos/${p.slug}/image`} alt="" className={styles.thumb} loading="lazy" />
          {editId === p._id ? (
            <div className={styles.editBox}>
              <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
              <input value={draft.slug} onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))} placeholder="slug" />
              <select value={draft.deviceType} onChange={e => setDraft(d => ({ ...d, deviceType: e.target.value }))}>
                {DEVICE_TYPES.map(t => <option key={t} value={t}>{deviceTypeLabel(t)}</option>)}
              </select>
              <input value={draft.chip || ''} onChange={e => setDraft(d => ({ ...d, chip: e.target.value }))} placeholder="чип" />
              <textarea value={draft.description || ''} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} rows={2} />
              <label><input type="checkbox" checked={!!draft.isActive} onChange={e => setDraft(d => ({ ...d, isActive: e.target.checked }))} /> Активна</label>
              <div className={styles.btns}>
                <button onClick={save}>Сохранить</button>
                <button onClick={() => setEditId(null)}>Отмена</button>
              </div>
            </div>
          ) : (
            <div className={styles.info}>
              <strong>{p.title}</strong>
              <span>{deviceTypeLabel(p.deviceType)}{p.chip ? ` · ${p.chip}` : ''}</span>
              <div className={styles.btns}>
                <a href={`/platy/${p.slug}`} target="_blank" rel="noreferrer">Открыть</a>
                <button onClick={() => startEdit(p)}>Править</button>
                <button onClick={() => remove(p._id)}>Удалить</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
