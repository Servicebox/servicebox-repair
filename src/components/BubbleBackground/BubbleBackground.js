'use client';
import { useEffect, useRef, useState } from "react";
import styles from "./BubbleBackground.module.css";

// Пузыри, которые появляются по клику/тапу и уплывают/растворяются.
// Лимит и авто-удаление по таймеру не дают им копиться и лагать.
const MAX_SPAWNED_BUBBLES = 10;
const SPAWN_LIFETIME_MS = 4000;

function BubbleLayers() {
  return (
    <>
      <div className={styles.bubbleRainbow}></div>
      <div className={styles.bubbleWhite}></div>
      <div className={`${styles.bubbleBrightCircle} ${styles.bubbleBrightCircleFirst}`}></div>
      <div className={`${styles.bubbleBrightCircle} ${styles.bubbleBrightCircleSecond}`}></div>
      <div className={`${styles.bubbleBrightness} ${styles.bubbleBrightnessFirst}`}></div>
      <div className={`${styles.bubbleBrightness} ${styles.bubbleBrightnessSecond}`}></div>
    </>
  );
}

function BubbleBackground() {
  const bubbleRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const spawnIdRef = useRef(0);
  const [isClient, setIsClient] = useState(false);
  const [spawnedBubbles, setSpawnedBubbles] = useState([]);

  useEffect(() => {
    setIsClient(true);

    // Initialize position only on client side
    positionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    // Smooth animation with requestAnimationFrame
    const animateBubble = () => {
      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
      }
      animationRef.current = requestAnimationFrame(animateBubble);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animateBubble);

    const handleMove = (clientX, clientY) => {
      // Update target position
      positionRef.current = { x: clientX - 100, y: clientY - 100 }; // center the bubble
    };

    const mouseMove = (e) => handleMove(e.clientX, e.clientY);
    const touchMove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('touchmove', touchMove, { passive: false });

    // Клик/тап — плодит дополнительный пузырь в точке касания, который
    // сам всплывает и растворяется (см. .spawnedBubble + bubbleFloatAway).
    const spawnBubble = (clientX, clientY) => {
      const id = spawnIdRef.current++;
      const size = 6 + Math.random() * 6; // rem
      setSpawnedBubbles((prev) =>
        prev.length >= MAX_SPAWNED_BUBBLES
          ? prev
          : [...prev, { id, x: clientX, y: clientY, size }]
      );
      setTimeout(() => {
        setSpawnedBubbles((prev) => prev.filter((b) => b.id !== id));
      }, SPAWN_LIFETIME_MS);
    };

    const pointerDown = (e) => spawnBubble(e.clientX, e.clientY);
    window.addEventListener('pointerdown', pointerDown);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('pointerdown', pointerDown);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.bubbleBackground}>
      {/* Позиция (курсор, JS каждый кадр) — на обёртке; покачивание формы
          (CSS transform, дёшево для компоновщика) — на внутреннем слое.
          Раздельно, чтобы не сталкивать inline-transform с CSS-анимацией. */}
      <div ref={bubbleRef} className={styles.bubbleWrap} aria-hidden="true">
        <div className={styles.bubbleShape}>
          <BubbleLayers />
        </div>
      </div>

      {spawnedBubbles.map((b) => (
        <div
          key={b.id}
          className={styles.spawnedBubble}
          style={{ left: b.x, top: b.y, width: `${b.size}rem`, height: `${b.size}rem` }}
          aria-hidden="true"
        >
          <BubbleLayers />
        </div>
      ))}
    </div>
  );
}

export default BubbleBackground;
