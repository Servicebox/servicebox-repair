// components/Form/Form.js
'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "./Form.module.css";
import Modal from "../Modal/Modal";
import PrivacyCheckbox from "../PrivacyCheckbox/PrivacyCheckbox";
const CloseIcon = "/images/closes.svg";

const initialState = { name: "", phone: "", description: "" };

export default function Form({ onClose }) {
  const [values, setValues] = useState(initialState);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = {
    name: useRef(null),
    phone: useRef(null),
    description: useRef(null),
  };

  // Validation
  useEffect(() => {
    setErrors(validate(values));
  }, [values]);

  // ESC key to close
  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  function validate(v) {
    const err = {};
    if (!v.name.trim()) err.name = "Имя не может быть пустым";
    else if (!/^([а-яёa-z]{2,})$/i.test(v.name)) err.name = "Только буквы, минимум 2 символа";
    if (!v.phone.trim()) err.phone = "Телефон не может быть пустым";
    else if (!/^\+?[78][-(]?\d{3}\)?-?\d{3}-?\d{2}-?\d{2}$/.test(v.phone.trim())) err.phone = "Некорректный номер";
    return err;
  }

  const isValid = Object.keys(errors).length === 0 && values.name && values.phone && privacyAgreed;

  const onChange = e => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onBlur = e => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    
    if (!privacyAgreed) {
      setSubmitError('Необходимо согласие на обработку персональных данных');
      return;
    }
    
    if (!isValid) return;
    
    setIsLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          source: "FormOverlay"
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setValues(initialState);
          setPrivacyAgreed(false);
          onClose();
        }, 1200);
      } else {
        setSubmitError(result.error || "Ошибка при отправке");
      }
    } catch (e) {
      setSubmitError("Ошибка соединения");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.formOverlay}>
      <div className={styles.formContainer} tabIndex={-1}>
        <h2 className={styles.formTitle}>
          Оставьте заявку на <span className={styles.besplatnaya}>бесплатную</span> консультацию
        </h2>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <label className={styles.formLabel}>
            <input
              className={`${styles.formInput} ${touched.name && errors.name ? styles.formError : ""}`}
              ref={inputRefs.name}
              type="text"
              maxLength={24}
              name="name"
              value={values.name}
              placeholder="Введите Ваше имя"
              onChange={onChange}
              onBlur={onBlur}
              autoFocus
              required
            />
            <span className={styles.formPlaceholder}>Имя *</span>
          </label>
          {touched.name && errors.name && <div className={styles.errorMsg}>{errors.name}</div>}

          <label className={styles.formLabel}>
            <input
              className={`${styles.formInput} ${touched.phone && errors.phone ? styles.formError : ""}`}
              ref={inputRefs.phone}
              type="text"
              maxLength={18}
              name="phone"
              value={values.phone}
              placeholder="Введите номер телефона"
              onChange={onChange}
              onBlur={onBlur}
              required
            />
            <span className={styles.formPlaceholder}>Телефон *</span>
          </label>
          {touched.phone && errors.phone && <div className={styles.errorMsg}>{errors.phone}</div>}

          <label className={styles.formLabel}>
            <textarea
              className={styles.formInput}
              ref={inputRefs.description}
              name="description"
              value={values.description}
              placeholder="Опишите Вашу проблему..."
              onChange={onChange}
              onBlur={onBlur}
              rows={3}
              maxLength={300}
              style={{ resize: "none" }}
            />
            <span className={styles.formPlaceholder}>Комментарий</span>
          </label>

          {/* Чекбокс согласия */}
          <div className={styles.privacySection}>
            <PrivacyCheckbox 
              onAgreementChange={setPrivacyAgreed}
              required={true}
            />
          </div>

          <button
            className={`${styles.formOverlayBtn} ${isValid ? styles.active : ""}`}
            type="submit"
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Отправка..." : "Отправить форму"}
          </button>
        </form>
        <button className={styles.closeButton} type="button" aria-label="Закрыть" onClick={onClose}>
          <Image className={styles.closeButtonImg} src={CloseIcon} alt="Закрыть" width={26} height={26} />
        </button>

        {submitError && (
          <Modal onClose={() => setSubmitError("")}>
            <h3>Ошибка</h3>
            <p>{submitError}</p>
            <button type="button" onClick={() => setSubmitError("")}>
              Закрыть
            </button>
          </Modal>
        )}

        {success && (
          <Modal onClose={onClose}>
            <p className={styles.successText}>Ваше сообщение успешно отправлено!</p>
          </Modal>
        )}
      </div>
    </div>
  );
}