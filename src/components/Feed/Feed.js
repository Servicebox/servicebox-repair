// components/Feed/Feed.js
'use client';

import styles from "./Feed.module.css";

function Feed() {
    return (
        <section className={styles.feed}>
            <div className={styles.feedIframeContainer}>
                <h2 className={styles.feedTitle}>Отзывы счастливых клиентов</h2>
                <div className={styles.feedIframeMap}>
                    <iframe 
                        className={styles.feedMap} 
                        src="https://yandex.ru/maps-reviews-widget/58578899506?comments"
                        title="Отзывы клиентов ServiceBox на Яндекс Картах"
                        loading="lazy"
                    ></iframe>
                    <a 
                        href="https://yandex.ru/maps/org/servisboks/58578899506/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.feedLink}
                    >
                        ServiceBox на Яндекс Картах
                    </a>
                </div>
            </div>
        </section>
    );
}

export default Feed;