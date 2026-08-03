'use client';
import { useState, useEffect, useCallback } from 'react';

export default function OptfmAdminPage() {
  const [state, setState] = useState(null);
  const [markupInput, setMarkupInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchState = useCallback(async () => {
    const res = await fetch('/api/admin/optfm/config', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setState(data);
    setMarkupInput(String(data.markupPercent));
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleSaveMarkup = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/optfm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markupPercent: Number(markupInput) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
      setMessage('Наценка сохранена');
      fetchState();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/optfm/sync', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка запуска');
      setMessage(data.message);
      fetchState();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (!state) return <p>Загрузка…</p>;

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Поставщик OPTFM</h1>

      <form onSubmit={handleSaveMarkup} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '1.5rem' }}>
        <label>
          Наценка, %:{' '}
          <input
            type="number"
            min={0}
            value={markupInput}
            onChange={(e) => setMarkupInput(e.target.value)}
            style={{ padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, width: 100 }}
          />
        </label>
        <button type="submit" disabled={saving}
          style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>

      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <p><strong>Статус:</strong> {state.syncInProgress ? 'синхронизация выполняется…' : 'простаивает'}</p>
        {state.lastSyncFinishedAt && (
          <p><strong>Последняя синхронизация:</strong> {new Date(state.lastSyncFinishedAt).toLocaleString('ru-RU')}</p>
        )}
        {state.lastSyncStats && (
          <p>
            Товаров: {state.lastSyncStats.productsUpserted}, деактивировано: {state.lastSyncStats.productsDeactivated},
            новых фото: {state.lastSyncStats.imagesDownloaded}
          </p>
        )}
        {state.lastSyncError && <p style={{ color: '#dc2626' }}>Ошибка: {state.lastSyncError}</p>}
      </div>

      <button onClick={handleSync} disabled={syncing || state.syncInProgress}
        style={{ padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        {state.syncInProgress ? 'Уже выполняется…' : 'Синхронизировать сейчас'}
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}
