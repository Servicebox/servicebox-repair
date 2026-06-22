// app/reset-password/page.js
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './ResetPassword.module.css';

function IconLock() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconEye({ show }) {
  return show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = confirmPassword === '' ? null : password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!token) {
      setMessage('Недействительная ссылка для сброса пароля');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setMessage('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => router.push('/'), 2500);
      } else {
        setMessage(data.message || 'Ошибка при сбросе пароля');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('Ошибка сети при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  // Invalid / missing token state
  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={`${styles.iconWrap} ${styles.iconWrapError}`}>
            <IconAlert />
          </div>
          <h1 className={styles.title}>Недействительная ссылка</h1>
          <div className={styles.invalidCard}>
            <p>
              Ссылка для сброса пароля недействительна или просрочена.
              Запросите новую ссылку.
            </p>
            <Link href="/" className={styles.requestLink}>
              Запросить новую ссылку
            </Link>
            <br />
            <Link href="/" className={styles.backLink}>
              ← На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={`${styles.iconWrap} ${styles.iconWrapSuccess}`}>
            <IconCheck />
          </div>
          <h1 className={styles.title}>Готово!</h1>
          <div className={styles.successMessage}>
            Пароль успешно изменён
            <span>Перенаправление на главную...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <IconLock />
        </div>
        <h1 className={styles.title}>Новый пароль</h1>
        <p className={styles.subtitle}>Введите новый пароль для вашей учётной записи</p>

        {message && (
          <div className={styles.errorMessage}>{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.fieldWrapper}>
            <label htmlFor="rp-password" className={styles.label}>Новый пароль</label>
            <div className={styles.inputRow}>
              <input
                id="rp-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                autoComplete="new-password"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowPw(v => !v)}
                aria-label="Показать пароль"
              >
                <IconEye show={showPw} />
              </button>
            </div>
          </div>

          <div className={styles.fieldWrapper}>
            <label htmlFor="rp-confirm" className={styles.label}>Подтвердите пароль</label>
            <div className={styles.inputRow}>
              <input
                id="rp-confirm"
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                required
                minLength={6}
                autoComplete="new-password"
                className={`${styles.input} ${confirmPassword && !passwordsMatch ? styles.inputError : ''}`}
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowConfirmPw(v => !v)}
                aria-label="Показать пароль"
              >
                <IconEye show={showConfirmPw} />
              </button>
            </div>
            {confirmPassword !== '' && (
              <div className={`${styles.matchIndicator} ${passwordsMatch ? styles.matchOk : styles.matchFail}`}>
                {passwordsMatch ? '✓ Пароли совпадают' : '✗ Пароли не совпадают'}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Сохранение...' : 'Сохранить пароль'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          ← На главную
        </Link>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className={styles.loadingPage}>
        Загрузка...
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
