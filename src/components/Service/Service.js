// Service.jsx
'use client';

import { forwardRef } from "react";
import Link from "next/link";
import Card from "../Card/Card";
import styles from "./Service.module.css";

const cardsData = [
  {
    title: "Ноутбуками",
    subtitle: "Ремонт ноутбуков любой сложности. Занимаемся заменой мультиконтроллеров, USB портов, кулеров, северных мостов и разъемов зарядки, замена матрицы.",
    image: "Notebook",
    linkTo: "/notebook-service",
  },
  {
    title: "компьютерами и моноблоками",
    subtitle: "Ремонт компьютеров любой сложности, настройка и сборка.",
    image: "Monoblok",
    linkTo: "/monoblock-service",
  },
  {
    title: "Apple техникой",
    subtitle: "Качественный ремонт Apple техники любой сложности, заменна аккумулятора без ошибок, дисплейного модуля, так же меняем стекла.",
    image: "Applefon",
    linkTo: "/appl-service",
  },
  {
    title: "телефонами всех марок",
    subtitle: "Надежный ремонт телефонов любой модели. Быстро и качественно. От замены дисплейного модуля до компонетного ремонта системнной платы",
    image: "Android",
    linkTo: "/telephone-service",
  },
  {
    title: "Планшетами",
    subtitle: "Быстрый и надежный ремонт планшетов любых марок и моделей.",
    image: "Tablet",
    linkTo: "/tablet-service",
  },
  {
    title: "Телевизорами и мониторами",
    subtitle: "Профессиональный ремонт телевизоров: замена подсветки, уменьшение тока подсветки, ремонт системной платы, и многое другое",
    image: "Tv",
    linkTo: "/tv-service",
  },
  {
    title: "Замена стекла",
    subtitle: "Замена стекла от 1 часа, на любом телефоне и планшете, часах. Если у вас есть изображение и нет фантмных нажатии- то можно просто поменять стекло",
    image: "Glass",
    linkTo: "/glass-replacement-price-lists",
  },
  {
    title: "Видеокартами",
    subtitle: " Ремонт и обслуживание видеокарт",
    image: "Videocard",
    linkTo: "/videocard"
  },
  {
    title: "Другими устройствами",
    subtitle: " Ремонт различных устройств, включая Bluetooth-колонки, роботы-пылесосы, электронные книги, игровые приставки и видеорегистраторы.",
    image: "Devices",
    linkTo: "/other-service"
  },
];

const Service = forwardRef((_props, ref) => {
  return (
    <section id="service" className={styles.service} ref={ref}>
      <div className={styles.serviceContent}>
        <h2 className={styles.animatedTitle}>Мы работаем с устройствами:</h2>
        <div className={styles.tech}>
          {cardsData.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              image={card.image}
              linkTo={card.linkTo}
              subtitle={card.subtitle}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

Service.displayName = "Service";

export default Service;