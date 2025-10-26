'use client';

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Card.module.css";

// Import images
import Tv from "../../../public/images/tv.webp";
import Glass from "../../../public/images/glass.webp";
import Applefon from "../../../public/images/apple.webp";
import Android from "../../../public/images/android.webp";
import Tablet from "../../../public/images/tablet.webp";
import Notebook from "../../../public/images/notebook.webp";
import Monoblok from "../../../public/images/monoblok.webp";
import Devices from "../../../public/images/Devices.webp";
import Videocard from "../../../public/images/videocard.webp";

const Card = ({ title, subtitle, image, linkTo }) => {
  const serviceRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const getImageByTitle = (title) => {
    const imageMap = {
      Notebook: Notebook,
      Monoblok: Monoblok,
      Applefon: Applefon,
      Android: Android,
      Tablet: Tablet,
      Tv: Tv,
      Glass: Glass,
      Devices: Devices,
      Videocard: Videocard,
    };
    return imageMap[title] || imageMap[image] || "";
  };

  // Handle click outside to flip back
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceRef.current && !serviceRef.current.contains(event.target)) {
        setIsFlipped(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
    if (e.key === "Escape" && isFlipped) {
      e.preventDefault();
      setIsFlipped(false);
    }
  };

  const cardImage = getImageByTitle(image);

  return (
    <article
      ref={serviceRef}
      className={`${styles.cardOne} ${isFlipped ? styles.flipped : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <div className={styles.cards}>
        <div className={styles.coverItem}>
          <h3 className={styles.cardTitleOne}>{title}</h3>
          {cardImage && (
            <Image 
              className={styles.cardCover}
              src={cardImage}
              alt={title}
              width={180}
              height={120}
              loading="lazy"
            />
          )}
        </div>

        <div className={styles.cardBack}>
          <p className={styles.cardSubtitleOne}>{subtitle}</p>
          <Link className={styles.linkCard} href={linkTo}>
            <span>Посмотреть прайс</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Card;