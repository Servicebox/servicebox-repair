'use client';

import { useState, useEffect } from 'react';

export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('highContrast') === 'true';
    setIsHighContrast(stored);
    if (stored) {
      document.documentElement.setAttribute('data-contrast', 'high');
    }
  }, []);

  const toggleHighContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    localStorage.setItem('highContrast', String(next));
  };

  return { isHighContrast, toggleHighContrast };
}
