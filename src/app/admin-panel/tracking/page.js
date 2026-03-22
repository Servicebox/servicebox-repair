'use client';
import { useState, useEffect } from 'react';

export default function TrackingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const result = await response.json();
        
        // Проверяем структуру ответа
        if (result.success && Array.isArray(result.data)) {
          // Новый формат: {success: true, data: [...]}
          setBookings(result.data);
        } else if (Array.isArray(result)) {
          // Старый формат: просто массив
          setBookings(result);
        } else {
          console.error('Неожиданный формат данных:', result);
          setBookings([]);
        }
      } else {
        console.error('Ошибка HTTP:', response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления статуса
  const updateBookingStatus = async (bookingId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
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
        
        // Показываем уведомление
        showNotification('Статус успешно обновлен!', 'success');
      } else {
        throw new Error(result.message || 'Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      showNotification(error.message || 'Ошибка при обновлении статуса', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Вспомогательная функция для показа уведомлений
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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

  // Компонент для выбора статуса
  const StatusSelector = ({ booking, onUpdate }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const statuses = [
      { value: 'pending', label: '⏳ Ожидает', color: 'bg-gray-100 text-gray-800' },
      { value: 'confirmed', label: '✅ Подтвержден', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'in_progress', label: '🔧 В работе', color: 'bg-blue-100 text-blue-800' },
      { value: 'completed', label: '🎉 Завершен', color: 'bg-green-100 text-green-800' },
      { value: 'canceled', label: '❌ Отменен', color: 'bg-red-100 text-red-800' }
    ];

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)} hover:opacity-90 transition-opacity`}
          disabled={isUpdating}
        >
          {getStatusText(booking.status)}
          <span className="ml-2 text-xs">▼</span>
        </button>
        
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    onUpdate(booking._id, status.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${status.color} ${
                    booking.status === status.value ? 'font-bold' : ''
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Отслеживание заказов</h1>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          Обновить
        </button>
      </div>
      
      {isUpdating && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
          Обновление статуса...
        </div>
      )}
      
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
                
                {/* Кнопка для изменения статуса */}
                <StatusSelector 
                  booking={booking}
                  onUpdate={updateBookingStatus}
                />
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