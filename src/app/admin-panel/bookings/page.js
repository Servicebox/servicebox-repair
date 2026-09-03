'use client';
import { useState, useEffect } from 'react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/bookings');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки бронирований');
      }
      
      const result = await response.json();
      
      // Исправление: получаем данные из result.data
      if (result.success) {
        setBookings(result.data || []);
      } else {
        throw new Error(result.message || 'Ошибка загрузки данных');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Обновляем локальное состояние
        setBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));
        setSelectedBooking(null);
        alert('Статус успешно обновлен!');
      } else {
        throw new Error(result.message || 'Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(error.message || 'Ошибка при обновлении статуса');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'canceled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Ожидает',
      'confirmed': '✅ Подтвержден',
      'in_progress': '🔧 В работе',
      'completed': '🎉 Завершен',
      'canceled': '❌ Отменен'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка бронирований...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление бронированиями
          </h1>
          <p className="text-gray-600">
            Всего бронирований: {bookings.length}
          </p>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-red-800 font-medium">{error}</span>
              </div>
              <button 
                onClick={fetchBookings}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        {/* Таблица бронирований */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет бронирований</h3>
              <p className="text-gray-500 mb-4">Здесь будут отображаться все созданные записи</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Код
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Услуга
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Телефон
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Устройство
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {booking.trackingCode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.serviceName}</div>
                        {booking.serviceId?.name && (
                          <div className="text-sm text-gray-500">{booking.serviceId.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                        {booking.userEmail && (
                          <div className="text-sm text-gray-500">{booking.userEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.userPhone}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.deviceModel}</div>
                        {booking.notes && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {booking.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                        >
                          Изменить статус
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Модальное окно изменения статуса */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Изменить статус бронирования
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Код: <strong>{selectedBooking.trackingCode}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Услуга: <strong>{selectedBooking.serviceName}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Клиент: <strong>{selectedBooking.userName}</strong>
                </p>
              </div>
              
              <div className="p-6 space-y-3">
                {['pending', 'confirmed', 'in_progress', 'completed', 'canceled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateBookingStatus(selectedBooking._id, status)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selectedBooking.status === status
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getStatusText(status)}</span>
                      {selectedBooking.status === status && (
                        <span className="text-blue-600 font-bold">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}