// components/depository/DepositoryList.jsx
'use client';

import { useState, useEffect } from 'react';
import FileItem from './FileItem';
import CategorySelect from './CategorySelect';
import styles from './DepositoryList.module.css';

export default function DepositoryList({ categories, onFileDeleted }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [selectedCategory, searchTerm]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/depository/files?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      const response = await fetch(`/api/depository/files/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(files.filter(file => file._id !== fileId));
        onFileDeleted?.();
      } else {
        alert('Ошибка при удалении файла');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Ошибка при удалении файла');
    }
  };

  const handleDownloadFile = async (fileId) => {
    try {
      window.open(`/api/depository/files/${fileId}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Ошибка при скачивании файла');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка файлов...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Поиск по названию, описанию или тегам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.categoryFilter}>
          <CategorySelect
            categories={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            includeAllOption={true}
          />
        </div>
        
        <button 
          onClick={fetchFiles}
          className={styles.refreshButton}
        >
          Обновить
        </button>
      </div>

      <div className={styles.stats}>
        Найдено файлов: {files.length}
      </div>

      {files.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Файлы не найдены</h3>
          <p>Попробуйте изменить параметры поиска или загрузить новые файлы</p>
        </div>
      ) : (
        <div className={styles.fileGrid}>
          {files.map(file => (
            <FileItem
              key={file._id}
              file={file}
              onDelete={handleDeleteFile}
              onDownload={handleDownloadFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}