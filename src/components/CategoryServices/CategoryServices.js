'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryServices({ categoryId, categoryName }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCategoryServices();
  }, [categoryId]);

  const fetchCategoryServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');

      if (response.ok) {
        const allServices = await response.json();

        // Фильтруем услуги по parent категории
        const categoryServices = allServices.filter(service =>
          !service.isCategory && service.parent && service.parent._id === categoryId
        );

        setServices(categoryServices);
      }
    } catch (error) {
      console.error('Error fetching category services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-primary hover:text-primaryDark mr-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад к категориям
            </button>
          </div>

          <div className="bg-bg rounded-lg shadow p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-surface rounded w-1/4"></div>
              <div className="h-10 bg-surface rounded"></div>
              {[1, 2, 3].map(n => (
                <div key={n} className="h-20 bg-surface rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-4">
      <div className="max-w-4xl mx-auto">
        {/* Хлебные крошки */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/services')}
            className="flex items-center text-primary hover:text-primaryDark mr-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к категориям
          </button>
          <span className="text-muted">/</span>
          <span className="ml-4 text-muted font-medium">{categoryName}</span>
        </div>

        {/* Заголовок и поиск */}
        <div className="bg-bg rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-text mb-2">{categoryName}</h1>

          <div className="relative">
            <input
              type="text"
              placeholder="Поиск услуги..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Список услуг */}
        <div className="bg-bg rounded-lg shadow">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-text mb-2">
                {searchTerm ? 'Ничего не найдено' : 'В этой категории пока нет услуг'}
              </h3>
              <p className="text-muted mb-4">
                {searchTerm
                  ? 'Попробуйте изменить поисковый запрос или выбрать другую категорию'
                  : 'Скоро здесь появятся новые услуги'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-primary hover:text-primaryDark font-medium"
                >
                  Очистить поиск
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <div key={service._id} className="p-6 hover:bg-surface transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text mb-2">
                        {service.name}
                      </h3>
                      <p className="text-muted mb-3">
                        {service.description}
                      </p>

                      {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {service.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primaryBg text-primaryDark"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      {service.price && (
                        <div className="text-xl font-bold text-text mb-2">
                          {parseInt(service.price).toLocaleString('ru-RU')} ₽
                        </div>
                      )}
                      <button
                        onClick={() => router.push(`/booking?serviceId=${service._id}`)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryDark transition-colors font-medium"
                      >
                        Записаться
                      </button>
                    </div>
                  </div>

                  {service.metaDescription && service.metaDescription !== service.description && (
                    <div className="mt-3 p-3 bg-surface rounded-lg border">
                      <p className="text-sm text-muted">{service.metaDescription}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}