// components/FormWithoutOverlay/FormWithoutOverlay.js
'use client';

import { useEffect, useState } from 'react';
import Modal from "../Modal/Modal";
import PrivacyCheckbox from "../PrivacyCheckbox/PrivacyCheckbox";
import styles from "./FormWithoutOverlay.module.css";

const FormWithoutOverlay = ({ close, onSave, saving, promotion, submitSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [nameDirty, setNameDirty] = useState(false);
  const [phoneDirty, setPhoneDirty] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [formValid, setFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successSubmit, setSuccessSubmit] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      setSuccessSubmit(true);
      setTimeout(() => {
        setSuccessSubmit(false);
        close && close();
      }, 1000);
    }
  }, [submitSuccess, close]);

  const handleFocus = (field) => {
    if (field === 'name') setNameError('');
    if (field === 'phone') setPhoneError('');
  };

  useEffect(() => {
    const isNameValid = name.trim().length >= 2;
    const isPhoneValid = /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(phone);
    
    setNameError(!isNameValid ? 'Минимум 2 буквы' : '');
    setPhoneError(!isPhoneValid ? 'Некорректный номер' : '');
    
    setFormValid(isNameValid && isPhoneValid && privacyAgreed);
  }, [name, phone, privacyAgreed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!privacyAgreed) {
      setSubmitError('Необходимо согласие на обработку персональных данных');
      return;
    }

    setIsLoading(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          phone, 
          description,
          promotion: promotion?.title || 'Общая заявка',
          source: 'FormWithoutOverlay'
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        onSave && onSave({ name, phone, description, promotion: promotion?.title });
        
        setSuccessSubmit(true);
        setName('');
        setPhone('');
        setDescription('');
        setPrivacyAgreed(false);
        
        setTimeout(() => {
          setSuccessSubmit(false);
          close && close();
        }, 1000);
      } else {
        setSubmitError(result.error || 'Ошибка при отправке');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (name === 'name') setNameDirty(true);
    if (name === 'phone') setPhoneDirty(true);
  };

  return (
    <div className={styles.formContainerGift}>
      <div className={styles.formCardGift}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            <span className={styles.highlight}>Бесплатная</span> консультация
          </h2>
          <p className={styles.formSubtitle}>
            {promotion ? `Акция: ${promotion.title}` : 'Оставьте заявку и наш специалист свяжется с вами в течение 15 минут'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.formBody}>
          <div className={`${styles.formGroup} ${nameError && nameDirty ? styles.error : ''}`}>
            <label className={styles.formLabel}>
              <input
                className={styles.formInput}
                type="text"
                value={name}
                name="name"
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                placeholder=" "
                onFocus={() => handleFocus('name')}
                required
              />
              <span className={styles.inputLabel}>Ваше имя *</span>
              {nameError && nameDirty && <div className={styles.errorMessage}>{nameError}</div>}
            </label>
          </div>
          
          <div className={`${styles.formGroup} ${phoneError && phoneDirty ? styles.error : ''}`}>
            <label className={styles.formLabel}>
              <input
                className={styles.formInput}
                type="tel"
                value={phone}
                name="phone"
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handleBlur}
                placeholder=" "
                onFocus={() => handleFocus('phone')}
                required
              />
              <span className={styles.inputLabel}>Номер телефона *</span>
              {phoneError && phoneDirty && <div className={styles.errorMessage}>{phoneError}</div>}
            </label>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <textarea
                className={styles.formTextarea}
                value={description}
                name="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder=" "
                rows={3}
              />
              <span className={styles.inputLabel}>Опишите вашу проблему</span>
            </label>
          </div>

          {/* Чекбокс согласия */}
          <div className={styles.privacySection}>
            <PrivacyCheckbox 
              onAgreementChange={setPrivacyAgreed}
              required={true}
            />
          </div>
          
          <button 
            className={`${styles.submitBtn} ${formValid ? styles.active : ''}`}
            type="submit"
            disabled={!formValid || isLoading || saving}
          >
            {isLoading || saving ? (
              <div className={styles.spinner}></div>
            ) : (
              'Отправить заявку'
            )}
          </button>
        </form>

        {successSubmit && (
          <Modal onClose={() => setSuccessSubmit(false)}>
            <div className={styles.successModal}>
              <div className={styles.successIcon}>✓</div>
              <h3>Заявка отправлена!</h3>
              <p>Мы свяжемся с вами в ближайшее время</p>
              <div className={styles.successCountdown}>
                <div className={styles.countdownBar}></div>
              </div>
            </div>
          </Modal>
        )}
        
        {submitError && (
          <Modal onClose={() => setSubmitError('')}>
            <div className={styles.errorModal}>
              <h3>Ошибка</h3>
              <p>{submitError}</p>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setSubmitError('')}
              >
                Закрыть
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default FormWithoutOverlay;