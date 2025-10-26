// components/FormWrapper.jsx
'use client';

import { useState } from 'react';
import PrivacyCheckbox from '../PrivacyCheckbox/PrivacyCheckbox';
import styles from './FormWrapper.module.css';

export default function FormWrapper({ 
  children, 
  onSubmit, 
  className = '',
  showPrivacyCheckbox = true 
}) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handlePrivacyChange = (agreed) => {
    setPrivacyAgreed(agreed);
    if (agreed) {
      setFormErrors(prev => ({ ...prev, privacy: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (showPrivacyCheckbox && !privacyAgreed) {
      setFormErrors({ privacy: 'Необходимо согласие на обработку персональных данных' });
      return;
    }

    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${styles.form} ${className}`}
      noValidate
    >
      {children}
      
      {showPrivacyCheckbox && (
        <>
          <PrivacyCheckbox onAgreementChange={handlePrivacyChange} />
          {formErrors.privacy && (
            <div className={styles.error}>{formErrors.privacy}</div>
          )}
        </>
      )}
    </form>
  );
}