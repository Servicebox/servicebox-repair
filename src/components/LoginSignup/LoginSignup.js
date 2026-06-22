// components/LoginSignup/LoginSignup.js
'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import YandexLoginButton from '../YandexLoginButton/YandexLoginButton';
import styles from './LoginSignup.module.css';

// ── Validation helpers ──────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGIT_RE = /\d/g;

function validateEmail(v) {
  if (!v) return "Введите email";
  if (!EMAIL_RE.test(v)) return "Некорректный формат email";
  return "";
}

function validatePassword(v) {
  if (!v) return "Введите пароль";
  if (v.length < 6) return "Минимум 6 символов";
  return "";
}

function validateUsername(v) {
  if (!v || !v.trim()) return "Введите имя";
  if (v.trim().length < 2) return "Минимум 2 символа";
  return "";
}

function validatePhone(v) {
  if (!v || !v.trim()) return "Введите телефон";
  const digits = (v.match(DIGIT_RE) || []).length;
  if (digits < 10) return "Минимум 10 цифр";
  return "";
}

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) || /[а-яА-Я]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Zа-яА-Я0-9]/.test(pw)) score++;
  if (score <= 1) return 1;
  if (score <= 3) return 2;
  return 3;
}

const STRENGTH_LABELS = ["", "Слабый", "Средний", "Сильный"];

