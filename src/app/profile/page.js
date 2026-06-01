'use client';
import { useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import UserProfileWrapper from '@/components/UserProfile/UserProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import UserOrders from '@/components/UserOrders/UserOrders';
import UserBookings from '@/components/UserBookings/UserBookings';
import { ShopContext } from '@/components/ShopContext/ShopContext';
import { Suspense } from 'react';

export default function ProfilePage() {
  const { currentUser, isLoggedIn } = useAuth();
  const { userOrders } = useContext(ShopContext);

  // Состояние для кнопки Google Wallet
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [walletJwt, setWalletJwt] = useState(null);

  // Получаем ID текущего пользователя (используем _id или email)
  const userId = currentUser?._id || currentUser?.email || 'guest';

  // Функция для генерации JWT через API
  const addToWallet = async () => {
    if (!currentUser) {
      alert('Пожалуйста, авторизуйтесь, чтобы выпустить карту лояльности.');
      return;
    }

    setIsWalletLoading(true);
    try {
      const response = await fetch('/api/generate-wallet-jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось получить токен');

      const { jwt } = data;
      if (!jwt) throw new Error('JWT не получен');

      setWalletJwt(jwt);

      // После получения JWT создаём кнопку Google Wallet
      createWalletButton(jwt);
    } catch (error) {
      console.error('Ошибка добавления в кошелёк:', error);
      alert('Не удалось выпустить карту. Попробуйте позже.');
    } finally {
      setIsWalletLoading(false);
    }
  };

  // Функция для создания кнопки Google Wallet в контейнере
  const createWalletButton = (jwt) => {
    const container = document.getElementById('google-wallet-button');
    if (!container) return;

    container.innerHTML = ''; // Очищаем контейнер

    // Создаём специальный элемент кнопки Google Wallet
    const button = document.createElement('g:savetoandroidpay');
    button.setAttribute('jwt', jwt);
    button.setAttribute('height', 'standard');
    button.setAttribute('theme', 'dark');
    button.setAttribute('onsuccess', 'onWalletSuccess');
    button.setAttribute('onfailure', 'onWalletFailure');
    container.appendChild(button);

    // Загружаем скрипт Google Wallet, если он ещё не загружен
    if (!document.querySelector('script[src="https://apis.google.com/js/platform.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  };

  // Глобальные колбэки для Google Wallet
  useEffect(() => {
    window.onWalletSuccess = () => {
      alert('Карта лояльности успешно добавлена в Google Wallet!');
    };
    window.onWalletFailure = (error) => {
      console.error('Ошибка Google Wallet:', error);
      alert(`Не удалось добавить карту: ${error?.errorMessage || 'неизвестная ошибка'}`);
    };

    // Если JWT уже был получен (например, после перезагрузки страницы), можно пересоздать кнопку
    if (walletJwt) {
      createWalletButton(walletJwt);
    }
  }, [walletJwt]);

  return (
    <ProtectedRoute>
      <div className="profile-page container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="loading-container">
            <div>Загрузка профиля...</div>
          </div>
        }>
          <div className="grid gap-8">
            {/* Профиль пользователя */}
            <UserProfileWrapper />

            {/* Мои заказы (товары) */}
            <UserOrders />

            {/* Мои записи на услуги */}
            <UserBookings />

            {/* Блок карты лояльности Google Wallet */}
            <div className="wallet-section border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Карта лояльности</h2>
              <p className="text-gray-600 mb-4">
                Добавьте цифровую карту лояльности ServiceBox в Google Wallet.
                Это даст вам доступ к накопительным скидкам, бонусам и специальным предложениям.
              </p>
              <button
                onClick={addToWallet}
                disabled={isWalletLoading}
                className={`px-6 py-2 rounded-lg transition ${isWalletLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {isWalletLoading ? 'Генерация карты...' : 'Выпустить карту лояльности'}
              </button>
              <div id="google-wallet-button" className="mt-4"></div>
            </div>
          </div>
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}