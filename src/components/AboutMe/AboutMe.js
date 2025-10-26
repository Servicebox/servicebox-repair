// components/AboutMe/AboutMe.js
'use client';

import { useState, useEffect, useRef } from "react";
import styles from "./AboutMe.module.css"; // Импорт стилей как объекта

function AboutMe() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [transition, setTransition] = useState(true);
  const sectionRef = useRef(null);

  const quotes = [
    "В нашей компании работают лучшие специалисты, которые прекрасно разбираются в современных технологиях и имеют более 10 лет опыта работы.",
    "Каждый ремонт — это вызов, который мы принимаем с энтузиазмом и профессионализмом.",
    "Мы используем только оригинальные запчасти и современное диагностическое оборудование.",
    "Ваше устройство в надежных руках — мы относимся к каждой технике, как к своей собственной."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTransition(false);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setTransition(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <section 
      className={styles.aboutMe} // Использование объекта стилей
      id="about-company"
      ref={sectionRef}
      itemScope 
      itemType="https://schema.org/AboutPage"
      aria-labelledby="about-heading"
    >
      <meta itemProp="name" content="О компании ServiceBox" />
      <meta itemProp="description" content="Профессиональный ремонт техники в Вологде с гарантией качества. Опытные специалисты, оригинальные запчасти, современное оборудование." />
      
      <div className={styles.aboutMeContent}>
        <div className={styles.quoteContainer} itemScope itemType="https://schema.org/Quotation">
          <h2 id="about-heading" className={styles.aboutMeTitle}>
            <span 
              className={`${styles.aboutMeQuote} ${transition ? styles.fadeIn : styles.fadeOut}`} // Использование объекта для условных классов
              itemProp="text"
            >
              {quotes[currentQuote]}
            </span>
          </h2>
          <div className={styles.quoteDecoration} aria-hidden="true"></div>
          <div className={styles.seoContent} aria-hidden="true" style={{display: 'none'}}>
            <h3>профессиональный ремонт техники</h3>
            <p>Наша компания ServiceBox уже более 10 лет предоставляет качественные услуги по ремонту электронной техники в городе Вологда. Мы специализируемся на ремонте smartphones, ноутбуков, планшетов и другой цифровой техники.</p>
            <p>Наши мастера имеют сертификаты и регулярно проходят обучение новым технологиям ремонта. Мы используем только оригинальные запчасти и современное диагностическое оборудование.</p>
            <p>Наш сервисный центр находится по адресу: г. Вологда, ул. Северная 7А, 405. Также мы работаем по второму адресу: г. Вологда, ул. Ленина 6.</p>
            <p>График работы: Понедельник-Пятница с 10:00 до 19:00. Контактные телефоны: +7 911 501 88 28, +7 911 501 06 96.</p>
          </div>
        </div>
        <div className={styles.quoteNavigation}>
          {quotes.map((_, index) => (
            <button
              key={index}
              className={`${styles.quoteDot} ${currentQuote === index ? styles.active : ''}`}
              onClick={() => {
                setTransition(false);
                setTimeout(() => {
                  setCurrentQuote(index);
                  setTransition(true);
                }, 500);
              }}
              aria-label={`Показать цитату ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutMe;