// components/depository/CategoryManager.jsx
'use client';

import { useState, useEffect } from 'react';
import CategorySelect from './CategorySelect';
import styles from './CategoryManager.module.css';

export default function CategoryManager({ categories, onCategoriesUpdated }) {
  const [localCategories, setLocalCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    parent: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalCategories(categories || []);
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Введите название категории');
      return;
    }

    setLoading(true);
    try {
      const url = editingCategory 
        ? `/api/depository/categories/${editingCategory}`
        : '/api/depository/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({ name: '', parent: '', description: '' });
        setEditingCategory(null);
        onCategoriesUpdated();
        alert(editingCategory ? 'Категория обновлена' : 'Категория создана');
      } else {
        alert(result.message || 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Ошибка при сохранении категории');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setFormData({
      name: category.name,
      parent: category.parent?._id || '',
      description: category.description || ''
    });
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      const response = await fetch(`/api/depository/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onCategoriesUpdated();
        alert('Категория удалена');
      } else {
        const error = await response.json();
        alert(error.message || 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', parent: '', description: '' });
  };

  return (
    <div className={styles.container}>
      <h2>{editingCategory ? 'Редактирование категории' : 'Создание новой категории'}</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Название категории *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Введите название категории"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="parent">Родительская категория</label>
          <CategorySelect
            categories={localCategories}
            value={formData.parent}
            onChange={(value) => setFormData(prev => ({ ...prev, parent: value }))}
            placeholder="Без родительской категории"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows="3"
            placeholder="Введите описание категории (необязательно)"
          />
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            disabled={loading}
            className={styles.saveButton}
          >
            {loading ? 'Сохранение...' : (editingCategory ? 'Обновить категорию' : 'Создать категорию')}
          </button>
          {editingCategory && (
            <button 
              type="button" 
              onClick={handleCancel} 
              className={styles.cancelButton}
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className={styles.categoryList}>
        <h3>Существующие категории</h3>
        {localCategories.length === 0 ? (
          <p className={styles.emptyMessage}>Категории не найдены. Создайте первую категорию выше.</p>
        ) : (
          <div className={styles.categoriesGrid}>
            {localCategories.map(category => (
              <div key={category._id} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <h4>{category.name}</h4>
                  <div className={styles.categoryActions}>
                    <button 
                      onClick={() => handleEdit(category)}
                      className={styles.editButton}
                    >
                      Редактировать
                    </button>
                    <button 
                      onClick={() => handleDelete(category._id)}
                      className={styles.deleteButton}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className={styles.categoryDescription}>{category.description}</p>
                )}
                {category.parent && (
                  <p className={styles.categoryParent}>
                    Родительская категория: {category.parent.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}