// ── SVG icons ───────────────────────────────────────────────────────────────
function IconEmail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconEye({ show }) {
  return show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const level = getPasswordStrength(password);
  const segClass = (seg) => {
    if (level === 0) return styles.strengthSegment;
    if (seg > level) return styles.strengthSegment;
    if (level === 1) return `${styles.strengthSegment} ${styles.weak}`;
    if (level === 2) return `${styles.strengthSegment} ${styles.medium}`;
    return `${styles.strengthSegment} ${styles.strong}`;
  };
  return (
    <div>
      <div className={styles.strengthBar}>
        <div className={segClass(1)} />
        <div className={segClass(2)} />
        <div className={segClass(3)} />
      </div>
      {password && (
        <div className={styles.strengthLabel}>{STRENGTH_LABELS[level]}</div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
function LoginSignupContent({ isOpen, onClose, onLoginSuccess }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: ""
  });
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState("");

  const [emailForReset, setEmailForReset] = useState("");
  const [resetEmailTouched, setResetEmailTouched] = useState(false);
  const [resetEmailError, setResetEmailError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [showWrongPasswordModal, setShowWrongPasswordModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
    if (token) {
      setMode("Set New Password");
    }
  }, [isOpen, token]);

  const resetForm = () => {
    setFormData({ username: "", email: "", password: "", phone: "" });
    setTouched({});
    setFieldErrors({});
    setShowPassword(false);
    setConsentChecked(false);
    setConsentError("");
    setEmailForReset("");
    setResetEmailTouched(false);
    setResetEmailError("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPw(false);
    setShowConfirmPw(false);
    setShowWrongPasswordModal(false);
    setMode("Login");
    setMessage("");
  };

  // Run validation for a single field, return error string
  const validateField = (name, value) => {
    switch (name) {
      case "email": return validateEmail(value);
      case "password": return validatePassword(value);
      case "username": return validateUsername(value);
      case "phone": return validatePhone(value);
      default: return "";
    }
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const blurHandler = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const inputClass = (name) => {
    if (!touched[name]) return styles.input;
    if (fieldErrors[name]) return `${styles.input} ${styles.inputError}`;
    return `${styles.input} ${styles.inputValid}`;
  };

  // Validate all fields required for current mode
  const validateAllFields = () => {
    const fields = mode === "Sign Up"
      ? ["username", "email", "password", "phone"]
      : ["email", "password"];
    const newErrors = {};
    const newTouched = {};
    fields.forEach(f => {
      newTouched[f] = true;
      newErrors[f] = validateField(f, formData[f]);
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setFieldErrors(prev => ({ ...prev, ...newErrors }));
    return fields.every(f => !newErrors[f]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (loading) return;

    if (mode === "Login") {
      if (!validateAllFields()) return;
      await handleLogin();
    } else if (mode === "Sign Up") {
      if (!validateAllFields()) return;
      if (!consentChecked) {
        setConsentError("Необходимо принять политику конфиденциальности");
        return;
      }
      setConsentError("");
      await signup();
    } else if (mode === "Forgot Password") {
      await requestPasswordReset();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setMessage("Успешный вход!");
        onLoginSuccess?.();
        onClose?.();
        if (result.user.role === 'admin') {
          setTimeout(() => router.push('/admin-panel'), 1000);
        } else {
          setTimeout(() => router.push('/'), 1000);
        }
      } else {
        if (result.message === 'Неверные учетные данные') {
          setShowWrongPasswordModal(true);
        } else {
          setMessage(result.message || "Ошибка авторизации");
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone.trim()
        }),
        credentials: 'include'
      });
      const responseData = await response.json();
      if (response.ok) {
        setMessage("Регистрация успешна! Проверьте ваш email для подтверждения.");
        setMode("Login");
        setFormData({ username: "", email: "", password: "", phone: "" });
        setTouched({});
        setFieldErrors({});
      } else {
        setMessage(responseData.message || "Ошибка при регистрации.");
      }
    } catch (error) {
      console.error('Signup request error:', error);
      setMessage("Ошибка сети при регистрации.");
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async () => {
    setResetEmailTouched(true);
    const err = validateEmail(emailForReset);
    setResetEmailError(err);
    if (err) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForReset }),
      });
      const responseData = await response.json();
      if (response.ok) {
        setMessage(responseData.message || "Письмо с инструкциями отправлено на ваш email");
        setMode("Login");
        setEmailForReset("");
      } else {
        setMessage(responseData.message || "Ошибка при запросе сброса пароля.");
      }
    } catch (error) {
      console.error("Ошибка при запросе сброса пароля:", error);
      setMessage("Ошибка при запросе сброса пароля.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    if (loading) return;
    if (newPassword !== confirmPassword) {
      setMessage("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });
      const responseData = await response.json();
      if (response.ok) {
        setMessage(responseData.message || "Пароль успешно изменен!");
        setTimeout(() => {
          onLoginSuccess?.();
          onClose?.();
          router.push('/');
        }, 2000);
      } else {
        setMessage(responseData.message || "Ошибка при сбросе пароля.");
      }
    } catch (error) {
      console.error("Ошибка при сбросе пароля:", error);
      setMessage("Ошибка при сбросе пароля.");
    } finally {
      setLoading(false);
    }
  };

  const modeLabel = {
    "Login": "Вход",
    "Sign Up": "Регистрация",
    "Forgot Password": "Восстановление пароля",
    "Set New Password": "Новый пароль",
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{modeLabel[mode] || mode}</h2>
          <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Закрыть">
            &times;
          </button>
        </div>

        {message && (
          <div className={message.includes("успе") ? styles.successMessage : styles.errorMessage}>
            {message}
          </div>
        )}

        {/* ── Set New Password mode ── */}
        {mode === "Set New Password" && (
          <form className={styles.resetPasswordForm} onSubmit={resetPassword}>
            <div className={`${styles.fieldWrapper} ${newPassword && confirmPassword && newPassword !== confirmPassword ? styles.hasError : ''}`}>
              <span className={styles.fieldIcon}><IconLock /></span>
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Новый пароль"
                required
                autoComplete="new-password"
                className={styles.input}
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShowNewPw(v => !v)} aria-label="Показать пароль">
                <IconEye show={showNewPw} />
              </button>
            </div>
            <div className={styles.fieldWrapper}>
              <span className={styles.fieldIcon}><IconLock /></span>
              <input
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                required
                autoComplete="new-password"
                className={`${styles.input} ${newPassword && confirmPassword && newPassword !== confirmPassword ? styles.inputError : ''}`}
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShowConfirmPw(v => !v)} aria-label="Показать пароль">
                <IconEye show={showConfirmPw} />
              </button>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <span className={styles.fieldError}>Пароли не совпадают</span>
              )}
            </div>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Сохранение..." : "Сохранить пароль"}
            </button>
          </form>
        )}

        {/* ── Forgot Password mode ── */}
        {mode === "Forgot Password" && (
          <form className={styles.forgotPasswordForm} onSubmit={handleSubmit}>
            <div className={`${styles.fieldWrapper} ${resetEmailTouched && resetEmailError ? styles.hasError : ''}`}>
              <span className={styles.fieldIcon}><IconEmail /></span>
              <input
                type="email"
                value={emailForReset}
                onChange={(e) => {
                  setEmailForReset(e.target.value);
                  if (resetEmailTouched) setResetEmailError(validateEmail(e.target.value));
                }}
                onBlur={() => {
                  setResetEmailTouched(true);
                  setResetEmailError(validateEmail(emailForReset));
                }}
                placeholder="Ваш email"
                required
                autoComplete="email"
                className={`${styles.input} ${resetEmailTouched && resetEmailError ? styles.inputError : resetEmailTouched && !resetEmailError ? styles.inputValid : ''}`}
              />
              {resetEmailTouched && resetEmailError && (
                <span className={styles.fieldError}>{resetEmailError}</span>
              )}
            </div>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Отправка..." : "Отправить ссылку"}
            </button>
          </form>
        )}

        {/* ── Login / Sign Up mode ── */}
        {(mode === "Login" || mode === "Sign Up") && (
          <form className={styles.loginsignupFields} onSubmit={handleSubmit}>
            {mode === "Sign Up" && (
              <>
                <div className={`${styles.fieldWrapper} ${touched.username && fieldErrors.username ? styles.hasError : ''}`}>
                  <span className={styles.fieldIcon}><IconUser /></span>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={changeHandler}
                    onBlur={blurHandler}
                    type="text"
                    placeholder="Имя"
                    required
                    className={inputClass("username")}
                  />
                  {touched.username && fieldErrors.username && (
                    <span className={styles.fieldError}>{fieldErrors.username}</span>
                  )}
                </div>
                <div className={`${styles.fieldWrapper} ${touched.phone && fieldErrors.phone ? styles.hasError : ''}`}>
                  <span className={styles.fieldIcon}><IconPhone /></span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={changeHandler}
                    onBlur={blurHandler}
                    type="tel"
                    placeholder="Телефон"
                    required
                    className={inputClass("phone")}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <span className={styles.fieldError}>{fieldErrors.phone}</span>
                  )}
                </div>
              </>
            )}

            <div className={`${styles.fieldWrapper} ${touched.email && fieldErrors.email ? styles.hasError : ''}`}>
              <span className={styles.fieldIcon}><IconEmail /></span>
              <input
                name="email"
                value={formData.email}
                onChange={changeHandler}
                onBlur={blurHandler}
                type="email"
                placeholder="Email"
                required
                autoComplete="email"
                className={inputClass("email")}
              />
              {touched.email && fieldErrors.email && (
                <span className={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </div>

            <div className={`${styles.fieldWrapper} ${touched.password && fieldErrors.password ? styles.hasError : ''}`}>
              <span className={styles.fieldIcon}><IconLock /></span>
              <input
                name="password"
                value={formData.password}
                onChange={changeHandler}
                onBlur={blurHandler}
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                required
                autoComplete={mode === "Login" ? "current-password" : "new-password"}
                className={inputClass("password")}
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowPassword(v => !v)}
                aria-label="Показать/скрыть пароль"
              >
                <IconEye show={showPassword} />
              </button>
              {touched.password && fieldErrors.password && (
                <span className={styles.fieldError}>{fieldErrors.password}</span>
              )}
            </div>

            {mode === "Sign Up" && (
              <PasswordStrength password={formData.password} />
            )}

            {mode === "Sign Up" && (
              <div>
                <div className={styles.consentRow}>
                  <input
                    type="checkbox"
                    id="consent"
                    className={styles.consentCheckbox}
                    checked={consentChecked}
                    onChange={(e) => {
                      setConsentChecked(e.target.checked);
                      if (e.target.checked) setConsentError("");
                    }}
                  />
                  <label htmlFor="consent" className={styles.consentLabel}>
                    Я согласен с{' '}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.consentLink}
                    >
                      Политикой конфиденциальности
                    </a>
                  </label>
                </div>
                {consentError && (
                  <span className={styles.fieldError}>{consentError}</span>
                )}
              </div>
            )}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={loading}
              style={{ marginTop: mode === "Sign Up" ? '12px' : '8px' }}
            >
              {loading ? "Загрузка..." : (mode === "Login" ? "Войти" : "Зарегистрироваться")}
            </button>
          </form>
        )}

        {mode === "Login" && (
          <div className={styles.oauthDivider}>
            <span>или</span>
          </div>
        )}

        {mode === "Login" && (
          <div className={styles.oauthButtons}>
            <YandexLoginButton />
          </div>
        )}

        {mode !== "Forgot Password" && mode !== "Set New Password" && (
          <div className={styles.toggleState}>
            {mode === "Sign Up" ? "Уже есть аккаунт? " : "Нет аккаунта? "}
            <span
              onClick={() => {
                setMode(mode === "Login" ? "Sign Up" : "Login");
                setMessage("");
                setFieldErrors({});
                setTouched({});
              }}
            >
              {mode === "Login" ? "Зарегистрироваться" : "Войти"}
            </span>
          </div>
        )}

        {mode === "Login" && (
          <div className={styles.forgotPasswordLink}>
            <span onClick={() => { setMode("Forgot Password"); setMessage(""); }}>
              Забыли пароль?
            </span>
          </div>
        )}

        {showWrongPasswordModal && (
          <div className={styles.wrongPasswordModal}>
            <div className={styles.modalContentInner}>
              <h3>Неверный пароль</h3>
              <p>
                Забыли пароль?{' '}
                <span
                  className={styles.recoverLink}
                  onClick={() => { setShowWrongPasswordModal(false); setMode("Forgot Password"); }}
                >
                  Восстановить
                </span>
              </p>
              <button onClick={() => setShowWrongPasswordModal(false)} className={styles.closeModalButton}>
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LoginSignup = (props) => (
  <Suspense fallback={<div>Загрузка</div>}>
    <LoginSignupContent {...props} />
  </Suspense>
);

export default LoginSignup;
