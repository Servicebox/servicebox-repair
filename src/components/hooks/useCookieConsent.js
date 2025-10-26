// hooks/useCookieConsent.js
import { useState, useEffect } from 'react';

export function useCookieConsent() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const checkConsent = () => {
      if (typeof window === 'undefined') return;
      
      const savedConsent = localStorage.getItem('cookieConsent');
      if (savedConsent) {
        try {
          setConsent(JSON.parse(savedConsent));
        } catch (error) {
          console.error('Error parsing cookie consent:', error);
          setConsent({
            necessary: true,
            analytics: false,
            marketing: false,
            rejected: true
          });
        }
      } else {
        setConsent(null);
      }
    };

    checkConsent();

    // Слушаем изменения в localStorage
    const handleStorageChange = () => checkConsent();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cookieConsentChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cookieConsentChanged', handleStorageChange);
    };
  }, []);

  const hasConsent = (type) => {
    if (!consent) return false;
    
    switch (type) {
      case 'analytics':
        return consent.analytics === true;
      case 'marketing':
        return consent.marketing === true;
      case 'necessary':
        return consent.necessary === true;
      default:
        return consent.analytics === true || consent.marketing === true;
    }
  };

  const getConsentStatus = () => {
    if (!consent) return 'not_set';
    if (consent.rejected) return 'rejected';
    if (consent.analytics || consent.marketing) return 'accepted';
    return 'necessary_only';
  };

  return { 
    consent, 
    hasConsent, 
    getConsentStatus,
    isConsentGiven: consent !== null 
  };
}