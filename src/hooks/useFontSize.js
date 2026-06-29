'use client';

import { useState, useEffect } from 'react';

const LEVELS = ['normal', 'lg', 'xl'];

export function useFontSize() {
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    const stored = localStorage.getItem('fontSize') || 'normal';
    setFontSize(stored);
    if (stored !== 'normal') {
      document.documentElement.setAttribute('data-font-size', stored);
    }
  }, []);

  const cycleFontSize = () => {
    const currentIndex = LEVELS.indexOf(fontSize);
    const next = LEVELS[(currentIndex + 1) % LEVELS.length];
    setFontSize(next);
    if (next === 'normal') {
      document.documentElement.removeAttribute('data-font-size');
    } else {
      document.documentElement.setAttribute('data-font-size', next);
    }
    localStorage.setItem('fontSize', next);
  };

  return { fontSize, cycleFontSize };
}
