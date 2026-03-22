// components/contexts/BreadcrumbContext.js
'use client';

import { createContext, useState, useMemo, useCallback } from 'react';

export const BreadcrumbContext = createContext({
  breadcrumbs: [],
  currentPageTitle: null,
  setBreadcrumbs: () => {},
  setCurrentPageTitle: () => {},
});

export function BreadcrumbProvider({ children }) {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [currentPageTitle, setCurrentPageTitle] = useState(null);

  // Мемоизируем контекстное значение
  const contextValue = useMemo(() => ({
    breadcrumbs,
    currentPageTitle,
    setBreadcrumbs,
    setCurrentPageTitle,
  }), [breadcrumbs, currentPageTitle]);

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  );
}