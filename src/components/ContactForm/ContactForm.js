'use client';

import { useState } from 'react';
import FormWrapper from './FormWrapper';
import styles from './ContactForm.module.css';

const FIELDS = {
  name:    { label: 'Имя', min: 2,  msg: 'Введите имя (минимум 2 символа)' },
  email:   { label: 'Email' },
  phone:   { label: 'Телефон' },
  message: { label: 'Сообщение', min: 10, msg: 'Сообщение слишком короткое' },
};

function validateField(name, value) {
  switch (name) {
    case 'name':
      if (!value || value.trim().length < 2) return FIELDS.name.msg;
      return '';
    case 'email':
      if (!value || !value.trim()) return 'Введите email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Введите корректный email';
      return '';
    case 'phone':
      if (value && value.trim()) {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 7) return 'Введите корректный номер телефона';
      }
      return '';
    case 'message':
      if (value && value.trim().length > 0 && value.trim().length < 10) return FIELDS.message.msg;
      return '';
    default:
      return '';
  }
}

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    const fieldsToValidate = ['name', 'email', 'phone', 'message'];
    const newErrors = {};
    const newTouched = {};
    let hasErrors = false;

    for (const field of fieldsToValidate) {
      newTouched[field] = true;
      const err = validateField(field, formData[field]);
      if (err) { newErrors[field] = err; hasErrors = true; }
    }

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (hasErrors) return;

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ ok: true, message: 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.' });
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTouched({});
        setErrors({});
      } else {
        setResult({ ok: false, message: data.error ?? 'Ошибка отправки. Попробуйте позже.' });
      }
    } catch {
      setResult({ ok: false, message: 'Нет соединения с сервером. Попробуйте позже.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit} className={styles.form}>
      {result && (
        <div className={result.ok ? styles.successMessage : styles.errorMessage}>
          {result.message}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="cf-name" className={styles.label}>Имя *</label>
        <input
          type="text"
          id="cf-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleBlur('name')}
          required
          className={`${styles.input}${touched.name && errors.name ? ' ' + styles.inputInvalid : ''}`}
          placeholder="Ваше имя"
        />
        {touched.name && errors.name && (
          <span className={styles.fieldError}>{errors.name}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-email" className={styles.label}>Email *</label>
        <input
          type="email"
          id="cf-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          required
          className={`${styles.input}${touched.email && errors.email ? ' ' + styles.inputInvalid : ''}`}
          placeholder="example@mail.ru"
        />
        {touched.email && errors.email && (
          <span className={styles.fieldError}>{errors.email}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-phone" className={styles.label}>Телефон</label>
        <input
          type="tel"
          id="cf-phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={() => handleBlur('phone')}
          className={`${styles.input}${touched.phone && errors.phone ? ' ' + styles.inputInvalid : ''}`}
          placeholder="+7 (900) 123-45-67"
        />
        {touched.phone && errors.phone && (
          <span className={styles.fieldError}>{errors.phone}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cf-message" className={styles.label}>Сообщение</label>
        <textarea
          id="cf-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={() => handleBlur('message')}
          rows={4}
          className={`${styles.textarea}${touched.message && errors.message ? ' ' + styles.inputInvalid : ''}`}
          placeholder="Опишите ваш вопрос или проблему"
        />
        {touched.message && errors.message && (
          <span className={styles.fieldError}>{errors.message}</span>
        )}
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading && <span className={styles.loadingSpinner} />}
        {loading ? 'Отправка...' : 'Отправить заявку'}
      </button>
    </FormWrapper>
  );
}
