// app/yml-check/page.jsx
'use client';

import { useState, useEffect } from 'react';
import styles from './YmlCheck.module.css';

export default function YmlCheckPage() {
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    checkYmlFeed();
  }, []);

  const checkYmlFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Получаем фид
      const feedResponse = await fetch('/api/yml');
      if (!feedResponse.ok) {
        throw new Error(`Ошибка загрузки фида: ${feedResponse.status}`);
      }
      
      const feedText = await feedResponse.text();
      
      // 2. Парсим XML (простая проверка)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(feedText, "text/xml");
      
      // Проверяем на ошибки парсинга
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        throw new Error('Ошибка парсинга XML');
      }
      
      // 3. Извлекаем данные
      const shopName = xmlDoc.querySelector('shop > name')?.textContent || 'Не указан';
      const company = xmlDoc.querySelector('shop > company')?.textContent || 'Не указана';
      const offers = xmlDoc.querySelectorAll('offer').length;
      const categories = xmlDoc.querySelectorAll('category').length;
      
      // 4. Проверяем обязательные поля у товаров
      const offerElements = xmlDoc.querySelectorAll('offer');
      const validationErrors = [];
      
      offerElements.forEach((offer, index) => {
        const id = offer.getAttribute('id');
        const url = offer.querySelector('url')?.textContent;
        const price = offer.querySelector('price')?.textContent;
        const name = offer.querySelector('name')?.textContent;
        const picture = offer.querySelector('picture')?.textContent;
        
        if (!id) validationErrors.push(`Товар #${index}: нет ID`);
        if (!url) validationErrors.push(`Товар ${id || '#'+index}: нет URL`);
        if (!price || isNaN(parseFloat(price))) validationErrors.push(`Товар ${id || '#'+index}: некорректная цена`);
        if (!name || name.trim().length === 0) validationErrors.push(`Товар ${id || '#'+index}: нет названия`);
        if (!picture) validationErrors.push(`Товар ${id || '#'+index}: нет изображения`);
      });
      
      setFeedData({
        xml: feedText,
        summary: {
          shopName,
          company,
          offers,
          categories,
          lastUpdate: new Date().toLocaleString('ru-RU')
        },
        validation: {
          errors: validationErrors,
          isValid: validationErrors.length === 0
        }
      });
      
      // 5. Проверяем фид с помощью Яндекс.Вебмастера (опционально)
      if (validationErrors.length === 0) {
        // Можно отправить фид на проверку
        console.log('Фид готов для Яндекс.Маркета');
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Ошибка проверки фида:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateWithYandex = () => {
    window.open('https://webmaster.yandex.ru/tools/yml/', '_blank');
  };

  const downloadFeed = () => {
    if (!feedData) return;
    
    const blob = new Blob([feedData.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yandex-market-feed.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Проверяем YML фид...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Проверка YML фида для Яндекс.Маркета</h1>
      
      {error && (
        <div className={styles.error}>
          <h3>Ошибка: {error}</h3>
          <button onClick={checkYmlFeed}>Попробовать снова</button>
        </div>
      )}
      
      {feedData && (
        <>
          <div className={styles.summary}>
            <h2>Сводка по фиду</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Магазин:</span>
                <span className={styles.value}>{feedData.summary.shopName}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Компания:</span>
                <span className={styles.value}>{feedData.summary.company}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Товаров:</span>
                <span className={styles.value}>{feedData.summary.offers}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Категорий:</span>
                <span className={styles.value}>{feedData.summary.categories}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>Проверка:</span>
                <span className={`${styles.value} ${feedData.validation.isValid ? styles.valid : styles.invalid}`}>
                  {feedData.validation.isValid ? '✅ Валиден' : `❌ Ошибок: ${feedData.validation.errors.length}`}
                </span>
              </div>
            </div>
          </div>
          
          {feedData.validation.errors.length > 0 && (
            <div className={styles.errors}>
              <h3>Ошибки валидации:</h3>
              <ul>
                {feedData.validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className={styles.actions}>
            <button onClick={downloadFeed} className={styles.downloadBtn}>
              ⬇️ Скачать фид
            </button>
            <button onClick={validateWithYandex} className={styles.validateBtn}>
              🔍 Проверить в Яндекс.Вебмастере
            </button>
            <button onClick={checkYmlFeed} className={styles.refreshBtn}>
              🔄 Обновить данные
            </button>
          </div>
          
          <div className={styles.preview}>
            <h3>Предпросмотр XML (первые 1000 символов):</h3>
            <pre className={styles.xmlPreview}>
              {feedData.xml.substring(0, 1000)}...
            </pre>
            <p className={styles.hint}>
              Полный фид доступен по адресу: <code>/api/yml</code>
            </p>
          </div>
        </>
      )}
      
      <div className={styles.instructions}>
        <h3>Инструкция по настройке:</h3>
        <ol>
          <li>Скачайте фид с помощью кнопки выше</li>
          <li>Загрузите фид в Яндекс.Вебмастер</li>
          <li>Убедитесь, что все товары прошли валидацию</li>
          <li>Настройте прайс-лист в Яндекс.Маркете</li>
        </ol>
      </div>
    </div>
  );
}