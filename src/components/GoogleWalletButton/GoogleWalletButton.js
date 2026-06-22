'use client';
import { useState } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';

export default function GoogleWalletButton({ className = '' }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Показываем только авторизованным пользователям
  if (!user) return null;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/google-wallet/generate', { credentials: 'include' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Не удалось создать пропуск');
        return;
      }

      // Открываем Save to Wallet в новой вкладке
      window.open(data.saveUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="Добавить карту лояльности в Google Wallet"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-60 text-white text-sm font-medium transition-colors"
      >
        {loading ? (
          <span>Загрузка…</span>
        ) : (
          <>
            {/* Google Wallet лого */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21.17 12.23c0-.67-.06-1.31-.17-1.93H12v3.65h5.14a4.4 4.4 0 01-1.9 2.89v2.4h3.08c1.8-1.66 2.85-4.1 2.85-6.99z" fill="#4285F4"/>
              <path d="M12 22c2.59 0 4.77-.86 6.36-2.32l-3.08-2.4c-.86.58-1.97.92-3.28.92-2.52 0-4.65-1.7-5.41-3.99H3.43v2.48A9.6 9.6 0 0012 22z" fill="#34A853"/>
              <path d="M6.59 14.21A5.77 5.77 0 016.3 12.5c0-.59.1-1.17.29-1.71V8.31H3.43A9.6 9.6 0 002.4 12.5c0 1.55.37 3.01 1.03 4.31l3.16-2.6z" fill="#FBBC05"/>
              <path d="M12 6.52a5.2 5.2 0 013.68 1.44l2.76-2.76A9.24 9.24 0 0012 3a9.6 9.6 0 00-8.57 5.31l3.16 2.48C7.35 8.22 9.48 6.52 12 6.52z" fill="#EA4335"/>
            </svg>
            Добавить в Google Wallet
          </>
        )}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
