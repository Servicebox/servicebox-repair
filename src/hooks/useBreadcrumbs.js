// hooks/useBreadcrumbs
'use client';

import { useContext, useEffect, useMemo, useCallback } from 'react';
import { BreadcrumbContext } from '@/components/contexts/BreadcrumbContext';

export function useBreadcrumbs(crumbs, pageTitle = null) {
  const { setBreadcrumbs, setCurrentPageTitle } = useContext(BreadcrumbContext);

  // Мемоизируем значения для избежания ненужных ререндеров
  const memoizedCrumbs = useMemo(() => crumbs, [JSON.stringify(crumbs)]);
  const memoizedPageTitle = useMemo(() => pageTitle, [pageTitle]);

  // Создаем стабильные функции для установки
  const updateBreadcrumbs = useCallback((newCrumbs) => {
    setBreadcrumbs(newCrumbs);
  }, [setBreadcrumbs]);

  const updatePageTitle = useCallback((title) => {
    setCurrentPageTitle(title);
  }, [setCurrentPageTitle]);

  useEffect(() => {
    if (memoizedCrumbs && memoizedCrumbs.length > 0) {
      updateBreadcrumbs(memoizedCrumbs);
    }
    
    if (memoizedPageTitle) {
      updatePageTitle(memoizedPageTitle);
    }

    return () => {
      updateBreadcrumbs([]);
      updatePageTitle(null);
    };
  }, [memoizedCrumbs, memoizedPageTitle, updateBreadcrumbs, updatePageTitle]);
}