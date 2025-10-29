'use client';
import { useState, useEffect } from 'react';

export default function TrackingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Ожидает подтверждения',
      'confirmed': '✅ Подтвержден',
      'in_progress': '🔧 В работе',
      'completed': '🎉 Завершен',
      'canceled': '❌ Отменен'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Отслеживание заказов</h1>
      
      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.serviceName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Код отслеживания: <strong>{booking.trackingCode}</strong>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Клиент:</p>
                  <p className="font-medium">{booking.userName}</p>
                  <p className="text-gray-600 mt-1">Телефон:</p>
                  <p className="font-medium">{booking.userPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Устройство:</p>
                  <p className="font-medium">{booking.deviceModel || 'Не указано'}</p>
                  <p className="text-gray-600 mt-1">Дата создания:</p>
                  <p className="font-medium">
                    {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Заметки:</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              )}

              {/* История статусов */}
              {booking.statusHistory && booking.statusHistory.length > 1 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">История статусов:</p>
                  <div className="space-y-1">
                    {booking.statusHistory.slice(1).map((history, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        <span>
                          {new Date(history.changedAt).toLocaleDateString('ru-RU')} - {getStatusText(history.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Нет активных заказов для отслеживания
        </div>
      )}
    </div>
  );
}
