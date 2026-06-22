// components/Admin/UsersManagement/UsersManagement.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './UsersManagement.module.css';

const EMPTY_FORM = { role: 'user', email: '', isActive: true, newPassword: '' };
const EMPTY_BONUS = { type: 'earn', points: '', description: '' };

export default function UsersManagement() {
  const { user: currentUser } = useAuth();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Модалка редактирования
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  // Модалка бонусов
  const [bonusTarget, setBonusTarget] = useState(null);
  const [bonusForm, setBonusForm]     = useState(EMPTY_BONUS);
  const [bonusSaving, setBonusSaving] = useState(false);
  const [bonusMsg, setBonusMsg]       = useState('');

  const fetchUsers = useCallback(async (page = 1, search = '', role = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(role && { role }),
      });
      const res = await fetch(`/api/users?${params}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setCurrentPage(data.pagination?.currentPage ?? 1);
    } catch (err) {
      setError('Ошибка загрузки: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') fetchUsers();
    else if (currentUser) { setError('Нет прав администратора'); setLoading(false); }
  }, [currentUser, fetchUsers]);

  const openModal = (user) => {
    setEditTarget(user);
    setEditForm({ role: user.role ?? 'user', email: user.email ?? '', isActive: user.isActive ?? true, newPassword: '' });
    setShowPassword(false);
    setError('');
  };

  const closeModal = () => { setEditTarget(null); setEditForm(EMPTY_FORM); setShowPassword(false); };

  const openBonusModal = (user) => {
    setBonusTarget(user);
    setBonusForm(EMPTY_BONUS);
    setBonusMsg('');
  };

  const closeBonusModal = () => { setBonusTarget(null); setBonusForm(EMPTY_BONUS); setBonusMsg(''); };

  const handleBonusSave = async () => {
    if (!bonusTarget) return;
    const pts = Number(bonusForm.points);
    if (!pts || pts <= 0) { setBonusMsg('Введите положительное количество баллов'); return; }
    if (!bonusForm.description.trim()) { setBonusMsg('Укажите причину начисления'); return; }

    setBonusSaving(true);
    setBonusMsg('');
    try {
      const res = await fetch('/api/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: bonusTarget._id, type: bonusForm.type, points: pts, description: bonusForm.description }),
      });
      const data = await res.json();
      if (res.ok) {
        setBonusMsg(`Готово! Новый баланс: ${data.balance} баллов`);
        setBonusForm(EMPTY_BONUS);
        fetchUsers(currentPage, searchTerm, roleFilter);
      } else {
        setBonusMsg(data.error ?? 'Ошибка');
      }
    } catch {
      setBonusMsg('Ошибка сети');
    } finally {
      setBonusSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    setError('');
    try {
      const body = { role: editForm.role, email: editForm.email, isActive: editForm.isActive };
      if (editForm.newPassword) body.newPassword = editForm.newPassword;

      const res = await fetch(`/api/admin/users/${editTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Пользователь обновлён');
        setTimeout(() => setSuccess(''), 3000);
        closeModal();
        fetchUsers(currentPage, searchTerm, roleFilter);
      } else {
        setError(data.error ?? 'Ошибка обновления');
      }
    } catch (err) {
      setError('Ошибка сети: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId, email) => {
    if (!confirm(`Удалить пользователя ${email}?`)) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE', credentials: 'include'
      });
      if (res.ok) {
        setSuccess('Пользователь удалён');
        setTimeout(() => setSuccess(''), 3000);
        fetchUsers(currentPage, searchTerm, roleFilter);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка сети: ' + err.message);
    }
  };

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}><div className={styles.spinner} /><p>Загрузка...</p></div>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return <div className={styles.container}><div className={styles.error}>Нет доступа</div></div>;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}><div className={styles.spinner} /><p>Загрузка пользователей...</p></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление пользователями</h1>
        <p>Всего: {users.length}</p>
      </div>

      {/* Поиск + фильтр роли */}
      <div className={styles.searchSection}>
        <form
          onSubmit={e => { e.preventDefault(); fetchUsers(1, searchTerm, roleFilter); }}
          className={styles.searchForm}
        >
          <input
            type="text"
            placeholder="Поиск по имени, email или телефону..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            className={styles.select}
            style={{ width: 'auto', minWidth: 160 }}
            value={roleFilter}
            onChange={e => {
              const r = e.target.value;
              setRoleFilter(r);
              fetchUsers(1, searchTerm, r);
            }}
            aria-label="Фильтр по роли"
          >
            <option value="">Все роли</option>
            <option value="user">Пользователи</option>
            <option value="admin">Администраторы</option>
          </select>
          <button type="submit" className={styles.searchButton}>Поиск</button>
          {(searchTerm || roleFilter) && (
            <button type="button" className={styles.clearButton}
              onClick={() => { setSearchTerm(''); setRoleFilter(''); fetchUsers(1, '', ''); }}>
              Сбросить
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={() => setError('')} className={styles.closeButton}>×</button>
        </div>
      )}
      {success && (
        <div className={styles.success}>
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className={styles.closeButton}>×</button>
        </div>
      )}

      {/* Таблица */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Регистрация</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className={styles.userRow}>
                <td>{u.username || '—'}</td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>
                  <span className={`${styles.role} ${styles[u.role]}`}>
                    {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </td>
                <td>
                  <span style={{ color: u.isActive === false ? '#dc2626' : '#059669', fontWeight: 600, fontSize: 12 }}>
                    {u.isActive === false ? 'Заблокирован' : 'Активен'}
                  </span>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru-RU') : '—'}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.editButton} onClick={() => openModal(u)}>
                      Редактировать
                    </button>
                    <button className={styles.bonusButton} onClick={() => openBonusModal(u)}>
                      Бонусы {u.bonuses != null ? `(${u.bonuses})` : ''}
                    </button>
                    {u._id !== currentUser._id && (
                      <button className={styles.deleteButton} onClick={() => deleteUser(u._id, u.email)}>
                        Удалить
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className={styles.empty}>
            <p>{searchTerm ? 'Пользователи не найдены' : 'Список пуст'}</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageButton} disabled={currentPage === 1}
              onClick={() => fetchUsers(currentPage - 1, searchTerm, roleFilter)}>Назад</button>
            <span className={styles.pageInfo}>Страница {currentPage} из {totalPages}</span>
            <button className={styles.pageButton} disabled={currentPage === totalPages}
              onClick={() => fetchUsers(currentPage + 1, searchTerm, roleFilter)}>Вперёд</button>
          </div>
        )}
      </div>

      {/* Модальное окно бонусов */}
      {bonusTarget && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeBonusModal()}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="bonus-modal-title">
            <h2 id="bonus-modal-title" className={styles.modalTitle}>
              Бонусы: {bonusTarget.username || bonusTarget.email}
            </h2>
            <p style={{ marginBottom: 16, color: '#64748b', fontSize: 14 }}>
              Текущий баланс: <strong>{bonusTarget.bonuses ?? 0} баллов</strong>
            </p>

            <div className={styles.modalField}>
              <label className={styles.modalLabel} htmlFor="bonus-type">Операция</label>
              <select
                id="bonus-type"
                className={styles.select}
                value={bonusForm.type}
                onChange={e => setBonusForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="earn">Начислить</option>
                <option value="spend">Списать</option>
                <option value="adjust">Корректировка</option>
              </select>
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel} htmlFor="bonus-points">Количество баллов</label>
              <input
                id="bonus-points"
                type="number"
                min="1"
                className={styles.input}
                placeholder="Например: 100"
                value={bonusForm.points}
                onChange={e => setBonusForm(f => ({ ...f, points: e.target.value }))}
              />
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel} htmlFor="bonus-desc">Причина</label>
              <input
                id="bonus-desc"
                type="text"
                className={styles.input}
                placeholder="Например: за загрузку фото"
                value={bonusForm.description}
                onChange={e => setBonusForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {bonusMsg && (
              <p style={{ color: bonusMsg.startsWith('Готово') ? '#059669' : '#dc2626', fontSize: 13, marginTop: 4 }}>
                {bonusMsg}
              </p>
            )}

            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={closeBonusModal} disabled={bonusSaving}>
                Закрыть
              </button>
              <button className={styles.saveButton} onClick={handleBonusSave} disabled={bonusSaving}>
                {bonusSaving ? 'Сохранение...' : 'Применить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editTarget && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title" className={styles.modalTitle}>
              Редактирование: {editTarget.username || editTarget.email}
            </h2>

            <div className={styles.modalField}>
              <label className={styles.modalLabel} htmlFor="modal-email">Email</label>
              <input
                id="modal-email"
                type="email"
                className={styles.input}
                value={editForm.email}
                onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel} htmlFor="modal-role">Роль</label>
              <select
                id="modal-role"
                className={styles.select}
                value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <div className={styles.modalField}>
              <label className={styles.isActiveToggle}>
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                />
                Аккаунт активен
              </label>
            </div>

            <div className={styles.modalField}>
              <label className={styles.modalLabel} htmlFor="modal-password">
                Новый пароль <span style={{ fontWeight: 400, textTransform: 'none' }}>(оставьте пустым, чтобы не менять)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Минимум 8 символов"
                  value={editForm.newPassword}
                  onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                  autoComplete="new-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13
                  }}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{error}</p>}

            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={closeModal} disabled={saving}>
                Отмена
              </button>
              <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
