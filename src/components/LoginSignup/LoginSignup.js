// components/LoginSignup/LoginSignup.js
'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginSignup.module.css';

function LoginSignupContent({ isOpen, onClose, onLoginSuccess }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Изменено с token на token
  const router = useRouter();
  const { login } = useAuth();
  
  const [mode, setMode] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: ""
  });
  const [emailForReset, setEmailForReset] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    setEmailForReset("");
    setNewPassword("");
    setConfirmPassword("");
    setShowWrongPasswordModal(false);
    setMode("Login");
    setMessage("");
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (loading) return;

    if (mode === "Login") {
      await handleLogin();
    } else if (mode === "Sign Up") {
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
        
        // Перенаправление по роли
        if (result.user.role === 'admin') {
          setTimeout(() => {
            router.push('/admin-panel');
          }, 1000);
        } else {
          setTimeout(() => {
            router.push('/');
          }, 1000);
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
    if (!formData.username.trim()) {
      setMessage("Имя обязательно");
      return;
    }
    
    if (!formData.phone.trim()) {
      setMessage("Телефон обязателен");
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    if (!emailForReset) {
      setMessage("Введите ваш email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          password: newPassword 
        }),
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

  const closeWrongPasswordModal = () => {
    setShowWrongPasswordModal(false);
  };

  const handleRecoverPassword = () => {
    setShowWrongPasswordModal(false);
    setMode("Forgot Password");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{mode}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </div>

        {message && (
          <div className={
            message.includes("успе") ? styles.successMessage : styles.errorMessage
          }>
            {message}
          </div>
        )}

        {mode === "Set New Password" ? (
          <form className={styles.resetPassword} onSubmit={resetPassword}>
            <h3>Установка нового пароля</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Введите новый пароль"
              required
              autoComplete="new-password"
              className={styles.input}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите новый пароль"
              required
              autoComplete="new-password"
              className={styles.input}
            />
            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Загрузка..." : "Установить новый пароль"}
            </button>
          </form>
        ) : mode === "Forgot Password" ? (
          <form className={styles.forgotPassword} onSubmit={handleSubmit}>
            <h3>Восстановление пароля</h3>
            <input
              type="email"
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
              placeholder="Введите ваш email"
              required
              autoComplete="email"
              className={styles.input}
            />
            <button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Загрузка..." : "Отправить"}
            </button>
          </form>
        ) : (
          <form className={styles.loginsignupFields} onSubmit={handleSubmit}>
            {mode === "Sign Up" && (
              <>
                <input
                  name="username"
                  value={formData.username}
                  onChange={changeHandler}
                  type="text"
                  placeholder="Имя"
                  required
                  className={styles.input}
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={changeHandler}
                  type="tel"
                  placeholder="Телефон"
                  required
                  className={styles.input}
                />
              </>
            )}
            
            <input
              name="email"
              value={formData.email}
              onChange={changeHandler}
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              className={styles.input}
            />
            <input
              name="password"
              value={formData.password}
              onChange={changeHandler}
              type="password"
              placeholder="Пароль"
              required
              autoComplete={mode === "Login" ? "current-password" : "new-password"}
              className={styles.input}
            />
            <button 
              className={styles.submitButton} 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Загрузка..." : (mode === "Login" ? "Войти" : "Зарегистрироваться")}
            </button>
          </form>
        )}

        {mode !== "Forgot Password" && mode !== "Set New Password" && (
          <div className={styles.toggleState}>
            {mode === "Sign Up" ? "Уже есть аккаунт? " : "У вас нет аккаунта? "}
            <span onClick={() => { 
              setMode(mode === "Login" ? "Sign Up" : "Login");
              setMessage("");
            }}>
              {mode === "Login" ? "Зарегистрироваться" : "Войти"}
            </span>
          </div>
        )}

        {mode === "Login" && (
          <div className={styles.forgotPasswordLink}>
            <span onClick={() => {
              setMode("Forgot Password");
              setMessage("");
            }}>
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
                  onClick={handleRecoverPassword}
                >
                  Восстановить
                </span>
              </p>
              <button 
                onClick={closeWrongPasswordModal}
                className={styles.closeModalButton}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LoginSignup = (props) => {
  return (
    <Suspense fallback={<div>Загрузка формы...</div>}>
      <LoginSignupContent {...props} />
    </Suspense>
  );
};

export default LoginSignup;