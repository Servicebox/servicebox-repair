'use client';

import { useState, useEffect } from 'react';


const ServicesAdmin = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    serviceName: '',
    description: '',
    price: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Загрузка услуг
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
        setFilteredServices(data.data);
      } else {
        console.error('Ошибка загрузки:', data.error);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Фильтрация услуг
  useEffect(() => {
    let result = services;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(service =>
        service.serviceName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
      );
    }

    setFilteredServices(result);
  }, [searchQuery, services]);

  // Создание услуги
  const handleCreateService = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newService),
      });

      const data = await response.json();

      if (data.success) {
        setNewService({ serviceName: '', description: '', price: '', category: '' });
        await fetchServices();
        alert('Услуга успешно создана!');
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      alert('Ошибка сети при создании услуги');
    } finally {
      setSaving(false);
    }
  };

  // Обновление услуги
  const handleUpdateService = async () => {
    if (!editingService) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/services/${editingService._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingService),
      });

      const data = await response.json();

      if (data.success) {
        setEditingService(null);
        await fetchServices();
        alert('Услуга успешно обновлена!');
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      alert('Ошибка сети при обновлении услуги');
    } finally {
      setSaving(false);
    }
  };

  // Удаление услуги
  const handleDeleteService = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchServices();
        alert('Услуга успешно удалена!');
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error) {
      alert('Ошибка сети при удалении услуги');
    }
  };

  // Начало редактирования
  const startEditing = (service) => {
    setEditingService({ ...service });
  };

  // Отмена редактирования
  const cancelEditing = () => {
    setEditingService(null);
  };

  // Обработчики изменений
  const handleNewServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleEditServiceChange = (e) => {
    const { name, value } = e.target;
    setEditingService(prev => ({ ...prev, [name]: value }));
  };

  // Уникальные категории для подсказок
  const categories = [...new Set(services.map(service => service.category))];

  if (loading) {
    return (
      <div className="services-admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка услуг...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-admin">
      <div className="admin-header">
        <h1>Управление услугами</h1>
        <p>Создание, редактирование и удаление услуг</p>
      </div>

      {/* Форма создания новой услуги */}
      <div className="create-service-section">
        <h2>Добавить новую услугу</h2>
        <form onSubmit={handleCreateService} className="service-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Название услуги *</label>
              <input
                type="text"
                name="serviceName"
                value={newService.serviceName}
                onChange={handleNewServiceChange}
                placeholder="Например: Замена экрана iPhone"
                required
              />
            </div>

            <div className="form-group">
              <label>Категория *</label>
              <input
                type="text"
                name="category"
                value={newService.category}
                onChange={handleNewServiceChange}
                list="categories"
                placeholder="Например: Телефоны"
                required
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Цена *</label>
              <input
                type="text"
                name="price"
                value={newService.price}
                onChange={handleNewServiceChange}
                placeholder="Например: 2990 ₽ или Бесплатно"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Описание *</label>
              <textarea
                name="description"
                value={newService.description}
                onChange={handleNewServiceChange}
                placeholder="Подробное описание услуги..."
                rows="3"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="submit-btn">
            {saving ? 'Создание...' : 'Создать услугу'}
          </button>
        </form>
      </div>

      {/* Список услуг */}
      <div className="services-list-section">
        <div className="section-header">
          <h2>Все услуги ({filteredServices.length})</h2>
          <div className="controls">
            <input
              type="text"
              placeholder="Поиск услуг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <p>Услуги не найдены</p>
          </div>
        ) : (
          <>
            <div className="services-table">
              <div className="table-header">
                <div>Услуга</div>
                <div>Описание</div>
                <div>Цена</div>
                <div>Категория</div>
                <div>Действия</div>
              </div>

              <div className="table-body">
                {(showAll ? filteredServices : filteredServices.slice(0, 15)).map(service => (
                  <div key={service._id} className="table-row">
                    {editingService && editingService._id === service._id ? (
                      // Режим редактирования
                      <>
                        <div className="table-cell">
                          <input
                            type="text"
                            name="serviceName"
                            value={editingService.serviceName}
                            onChange={handleEditServiceChange}
                            className="edit-input"
                          />
                        </div>
                        <div className="table-cell">
                          <textarea
                            name="description"
                            value={editingService.description}
                            onChange={handleEditServiceChange}
                            className="edit-textarea"
                            rows="2"
                          />
                        </div>
                        <div className="table-cell">
                          <input
                            type="text"
                            name="price"
                            value={editingService.price}
                            onChange={handleEditServiceChange}
                            className="edit-input"
                          />
                        </div>
                        <div className="table-cell">
                          <input
                            type="text"
                            name="category"
                            value={editingService.category}
                            onChange={handleEditServiceChange}
                            list="categories"
                            className="edit-input"
                          />
                        </div>
                        <div className="table-cell actions">
                          <button
                            onClick={handleUpdateService}
                            disabled={saving}
                            className="save-btn"
                          >
                            {saving ? '...' : '✓'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="cancel-btn"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    ) : (
                      // Режим просмотра
                      <>
                        <div className="table-cell">
                          <strong>{service.serviceName}</strong>
                        </div>
                        <div className="table-cell">
                          {service.description}
                        </div>
                        <div className="table-cell price">
                          {service.price}
                        </div>
                        <div className="table-cell category">
                          <span className="category-badge">{service.category}</span>
                        </div>
                        <div className="table-cell actions">
                          <button
                            onClick={() => startEditing(service)}
                            className="edit-btn"
                            title="Редактировать"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            className="delete-btn"
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {filteredServices.length > 15 && (
              <div className="show-more-section">
                {!showAll ? (
                  <button
                    onClick={() => setShowAll(true)}
                    className="show-more-btn"
                  >
                    Показать все ({filteredServices.length})
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAll(false)}
                    className="show-less-btn"
                  >
                    Скрыть
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesAdmin;