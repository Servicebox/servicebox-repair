'use client';

import { useEffect, useRef, useState } from "react";
import styles from "./BubbleBackground.module.css";

function BubbleBackground() {
  const bubbleRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

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

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', touchMove);
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
      <div 
        ref={bubbleRef} 
        className={styles.bubble}
        aria-hidden="true"
      >
        <div className={styles.bubbleRainbow}></div>
        <div className={styles.bubbleWhite}></div>
        <div className={`${styles.bubbleBrightCircle} ${styles.bubbleBrightCircleFirst}`}></div>
        <div className={`${styles.bubbleBrightCircle} ${styles.bubbleBrightCircleSecond}`}></div>
        <div className={`${styles.bubbleBrightness} ${styles.bubbleBrightnessFirst}`}></div>
        <div className={`${styles.bubbleBrightness} ${styles.bubbleBrightnessSecond}`}></div>
      </div>
    </div>
  );
}

export default BubbleBackground;