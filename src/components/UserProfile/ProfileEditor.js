'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './ProfileEditor.module.css';

export default function ProfileEditor() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    bio: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
        city: currentUser.city || '',
        bio: currentUser.bio || ''
      });
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result);
    };
    reader.readAsDataURL(file);

    // Загрузка на сервер
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('/api/users/avatar/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      setMessage('Аватар успешно загружен');
    } catch (err) {
      setError('Ошибка при загрузке аватара');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Ошибка обновления профиля');
      const data = await response.json();
      setMessage('Профиль успешно обновлен');
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className={styles.container}>Пожалуйста, авторизуйтесь</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Редактирование профиля</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Аватар */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarPreview}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Аватар" />
            ) : (
              <div className={styles.avatarPlaceholder}>Нет фото</div>
            )}
          </div>
          <div className={styles.avatarUpload}>
            <label>Загрузить аватар:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={loading}
            />
            <small>PNG, JPG (макс 5MB)</small>
          </div>
        </div>

        {/* Имя и фамилия */}
        <div className={styles.twoColumns}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">Имя:</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Введите имя"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName">Фамилия:</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Введите фамилию"
            />
          </div>
        </div>

        {/* Телефон и город */}
        <div className={styles.twoColumns}>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Телефон:</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+7 (999) 999-99-99"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="city">Город:</label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Вологда"
            />
          </div>
        </div>

        {/* Биография */}
        <div className={styles.formGroup}>
          <label htmlFor="bio">О себе:</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Расскажите о себе (максимум 500 символов)"
            maxLength={500}
            rows={4}
          />
          <small>{formData.bio.length}/500</small>
        </div>

        {/* Сообщения */}
        {message && <div className={styles.message}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        {/* Кнопка */}
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}
