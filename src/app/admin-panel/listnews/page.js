///app/admin-panel/listnews/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../News.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/news`);
      const data = await response.json();
      
      if (data.success) {
        setNews(data.data);
      } else {
        showAlert(data.error, 'error');
      }
    } catch (error) {
      showAlert('Ошибка при загрузке новостей', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить эту новость?')) return;

    try {
      const response = await fetch(`${API_URL}/api/news/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        setNews(news.filter(item => item._id !== id));
        showAlert('Новость успешно удалена', 'success');
      } else {
        showAlert(data.error, 'error');
      }
    } catch (error) {
      showAlert('Ошибка при удалении новости', 'error');
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        })
      });
      const data = await response.json();

      if (data.success) {
        setNews(news.map(item => 
          item._id === id ? data.data : item
        ));
        showAlert(
          currentStatus ? 'Новость снята с публикации' : 'Новость опубликована',
          'success'
        );
      } else {
        showAlert(data.error, 'error');
      }
    } catch (error) {
      showAlert('Ошибка при обновлении новости', 'error');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка новостей...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление новостями</h1>
        <Link href="/admin-panel/addnews" className={styles.createButton}>
          + Создать новость
        </Link>
      </div>

      {alert && (
        <div className={`${styles.alert} ${styles[alert.type]}`}>
          {alert.message}
        </div>
      )}

      <div className={styles.newsList}>
        {news.length > 0 ? (
          news.map(item => (
            <div key={item._id} className={styles.newsItem}>
              <div className={styles.newsContent}>
                <h3>{item.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className={`${styles.status} ${item.isPublished ? styles.published : styles.draft}`}>
                    {item.isPublished ? 'Опубликовано' : 'Черновик'}
                  </span>
                </div>
                {item.excerpt && (
                  <p className={styles.excerpt}>{item.excerpt}</p>
                )}
                {item.featuredImage && (
                  <div className={styles.imagePreview}>
                    <img src={item.featuredImage} alt={item.title} />
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  onClick={() => togglePublish(item._id, item.isPublished)}
                  className={`${styles.button} ${item.isPublished ? styles.unpublish : styles.publish}`}
                >
                  {item.isPublished ? 'Снять' : 'Опубликовать'}
                </button>
                
                <Link
                  href={`/admin-panel/editnews/${item._id}`}
                  className={`${styles.button} ${styles.edit}`}
                >
                  Редактировать
                </Link>
                
                <button
                  onClick={() => handleDelete(item._id)}
                  className={`${styles.button} ${styles.delete}`}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <p>Новостей пока нет</p>
            <Link href="/admin-panel/addnews" className={styles.createButton}>
              Создать первую новость
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}