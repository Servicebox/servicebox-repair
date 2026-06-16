'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './AboutMe.module.css';

// ✅ 1. Статические данные вынесены за пределы компонента. 
// Это предотвращает пересоздание массива при каждом рендере и экономит память.
const QUOTES = [
  "В нашей компании работают лучшие специалисты, которые прекрасно разбираются в современных технологиях и имеют более 10 лет опыта работы.",
  "Каждый ремонт — это вызов, который мы принимаем с энтузиазмом и профессионализмом.",
  "Мы используем только оригинальные запчасти и современное диагностическое оборудование.",
  "Ваше устройство в надежных руках — мы относимся к каждой технике, как к своей собственной."
];

export default function AboutMe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ 2. useRef для хранения ID таймера. Позволяет корректно очищать setTimeout при быстром клике.
  const transitionTimerRef = useRef(null);

  // Автоматическое переключение цитат
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

      transitionTimerRef.current = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % QUOTES.length);
        setIsTransitioning(false);
      }, 500); // 500ms совпадает с длительностью CSS-анимации
    }, 8000);

    // ✅ 3. Полная очистка интервалов и таймеров при размонтировании компонента
    return () => {
      clearInterval(interval);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Ручное переключение при клике на точку
  const handleDotClick = useCallback((index) => {
    if (index === currentIndex || isTransitioning) return;

    setIsTransitioning(true);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

    transitionTimerRef.current = setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, isTransitioning]);

  return (
    <section
      className={styles.aboutMe}
      id="about-company"
      aria-label="Преимущества сервисного центра"
    >
      <div className={styles.aboutMeContent}>
        <div className={styles.quoteContainer}>
          <h2 id="about-heading" className={styles.aboutMeTitle}>
            {/* ✅ 4. aria-live="polite" сообщает скринридерам об изменении текста без прерывания пользователя */}
            <span
              className={`${styles.aboutMeQuote} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
              aria-live="polite"
            >
              {QUOTES[currentIndex]}
            </span>
          </h2>
          <div className={styles.quoteDecoration} aria-hidden="true" />
        </div>

        {/* ✅ 5. Правильная ARIA-разметка для навигации карусели */}
        <div className={styles.quoteNavigation} role="tablist" aria-label="Навигация по цитатам">
          {QUOTES.map((_, index) => (
            <button
              key={index}
              className={`${styles.quoteDot} ${currentIndex === index ? styles.active : ''}`}
              onClick={() => handleDotClick(index)}
              role="tab"
              aria-selected={currentIndex === index}
              aria-label={`Перейти к цитате ${index + 1}`}
              aria-controls="about-heading"
              // ✅ 6. Только активная точка доступна через Tab-навигацию
              tabIndex={currentIndex === index ? 0 : -1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}