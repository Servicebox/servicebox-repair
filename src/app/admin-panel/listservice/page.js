// app/admin-panel/listservice/page.js
'use client';

import { useState, useEffect } from 'react';
import './ListService.css';

const ListService = () => {
  const [services, setServices] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    serviceName: '',
    description: '',
    price: '',
    category: ''
  });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/services');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services: ', error);
      setError('Не удалось загрузить услуги. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = () => setShowAll(true);
  const handleHideAll = () => setShowAll(false);

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return;
    
    try {
      const response = await fetch(`/api/services/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }
      
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service: ', error);
      alert('Ошибка при удалении услуги: ' + error.message);
    }
  };

  const handleEdit = (service) => {
    setEditingService({ ...service });
  };

  const handleSave = async () => {
    if (!editingService) return;
    
    try {
      const response = await fetch(`/api/services/${editingService._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service');
      }
      
      setEditingService(null);
      await fetchServices();
    } catch (error) {
      console.error('Error updating service: ', error);
      alert('Ошибка при обновлении услуги: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingService(prev => ({ ...prev, [name]: value }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleNewSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add service');
      }
      
      setNewService({ serviceName: '', description: '', price: '', category: '' });
      await fetchServices();
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Ошибка при добавлении услуги: ' + error.message);
    }
    
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditingService(null);
  };

  const filteredServices = services.filter(service =>
    service.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Получаем уникальные категории для подсказок
  const categories = [...new Set(services.map(service => service.category).filter(Boolean))];

  if (loading) {
    return (
      <div className='list-service'>
        <div className="loading-message">Загрузка услуг...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='list-service'>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchServices}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className='list-service'>
      <div className="list-service__title-row">
        <h1>Список услуг</h1>
        <input
          type="text"
          placeholder="Поиск услуги..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className='listservice-allservice'>
        {/* Заголовки таблицы */}
        <div className='listservice-format-main'>
          <p>Услуга</p>
          <p>Описание</p>
          <p>Цена</p>
          <p>Категория</p>
          <p>Действия</p>
        </div>

        {/* Форма добавления новой услуги */}
        <form className='listservice-format-main listservice-format listservice-create-row' onSubmit={handleNewSubmit}>
          <input
            className='admin__input'
            name="serviceName"
            value={newService.serviceName}
            onChange={handleNewChange}
            placeholder="Название услуги"
            required
          />
          <input
            className='admin__input'
            name="description"
            value={newService.description}
            onChange={handleNewChange}
            placeholder="Описание услуги"
            required
          />
          <input
            className='admin__input'
            name="price"
            value={newService.price}
            onChange={handleNewChange}
            placeholder="Цена (например: 1000 ₽)"
            required
          />
          <input
            className='admin__input'
            name="category"
            value={newService.category}
            onChange={handleNewChange}
            placeholder="Категория"
            list="categories"
            required
          />
          <datalist id="categories">
            {categories.map((category, index) => (
              <option key={index} value={category} />
            ))}
          </datalist>
          <button className='create__btn' type="submit" disabled={adding}>
            {adding ? "Добавление..." : "Добавить"}
          </button>
        </form>

        <hr />

        {/* Список услуг */}
        {filteredServices.slice(0, showAll ? filteredServices.length : 15).map(service => (
          <div key={service._id} className='listservice-format-main listservice-format'>
            {editingService && editingService._id === service._id ? (
              // Режим редактирования
              <>
                <input 
                  name="serviceName" 
                  value={editingService.serviceName} 
                  onChange={handleChange}
                  className="edit-input"
                />
                <input 
                  name="description" 
                  value={editingService.description} 
                  onChange={handleChange}
                  className="edit-input"
                />
                <input 
                  name="price" 
                  value={editingService.price} 
                  onChange={handleChange}
                  className="edit-input"
                />
                <input 
                  name="category" 
                  value={editingService.category} 
                  onChange={handleChange}
                  className="edit-input"
                  list="categories"
                />
                <div className='list-btn'>
                  <button onClick={handleSave} className="save-btn">Сохранить</button>
                  <button onClick={cancelEdit} className="cancel-btn">Отмена</button>
                </div>
              </>
            ) : (
              // Режим просмотра
              <>
                <p className="service-name">{service.serviceName}</p>
                <p className="service-description">{service.description}</p>
                <p className="service-price">{service.price}</p>
                <p className="service-category">{service.category}</p>
                <div className='list-btn'>
                  <button className='list-button edit-btn' onClick={() => handleEdit(service)}>
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className='list-button delete-btn'
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Кнопка показать/скрыть все */}
        {filteredServices.length > 15 && (
          <div className="show-more-container">
            {!showAll ? (
              <button className='glass__btn-active' onClick={handleShowAll}>
                Показать все услуги ({filteredServices.length})
              </button>
            ) : (
              <button className='glass__btn' onClick={handleHideAll}>
                Скрыть
              </button>
            )}
          </div>
        )}

        {filteredServices.length === 0 && (
          <div className="no-services">
            <p>Услуги не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListService;