// components/depository/FileItem.jsx
'use client';

import { useState } from 'react';
import styles from './FileItem.module.css';

export default function FileItem({ file, onDelete, onDownload }) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(file.description);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎬';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📕';
    if (mimetype.includes('word')) return '📄';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('zip') || mimetype.includes('compressed')) return '📦';
    return '📄';
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/depository/files/${file._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description
        })
      });

      if (response.ok) {
        setIsEditing(false);
        alert('Изменения сохранены');
      } else {
        alert('Ошибка при сохранении изменений');
      }
    } catch (error) {
      console.error('Error updating file:', error);
      alert('Ошибка при сохранении изменений');
    }
  };

  const handleCancel = () => {
    setDescription(file.description);
    setIsEditing(false);
  };

  return (
    <div className={styles.fileCard}>
      <div className={styles.fileHeader}>
        <div className={styles.fileIcon}>
          {getFileIcon(file.mimetype)}
        </div>
        <div className={styles.fileInfo}>
          <h3 className={styles.fileName}>{file.originalName}</h3>
          <div className={styles.fileMeta}>
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{file.mimetype}</span>
          </div>
        </div>
      </div>

      <div className={styles.fileDetails}>
        <div className={styles.detailRow}>
          <strong>Категория:</strong>
          <span>{file.category?.name}</span>
        </div>

        <div className={styles.detailRow}>
          <strong>Загрузил:</strong>
          <span>{file.uploader}</span>
        </div>

        <div className={styles.detailRow}>
          <strong>Скачиваний:</strong>
          <span>{file.downloadCount}</span>
        </div>

        <div className={styles.detailRow}>
          <strong>Дата загрузки:</strong>
          <span>{new Date(file.createdAt).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      {isEditing ? (
        <div className={styles.editingSection}>
          <div className={styles.formGroup}>
            <label>Описание:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>
          
          <div className={styles.editActions}>
            <button onClick={handleSave} className={styles.saveButton}>
              Сохранить
            </button>
            <button onClick={handleCancel} className={styles.cancelButton}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.contentSection}>
          {file.description && (
            <div className={styles.description}>
              <strong>Описание:</strong>
              <p>{file.description}</p>
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={() => onDownload(file._id)}
          className={styles.downloadButton}
        >
          Скачать
        </button>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={styles.editButton}
        >
          {isEditing ? 'Отменить' : 'Редактировать'}
        </button>
        
        <button
          onClick={() => onDelete(file._id)}
          className={styles.deleteButton}
        >
          Удалить
        </button>
      </div>
    </div>
  );
}