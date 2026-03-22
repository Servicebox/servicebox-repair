// components/PrivacyCheckbox/PrivacyCheckbox.jsx
'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import Link from 'next/link';
import styles from './PrivacyCheckbox.module.css';

const PrivacyCheckbox = forwardRef(({ 
  onAgreementChange, 
  required = true,
  formId = "default",
  className = ""
}, ref) => {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const isChecked = e.target.checked;
    setAgreed(isChecked);
    setError('');
    
    if (onAgreementChange) {
      onAgreementChange(isChecked);
    }
  };

  const validate = () => {
    if (required && !agreed) {
      setError('Необходимо согласие на обработку персональных данных');
      return false;
    }
    setError('');
    return true;
  };

  // Предоставляем метод validate родительскому компоненту
  useImperativeHandle(ref, () => ({
    validate
  }));

  return (
    <div className={`${styles.checkboxContainer} ${className}`}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={handleChange}
          className={styles.checkboxInput}
          required={required}
          data-validate="privacy" // Исправлено: передаем строку вместо функции
        />
        <span className={styles.checkboxCustom}></span>
        <span className={styles.checkboxText}>
          Я соглашаюсь с{' '}
          <Link href="/privacy-policy" className={styles.link} target="_blank">
            Политикой обработки персональных данных
          </Link>{' '}
          и даю{' '}
          <Link href="/consent" className={styles.link} target="_blank">
            Согласие на обработку персональных данных
          </Link>
        </span>
      </label>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
});

PrivacyCheckbox.displayName = 'PrivacyCheckbox';

export default PrivacyCheckbox;