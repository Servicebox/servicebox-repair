'use client';

export default function YandexLoginButton({ className = '' }) {
  return (
    <a
      href="/api/auth/yandex"
      className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 ${className}`}
    >
      {/* Официальный логотип Яндекса */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
        <path
          d="M13.32 7.2h-1.04c-1.68 0-2.56.84-2.56 2.08 0 1.4.6 2.08 1.88 2.96l1.04.72-3 4.84H7.8l2.76-4.44C9.08 12.32 8.2 11.2 8.2 9.2c0-2.36 1.64-3.8 4.08-3.8h2.96v11.4h-1.92V7.2z"
          fill="#fff"
        />
      </svg>
      Войти через Яндекс
    </a>
  );
}
