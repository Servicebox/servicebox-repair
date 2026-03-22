// components/DescriptionBox/DescriptionBox.js
'use client';

import { useState } from 'react';
import styles from './DescriptionBox.module.css';

const DescriptionBox = () => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className={styles.descriptionBox}>
      <div className={styles.descriptionBoxNavigator}>
        <div 
          className={`${styles.descriptionBoxNavBox} ${activeTab === 'description' ? '' : styles.fade}`}
          onClick={() => setActiveTab('description')}
        >
          Описание
        </div>
        <div 
          className={`${styles.descriptionBoxNavBox} ${activeTab === 'reviews' ? '' : styles.fade}`}
          onClick={() => setActiveTab('reviews')}
        >
          Отзывы (122)
        </div>
      </div>
      <div className={styles.descriptionBoxContent}>
        {activeTab === 'description' && (
          <>
            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quo porro, ea culpa perspiciatis nihil tempora. Praesentium, aspernatur, hic veritatis atque sit odio omnis eius labore quo placeat dolores tenetur sunt est delectus ex molestiae dignissimos ipsum repudiandae, dolor assumenda reprehenderit at? In sit beatae cum aperiam veritatis assumenda accusantium quibusdam modi laudantium aut repudiandae quia commodi enim pariatur, voluptas est nesciunt consequatur illum quidem officia architecto sint non accusamus laborum. Et quam libero error reiciendis est minus, perferendis velit aliquam aut inventore ea optio, quas doloribus, modi pariatur dignissimos. Similique voluptates facilis nihil repudiandae nemo blanditiis officia illum enim ex?</p>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Exercitationem officia numquam quos voluptatum mollitia. Itaque animi soluta quo similique nostrum cum vitae voluptatum neque numquam voluptatem. Dolore assumenda architecto minus provident adipisci veniam, fugit ut ipsam explicabo itaque officia. Veritatis facilis modi nemo aliquid impedit dolore obcaecati culpa exercitationem corporis.</p>
          </>
        )}
        {activeTab === 'reviews' && (
          <div className={styles.reviewsContent}>
            <p>Здесь будут отображаться отзывы покупателей...</p>
            {/* Можно добавить компонент отзывов позже */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionBox;