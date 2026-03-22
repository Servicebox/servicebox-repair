// src/app/tracking/page.js
'use client';
import { useState } from 'react';

export default function PublicTrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const response = await fetch(`/api/bookings/track/${trackingCode.trim()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setBooking(data.booking);
      } else {
        setError(data.error || 'Запись не найдена');
      }
    } catch (err) {
      setError('Ошибка при поиске записи');
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '🟡 Ожидает подтверждения',
      'confirmed': '🔵 Подтверждена', 
      'in_progress': '🟠 В работе',
      'completed': '🟢 Завершена',
      'canceled': '🔴 Отменена'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Отслеживание записи на услугу
          </h1>
          <p className="text-gray-600">
            Введите код отслеживания чтобы узнать статус вашей записи
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="Введите код отслеживания"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Поиск...' : 'Найти'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {booking && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Информация о записи</h2>
              <p>Код: {booking.trackingCode}</p>
            </div>
            
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Детали услуги</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Услуга:</span> {booking.serviceName}</p>
                  <p><span className="text-gray-600">Устройство:</span> {booking.deviceModel || 'Не указано'}</p>
                  <p><span className="text-gray-600">Дата:</span> {new Date(booking.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Клиент</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Имя:</span> {booking.userName}</p>
                  <p><span className="text-gray-600">Телефон:</span> {booking.userPhone}</p>
                  <p><span className="text-gray-600">Email:</span> {booking.userEmail || 'Не указан'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Статус</h3>
                  <p className="text-gray-600">Текущее состояние записи</p>
                </div>
                <span className="text-lg font-semibold">
                  {getStatusText(booking.status)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}