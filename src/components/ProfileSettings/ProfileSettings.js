'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { Camera, Lock, Bookmark, LogOut } from 'lucide-react';
import Link from 'next/link';
import styles from './ProfileSettings.module.css';

function AvatarImg({ src, fallback, className, placeholderClass }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={placeholderClass}>{fallback}</span>;
  return (
    <img
      src={src}
      alt="Аватар"
      className={className}
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
    />
  );
}

export default function ProfileSettings() {
  const { user, logout, checkAuth } = useAuth();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const fileRef = useRef(null);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  const avatarSrc = avatarPreview || user?.avatarUrl || user?.avatar || null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    // Use FileReader to produce a data: URL instead of blob: to satisfy CSP img-src
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setAvatarMsg('');
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setAvatarMsg('');

    const fd = new FormData();
    fd.append('avatar', avatarFile);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        credentials: 'include',
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarMsg('Аватар обновлён');
        setAvatarFile(null);
        await checkAuth();
      } else {
        setAvatarMsg(data.error ?? 'Ошибка загрузки');
      }
    } catch {
      setAvatarMsg('Ошибка сети');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMsg('');

    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('Пароли не совпадают');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Новый пароль — минимум 6 символов');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg('Пароль успешно изменён');
        setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      } else {
        setPwError(data.error ?? 'Ошибка смены пароля');
      }
    } catch {
      setPwError('Ошибка сети');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* ── Аватар ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Camera size={18} aria-hidden="true" />
          Фото профиля
        </h2>
        <div className={styles.avatarRow}>
          <div className={styles.avatarWrap}>
            {avatarSrc ? (
              <AvatarImg
                src={avatarSrc}
                fallback={user?.username?.[0]?.toUpperCase() ?? '?'}
                className={styles.avatarImg}
                placeholderClass={styles.avatarPlaceholder}
              />
            ) : (
              <span className={styles.avatarPlaceholder}>
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div className={styles.avatarActions}>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className={styles.fileInput}
              id="avatar-input"
            />
            <label htmlFor="avatar-input" className={styles.chooseBtn}>
              Выбрать фото
            </label>
            {avatarFile && (
              <button
                className={styles.uploadBtn}
                onClick={handleAvatarUpload}
                disabled={avatarLoading}
              >
                {avatarLoading ? 'Загрузка...' : 'Сохранить'}
              </button>
            )}
            {avatarMsg && (
              <p className={styles.msg}>{avatarMsg}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Смена пароля ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Lock size={18} aria-hidden="true" />
          Смена пароля
        </h2>
        <form onSubmit={handlePwChange} className={styles.form}>
          <label className={styles.label}>
            Текущий пароль
            <input
              type="password"
              className={styles.input}
              value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </label>
          <label className={styles.label}>
            Новый пароль
            <input
              type="password"
              className={styles.input}
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label className={styles.label}>
            Повторите новый пароль
            <input
              type="password"
              className={styles.input}
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </label>
          {pwError && <p className={styles.error}>{pwError}</p>}
          {pwMsg && <p className={styles.msg}>{pwMsg}</p>}
          <button type="submit" className={styles.submitBtn} disabled={pwLoading}>
            {pwLoading ? 'Сохранение...' : 'Изменить пароль'}
          </button>
        </form>
      </section>

      {/* ── Ссылка на избранное + выход ── */}
      <section className={styles.section}>
        <Link href="/profile/favorites" className={styles.favLink}>
          <Bookmark size={18} aria-hidden="true" />
          Моё избранное
        </Link>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={18} aria-hidden="true" />
          Выйти из аккаунта
        </button>
      </section>
    </div>
  );
}
