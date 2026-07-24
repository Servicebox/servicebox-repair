'use client';
import { useEffect, useRef, useState } from 'react';

// Плавное появление блока при попадании во вьюпорт — чистый CSS + IntersectionObserver, без сторонних анимационных библиотек.
export default function ScrollReveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const visibilityClass = isVisible ? 'scrollReveal--visible' : '';

  return (
    <Tag ref={ref} className={`scrollReveal ${visibilityClass} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
