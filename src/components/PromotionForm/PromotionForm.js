'use client';

import { useState, useEffect } from 'react';
import styles from './PromotionForm.module.css';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-box-35.ru';

export default function PromotionForm({ onSave, saving, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    image: '',
    isActive: true,
    priority: 0,
    conditions: ''
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        shortDescription: initialData.shortDescription || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        image: initialData.image || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        priority: initialData.priority || 0,
        conditions: initialData.conditions || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

// В компоненте PromotionForm исправьте handleFileUpload:
const handleFileUpload = async (file) => {
  if (!file) {
    alert('Файл не выбран');
    return;
  }

  setUploading(true);
  
  try {
    const formData = new FormData();
    formData.append('files', file); // Изменил на 'files'
    formData.append('category', 'promotions'); // Добавил категорию

    const response = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setFormData(prev => ({ ...prev, image: data.image_urls[0] }));
    } else {
      throw new Error(data.error || 'Ошибка загрузки файла');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Ошибка загрузки файла: ${error.message}`);
  } finally {
    setUploading(false);
  }
};

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Введите название акции');
      return;
    }

    if (!formData.description.trim()) {
      alert('Введите описание акции');
      return;
    }

    if (!formData.endDate) {
      alert('Выберите дату окончания акции');
      return;
    }

    if (new Date(formData.endDate) <= new Date()) {
      alert('Дата окончания должна быть в будущем');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Название акции *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Введите название акции..."
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Краткое описание</label>
        <input
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleInputChange}
          placeholder="Краткое описание для карточки..."
          className={styles.input}
          maxLength={200}
        />
        <div className={styles.charCount}>
          {formData.shortDescription.length}/200
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Полное описание *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Подробное описание акции..."
          rows={6}
          required
          className={styles.textarea}
          maxLength={1000}
        />
        <div className={styles.charCount}>
          {formData.description.length}/1000
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Дата начала</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Дата окончания *</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Изображение акции</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
          }}
          disabled={uploading}
          className={styles.fileInput}
        />
        
        {formData.image && (
          <div className={styles.imagePreview}>
            <img src={formData.image} alt="Предпросмотр" className={styles.previewImage} />
            <button 
              type="button"
              onClick={removeImage}
              className={styles.removeImageButton}
              disabled={uploading}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Приоритет</label>
          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            min="0"
            max="10"
            className={styles.input}
          />
          <div className={styles.helpText}>Чем выше число, тем выше приоритет отображения</div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            Активная акция
          </label>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Условия акции</label>
        <textarea
          name="conditions"
          value={formData.conditions}
          onChange={handleInputChange}
          placeholder="Условия участия в акции..."
          rows={3}
          className={styles.textarea}
          maxLength={500}
        />
        <div className={styles.charCount}>
          {formData.conditions.length}/500
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={saving || uploading}
          className={styles.saveButton}
        >
          {saving ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Создать акцию')}
        </button>
      </div>
    </form>
  );
}