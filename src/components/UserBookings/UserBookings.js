'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      // Получаем все бронирования и фильтруем по текущему пользователю
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const allBookings = await response.json();
        
        // Фильтруем бронирования по email или телефону пользователя
        const userBookings = allBookings.filter(booking => 
          booking.userEmail === user?.email || 
          booking.userPhone === user?.phone
        );
        
        setBookings(userBookings);
      } else {
        setError('Ошибка при загрузке записей');
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError('Ошибка при загрузке записей');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Ожидает подтверждения',
      'confirmed': '✅ Подтверждена',
      'in_progress': '🔧 В работе', 
      'completed': '🎉 Завершена',
      'canceled': '❌ Отменена'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Мои записи на услуги</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Мои записи на услуги</h2>
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Мои записи на услуги</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-lg mb-2">У вас пока нет записей на услуги</p>
          <p className="text-sm text-gray-400 mb-4">
            Запишитесь на услугу, чтобы отслеживать её статус здесь
          </p>
          <a 
            href="/services" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Записаться на услугу
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {booking.serviceName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Код отслеживания: <strong className="font-mono">{booking.trackingCode}</strong>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-600">Дата записи:</p>
                  <p className="font-medium">
                    {new Date(booking.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Устройство:</p>
                  <p className="font-medium">{booking.deviceModel || 'Не указано'}</p>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 font-medium mb-1">Ваши заметки:</p>
                  <p className="text-sm text-gray-700">{booking.notes}</p>
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <a 
                  href={`/tracking?code=${booking.trackingCode}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Отслеживать статус
                </a>
                <span className="text-xs text-gray-500">
                  Обновлено: {new Date(booking.updatedAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
