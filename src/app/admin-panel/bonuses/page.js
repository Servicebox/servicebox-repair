'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from '../AdminPanel.module.css';

export default function AdminBonusesPage() {
  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]     = useState(false);

  // Форма начисления
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ type: 'earn', points: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', ok: false });

  const fetchUsers = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?page=${page}&limit=20&search=${encodeURIComponent(q)}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users ?? data.items ?? []);
      setPagination(data.pagination ?? { page: 1, pages: 1, total: 0 });
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!selectedUser || !form.points || !form.description) return;

    const points = Number(form.points);
    if (form.type === 'spend' && points > (selectedUser.bonuses ?? 0)) {
      setFormMsg({ text: `Недостаточно бонусов: у пользователя ${selectedUser.bonuses ?? 0} б., попытка списать ${points}`, ok: false });
      return;
    }

    setSubmitting(true);
    setFormMsg({ text: '', ok: false });

    try {
      const res = await fetch('/api/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId:      selectedUser._id,
          type:        form.type,
          points:      Number(form.points),
          description: form.description,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormMsg({ text: data.error ?? 'Ошибка', ok: false });
        return;
      }

      setFormMsg({ text: `Готово. Новый баланс: ${data.balance} бонусов`, ok: true });
      // Обновляем баланс в таблице
      setUsers(prev => prev.map(u =>
        u._id === selectedUser._id ? { ...u, bonuses: data.balance } : u
      ));
      setSelectedUser(prev => ({ ...prev, bonuses: data.balance }));
      setForm({ type: 'earn', points: '', description: '' });
    } catch {
      setFormMsg({ text: 'Ошибка сети', ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Управление бонусами</h1>

      {/* Поиск */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Имя, email или телефон…"
          style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: '.875rem' }}
        />
        <button type="submit"
          style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: '.875rem' }}>
          Найти
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Таблица пользователей */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>Пользователь</th>
                <th style={th}>Email</th>
                <th style={{ ...th, textAlign: 'right' }}>Бонусы</th>
                <th style={th} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Загрузка…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Нет пользователей</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id}
                    style={{ borderBottom: '1px solid #f1f5f9', background: selectedUser?._id === u._id ? '#eff6ff' : 'transparent' }}>
                    <td style={td}>{u.username}</td>
                    <td style={{ ...td, color: '#64748b' }}>{u.email}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: u.bonuses > 0 ? '#16a34a' : '#94a3b8' }}>
                      {u.bonuses ?? 0}
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => { setSelectedUser(u); setFormMsg({ text: '', ok: false }); }}
                        style={{ padding: '4px 12px', background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe', borderRadius: 7, cursor: 'pointer', fontSize: '.78rem' }}>
                        Изменить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12, alignItems: 'center' }}>
              <button disabled={pagination.page === 1} onClick={() => fetchUsers(pagination.page - 1)}
                style={pageBtn}>← Назад</button>
              <span style={{ fontSize: '.8rem', color: '#64748b' }}>{pagination.page}/{pagination.pages}</span>
              <button disabled={pagination.page === pagination.pages} onClick={() => fetchUsers(pagination.page + 1)}
                style={pageBtn}>Далее →</button>
            </div>
          )}
        </div>

        {/* Форма начисления/списания */}
        {selectedUser && (
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{selectedUser.username}</p>
                <p style={{ fontSize: '.8rem', color: '#64748b' }}>{selectedUser.email}</p>
                <p style={{ fontSize: '.9rem', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
                  Баланс: {selectedUser.bonuses ?? 0} б.
                </p>
              </div>
              <button onClick={() => setSelectedUser(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>

            <form onSubmit={handleAdjust} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Тип операции */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ v: 'earn', l: 'Начислить' }, { v: 'spend', l: 'Списать' }, { v: 'adjust', l: 'Корректировка' }].map(({ v, l }) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '.8rem' }}>
                    <input type="radio" name="type" value={v} checked={form.type === v}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
                    {l}
                  </label>
                ))}
              </div>

              <input
                type="number"
                min={1}
                value={form.points}
                onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
                placeholder="Количество баллов"
                required
                style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem' }}
              />

              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Причина (обязательно)"
                required
                rows={3}
                maxLength={500}
                style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.875rem', resize: 'vertical', fontFamily: 'inherit' }}
              />

              <button type="submit" disabled={submitting}
                style={{ padding: '9px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 500, fontSize: '.875rem' }}>
                {submitting ? 'Сохранение…' : 'Применить'}
              </button>

              {formMsg.text && (
                <p style={{ fontSize: '.82rem', color: formMsg.ok ? '#16a34a' : '#dc2626' }} role="alert">
                  {formMsg.text}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '.8rem', whiteSpace: 'nowrap' };
const td = { padding: '10px 12px', color: '#1e293b' };
const pageBtn = { padding: '5px 12px', border: '1.5px solid #e2e8f0', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: '.78rem' };
