'use client';

import { useState, useEffect } from 'react';
import ServiceTree from './ServiceTree';
import ServiceForm from './ServiceForm';
import styles from './ListService.css'
const ListService = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('tree');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/services?tree=true');

      if (!response.ok) throw new Error('Ошибка загрузки услуг');

      const data = await response.json();

      if (data.success) {
        setServices(data.data || []);
      } else {
        throw new Error(data.error || 'Ошибка загрузки данных');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (parent = null) => {
    setSelectedService({
      parent: parent?._id || null,
      isCategory: true,
      level: parent ? (parent.level || 0) + 1 : 0
    });
    setShowForm(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleDelete = async (slug) => {
    if (!confirm('Удалить эту услугу/категорию?')) return;

    try {
      const response = await fetch(`/api/services/${encodeURIComponent(slug)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await fetchServices();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Ошибка удаления: ' + error.message);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedService(null);
  };

  const handleFormSuccess = () => {
    fetchServices();
    handleFormClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка структуры услуг...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              Древовидная структура услуг
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Управление категориями и услугами
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск услуг..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'tree'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => setViewMode('tree')}
              >
                Дерево
              </button>
              <button
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
                onClick={() => setViewMode('list')}
              >
                Список
              </button>
            </div>

            {/* Create Button */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center text-sm"
              onClick={() => handleCreate()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать категорию
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <button
              onClick={fetchServices}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {viewMode === 'tree' ? (
          <ServiceTree
            services={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            searchTerm={searchTerm}
          />
        ) : (
          <ServiceList
            services={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
          />
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <ServiceForm
          service={selectedService}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

// ============================================================
// ServiceList - адаптивная таблица / карточки
// ============================================================
const ServiceList = ({ services, onEdit, onDelete, searchTerm }) => {
  const flattenServices = (services, level = 0) => {
    let result = [];
    services.forEach(service => {
      const matchesSearch = !searchTerm ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.slug.toLowerCase().includes(searchTerm.toLowerCase());

      if (matchesSearch) {
        result.push({ ...service, level });
      }
      if (service.children) {
        result = result.concat(flattenServices(service.children, level + 1));
      }
    });
    return result;
  };

  const allServices = flattenServices(services);

  if (allServices.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-12 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Услуги не найдены</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop таблица (видна на md и выше) */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
            <div className="col-span-5">Название</div>
            <div className="col-span-2">Тип</div>
            <div className="col-span-2">Цена</div>
            <div className="col-span-2">Slug</div>
            <div className="col-span-1 text-center">Действия</div>
          </div>
          <div className="divide-y divide-gray-200">
            {allServices.map(service => (
              <div
                key={service._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
              >
                <div className="col-span-5">
                  <div
                    className="flex items-center gap-3"
                    style={{ paddingLeft: `${service.level * 24}px` }}
                  >
                    {service.isCategory ? (
                      <div className="w-12 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-12 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 break-words">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.isCategory
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {service.isCategory ? 'Категория' : 'Услуга'}
                  </span>
                </div>
                <div className="col-span-2 text-gray-900 font-medium">
                  {service.price ? `${service.price} ₽` : '—'}
                </div>
                <div className="col-span-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono break-all">
                    {service.slug}
                  </code>
                </div>
                <div className="col-span-1 flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(service)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Редактировать"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(service.slug)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile карточки (видно только на мобильных) */}
      <div className="md:hidden p-4 space-y-4">
        {allServices.map(service => (
          <div
            key={service._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {service.isCategory ? (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-base break-words">{service.name}</div>
                  {service.description && (
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</div>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Тип:</span>{' '}
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${service.isCategory ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {service.isCategory ? 'Категория' : 'Услуга'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Цена:</span>{' '}
                  <span className="font-medium">{service.price ? `${service.price} ₽` : '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Slug:</span>{' '}
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono break-all">
                    {service.slug}
                  </code>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => onEdit(service)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редактировать
                </button>
                <button
                  onClick={() => onDelete(service.slug)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ListService;