// components/About/About.js
'use client';

import { useRef, forwardRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from './About.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVk, faTelegram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

// Импортируем изображения
import Clock from "../../../public/images/clock.svg";
import Card from "../../../public/images/Card.svg";
import Secure from "../../../public/images/secure.svg";
import Photo0 from "../../../public/images/mestomastera1.webp";
import Photo1 from "../../../public/images/ya.webp";
import Photo2 from "../../../public/images/magistr.webp";
import Photo3 from "../../../public/images/stend.webp";
import Photo4 from "../../../public/images/resepshen.webp";
import Photo5 from "../../../public/images/5060carta.webp";
import Photo6 from "../../../public/images/mestomastera.webp";
import Photo7 from "../../../public/images/PSXvideocard.webp";

const About = forwardRef((_props, ref) => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const photoAlts = [
    "Ремонт ноутбуков, компьютеров, техники Apple в Вологде - ServiceBox",
    "Ремонт iPhone, iPad, MacBook в Вологде - ServiceBox",
    "Качественный ремонт ноутбуков в Вологде - ServiceBox",
    "Ремонт игровых приставок Sony, Xbox в Вологде - ServiceBox",
    "Ремонт телефонов, планшетов в Вологде - ServiceBox",
    "Профессиональный ремонт техники в Вологде - ServiceBox",
    "Срочный ремонт электроники в Вологде - ServiceBox",
    "Ремонт видеокарт, материнских плат в Вологде - ServiceBox"
  ];
  const photos = [Photo0, Photo1, Photo2, Photo3, Photo4, Photo5, Photo6, Photo7];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhoto((prevPhoto) => (prevPhoto === photos.length - 1 ? 0 : prevPhoto + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  return (
    <section id="aboutRef" className={styles.container} ref={ref}>
      <div className={styles.content}>
        <h1 className={styles.title}>О компании ServiceBox</h1>
        <h2 className={styles.heading}>
          Быстрый и профессиональный ремонт в Вологде!
        </h2>
        <h3 className={styles.heading}>
          ServiceBox открывает двери новой мастерской, расширяя спектр услуг! Теперь мы предлагаем быстрый и профессиональный ремонт видеокарт, ноутбуков, материнских плат, ПК, игровых консолей Sony, X-box, техники Apple, телефонов, планшетов, телевизоров.
        </h3>

        <p className={styles.subheading}>
          Сервисный центр "ServiceBox" выполняет разный спектр услуг по ремонту и обслуживанию видеокарт и ноутбуков. Как самые простые работы по замене bga (это замена видеочипов, хабов-чипсетов, видеопамяти, процессоров), так и сложные: устранение прогаров, плавающих дефектов, залития, ремонт ударников (ноутбуков и видеокарт после механического воздействия или удара).
          Наша главная цель - обеспечить удобство для наших клиентов.
        </p>
        
        <p className={styles.subheading}>
          Мы также понимаем важность разумного подхода к ценообразованию.
          В "ServiceBox" мы выбираем взвешенную ценовую политику,
          чтобы цены на ремонт телефонов, планшетов и ноутбуков
          были адекватны стоимости самих гаджетов.
          Вы можете быть уверены, что не будет никаких скрытых комиссий или
          неожиданных повышений стоимости работ после установления причины поломки.
        </p>

        <h3 className={styles.heading}>Почему стоит выбрать нашу мастерскую по ремонту цифровой техники?</h3>
        <p className={styles.subheading}>
          В "ServiceBox" мы гордимся тем, что беремся даже за самые безнадежные случаи.
          Наша команда квалифицированных мастеров имеет более 10-летний опыт в ремонте мобильных телефонов,
          планшетов и ноутбуков.
          Вы можете связаться с нами через наш сайт и получить консультацию
          в режиме онлайн.
          Доверьте свои гаджеты "ServiceBox" - Ваша техника будет в надежных руках.
        </p>
        
        <h3 className={styles.heading}>
          <span className={styles.quote}>
            Если у вас есть замечания или пожелания по работе сервиса, или идеи, которыми вы хотите поделиться, можете написать в
            <a href="tg://resolve?domain=@Tomkka" className={styles.quoteLink}>
              <FontAwesomeIcon icon={faTelegram} />
              <span> - Telegram</span>
            </a>.
            Мы всегда обращаем внимание на комментарии наших клиентов и подписчиков и стараемся улучшать работу сервиса.
          </span>
        </h3>
        
        <div>
          <div className={styles.galleryContainer}>
            <div className={styles.gallery}>
              <Image
                src={photos[currentPhoto]}
                className={styles.image}
                alt={photoAlts[currentPhoto] || "Фотографии нашего сервисного центра в Вологде"}
                width={500}
                height={300}
                priority
              />
              <div className={styles.dots}>
                {photos.map((_, index) => (
                  <span
                    key={index}
                    className={`${styles.dot} ${currentPhoto === index ? styles.dotActive : ""}`}
                    onClick={() => setCurrentPhoto(index)}
                    aria-label={`Посмотреть фото ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <Image src={Clock} className={styles.featureIcon} alt="Быстрый ремонт техники в Вологде" width={50} height={50} />
            <h3 className={styles.featureTitle}>Ремонт от 30 минут</h3>
            <p className={styles.featureText}>Срочный ремонт без очередей - большинство работ выполняем при вас</p>
          </div>

          <div className={styles.featureCard}>
            <Image src={Secure} className={styles.featureIcon} alt="Гарантия на ремонт" width={50} height={50} />
            <h3 className={styles.featureTitle}>Гарантия до 12 месяцев</h3>
            <p className={styles.featureText}>Даём официальную гарантию на все виды работ и запчасти</p>
          </div>

          <div className={styles.featureCard}>
            <Image src={Card} className={styles.featureIcon} alt="Удобная оплата ремонта" width={50} height={50} />
            <h3 className={styles.featureTitle}>Любые формы оплаты</h3>
            <p className={styles.featureText}>Наличные, карты, безнал для юрлиц - вам решать как платить</p>
          </div>
        </div>
      </div>
      
      <div className={styles.backButton}>
        <ul className={styles.backList}>
          <li className={styles.backItem}><Link href="/" className={styles.backLink}>На главную</Link></li>
        </ul>
      </div>
    </section>
  );
});

export default About;