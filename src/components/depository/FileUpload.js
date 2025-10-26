// components/depository/FileUpload.jsx
'use client';

import { useState, useRef } from 'react';
import CategorySelect from './CategorySelect';
import styles from './FileUpload.module.css';

export default function FileUpload({ categories, onFileUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState("");
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Пожалуйста, выберите файл');
      return;
    }

    if (!uploadCategory) {
      alert('Пожалуйста, выберите категорию');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadCategory);
    
    if (description.trim()) {
      formData.append('description', description.trim());
    }

    try {
      const response = await fetch('/api/depository/files', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Файл успешно загружен!');
        setSelectedFile(null);
        setUploadCategory("");
        setDescription('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onFileUploaded?.();
      } else {
        alert(result.message || 'Ошибка при загрузке файла');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка сети при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h2>Загрузка нового файла</h2>
      <form onSubmit={handleSubmit} className={styles.uploadForm}>
        <div className={styles.formGroup}>
          <label>Категория *</label>
          <CategorySelect 
            categories={categories}
            value={uploadCategory}
            onChange={setUploadCategory}
            placeholder="Выберите категорию"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Описание (необязательно)</label>
          <textarea
            placeholder="Введите описание файла..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Файл *</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            required
            className={styles.fileInput}
          />
        </div>

        {selectedFile && (
          <div className={styles.filePreview}>
            <p>
              <strong>Выбранный файл:</strong> {selectedFile.name} 
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!selectedFile || !uploadCategory || isUploading}
          className={`${styles.uploadButton} ${isUploading ? styles.uploading : ''}`}
        >
          {isUploading ? 'Загрузка...' : 'Загрузить файл'}
        </button>
      </form>
    </div>
  );
}