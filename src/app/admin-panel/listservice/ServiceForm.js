'use client';

import { useState, useEffect } from 'react';

const ServiceForm = ({ service, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isCategory: false,
    parent: null,
    slug: '',
    metaTitle: '',
    metaDescription: '',
    h1: '',
    content: '',
    features: [''],
    order: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        isCategory: service.isCategory || false,
        parent: service.parent?._id || service.parent || null,
        slug: service.slug || '',
        metaTitle: service.metaTitle || '',
        metaDescription: service.metaDescription || '',
        h1: service.h1 || '',
        content: service.content || '',
        features: service.features && service.features.length > 0 ? service.features : [''],
        order: service.order || 0
      });
    }
    
    fetchCategories();
  }, [service]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/services?tree=true');
      const data = await response.json();
      
      if (data.success) {
        const collectCategories = (items, level = 0) => {
          let result = [];
          items.forEach(item => {
            if (item.isCategory) {
              result.push({
                ...item,
                level: level,
                name: `${'— '.repeat(level)}${item.name}`
              });
              if (item.children && item.children.length > 0) {
                result = result.concat(collectCategories(item.children, level + 1));
              }
            }
          });
          return result;
        };
        
        const allCategories = collectCategories(data.data);
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Ошибка при загрузке категорий');
    }
  };

// В handleSubmit добавьте:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Проверка обязательных полей
    if (!formData.name.trim()) throw new Error('Укажите название');
    if (!formData.description.trim()) throw new Error('Укажите описание');
    if (!formData.slug.trim()) throw new Error('Укажите slug');

    // Подготовка данных
    const submitData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
      price: formData.isCategory ? '' : formData.price
    };

    // Отправка запроса
    const url = service && service._id 
      ? `/api/services/${encodeURIComponent(service.slug)}`
      : '/api/services';
    
    const response = await fetch(url, {
      method: service && service._id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Ошибка сервера');
    }

    if (result.success) {
      onSuccess();
    } else {
      throw new Error(result.error || 'Неизвестная ошибка');
    }
  } catch (error) {
    setError(error.message);
    console.error('Ошибка сохранения:', error);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\u0400-\u04FF\s-]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    setFormData(prev => ({ ...prev, slug }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {service ? 'Редактировать' : 'Создать'} {formData.isCategory ? 'категорию' : 'услугу'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Название *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Ремонт телефонов"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="remont-telefonov"
                  />
                  <button 
                    type="button" 
                    onClick={generateSlug}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Генерировать
                  </button>
                </div>
              </div>
            </div>

            {/* Type and Order */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isCategory"
                    checked={formData.isCategory}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Это категория (папка)
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  Категории используются для группировки услуг и не имеют цены
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Порядок сортировки
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Price for services */}
            {!formData.isCategory && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Цена
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2990 ₽ или Бесплатно"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Описание *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Подробное описание услуги или категории..."
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Родительская категория
              </label>
              <select
                name="parent"
                value={formData.parent || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— Без родителя (корневой уровень) —</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} {cat.level > 0 ? `(уровень ${cat.level})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Выберите родительскую категорию для вложенности
              </p>
            </div>

            {/* SEO Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  H1 заголовок
                </label>
                <input
                  type="text"
                  name="h1"
                  value={formData.h1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.name}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.name}
                />
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows="2"
                maxLength="160"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={formData.description?.substring(0, 160)}
              />
            </div>

            {/* Features for services */}
            {!formData.isCategory && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Особенности услуги
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Например: Гарантия 30 дней"
                      />
                      {formData.features.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeFeature(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={addFeature}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  + Добавить особенность
                </button>
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Дополнительный контент (SEO текст)
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SEO-текст для страницы услуги..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Отмена
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : (
                service ? 'Обновить' : 'Создать'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;