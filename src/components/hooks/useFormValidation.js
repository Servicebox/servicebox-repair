// hooks/useFormConsent.js
import { useState, useEffect } from 'react';

export function useCookieConsent() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent) {
      setConsent(JSON.parse(storedConsent));
    }
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

  return { consent, hasConsent };
}