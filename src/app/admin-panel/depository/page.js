// app/admin-panel/depository/page.jsx
'use client';

import { useState, useEffect } from 'react';
import DepositoryList from '@/components/depository/DepositoryList';
import CategoryManager from '@/components/depository/CategoryManager';
import FileUpload from '@/components/depository/FileUpload';
import styles from './DepositoryPage.module.css';

export default function DepositoryPage() {
  const [activeTab, setActiveTab] = useState('files');
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/depository/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFileUploaded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCategoryUpdated = () => {
    fetchCategories();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Депозитарий файлов</h1>
        <p className={styles.subtitle}>Управление файлами и категориями</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'files' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Файлы
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'upload' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Загрузить файл
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Категории
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'files' && (
          <DepositoryList 
            key={refreshKey}
            categories={categories}
            onFileDeleted={handleCategoryUpdated}
          />
        )}
        
        {activeTab === 'upload' && (
          <FileUpload 
            categories={categories}
            onFileUploaded={handleFileUploaded}
          />
        )}
        
        {activeTab === 'categories' && (
          <CategoryManager 
            categories={categories}
            onCategoriesUpdated={handleCategoryUpdated}
          />
        )}
      </div>
    </div>
  );
}