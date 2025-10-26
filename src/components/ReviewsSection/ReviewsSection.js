// components/ReviewsSection/ReviewsSection.js
import React from "react";
import styles from "./ReviewsSection.module.css"; // Импорт стилей как объекта

const ReviewsSection = () => {
  const reviews = [
    {
      id: 1,
      author: "Даня Г.",
      date: "10 августа 2025",
      dateTime: "2025-08-10",
      rating: 5,
      text: "Сдал компьютер в сервис. Пришёл в 17:00, думал придётся ехать дважды, но мастер задержался и выполнил чистку за один визит. Температура CPU упала на 20°C! Работают до 19:00 — очень удобно."
    },
    {
      id: 2,
      author: "Артур П.",
      date: "20 ноября 2025", 
      dateTime: "2025-11-20",
      rating: 5,
      text: "Обращался несколько раз по ремонту iPhone. Всё делают быстро, без навязывания лишних услуг. Андрею отдельное спасибо — всегда идёт навстречу!"
    },
    {
      id: 3,
      author: "Егор",
      date: "18 мая 2025",
      dateTime: "2025-05-18", 
      rating: 5,
      text: "Починили смартфон в тот же день! Объяснили всё по шагам, дали рекомендации. Доброжелательное общение и профессиональный подход. Рекомендую!"
    }
  ];

  return (
    <section className={styles.reviewsSection} aria-labelledby="reviews-heading">
      <div className={styles.container}>
        <h2 id="reviews-heading" className={styles.reviewsTitle}>
          Отзывы клиентов из Вологды
        </h2>
        <p className={styles.reviewsSubtitle}>
          Сервисный центр «ServiceBox» — 150+ положительных отзывов на Яндекс.Картах
        </p>
        
        <div className={styles.reviewsGrid}>
          {reviews.map((review) => (
            <article key={review.id} className={styles.reviewCard} itemScope itemType="https://schema.org/Review">
              <div className={styles.reviewHeader}>
                <span className={styles.reviewAuthor} itemProp="author" itemScope itemType="https://schema.org/Person">
                  <span itemProp="name">{review.author}</span>
                </span>
                <time className={styles.reviewDate} dateTime={review.dateTime} itemProp="datePublished">
                  {review.date}
                </time>
              </div>
              <div className={styles.reviewRating} itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content={review.rating} />
                <meta itemProp="bestRating" content="5" />
                <span aria-label={`Рейтинг: ${review.rating} из 5 звёзд`}>
                  {'★'.repeat(review.rating)}
                </span>
              </div>
              <p className={styles.reviewText} itemProp="reviewBody">
                {review.text}
              </p>
            </article>
          ))}
        </div>

        <div className={styles.reviewsCta}>
          <a 
            href="https://yandex.ru/maps/org/servisboks/58578899506/reviews/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reviewsLink}
            aria-label="Читать все 150+ отзывов на Яндекс.Картах"
          >
            Читать все отзывы на Яндекс.Картах →
          </a>
          <div className={styles.reviewsRatingSummary} itemScope itemType="https://schema.org/AggregateRating">
            <meta itemProp="ratingValue" content="5.0" />
            <meta itemProp="reviewCount" content="150" />
            <meta itemProp="bestRating" content="5" />
            <p>
              Рейтинг: <strong>5.0</strong> на основе <strong>150+ отзывов</strong> в Вологде
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;