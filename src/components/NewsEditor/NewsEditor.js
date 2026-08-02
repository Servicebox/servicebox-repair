// src/components/NewsEditor/NewsEditor.js
'use client';

import { useState, useEffect } from 'react';
import styles from './NewsEditor.module.css';

export default function NewsEditor({ onSave, saving, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    contentBlocks: [],
    isPublished: false,
    metaTitle: '',
    metaDescription: '',
    featuredImage: '',
    allowVideos: true
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        contentBlocks: initialData.contentBlocks || [],
        isPublished: initialData.isPublished || false,
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
        featuredImage: initialData.featuredImage || '',
        allowVideos: initialData.allowVideos !== false
      });
    }
  }, [initialData]);

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАГРУЗКИ
  const handleFileUpload = async (file, type, blockIndex = null) => {
    if (!file) {
      alert('Файл не выбран');
      return;
    }

    // Валидация размера
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Размер файла не должен превышать ${type === 'video' ? '50MB' : '5MB'}`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      // ✅ ИСПРАВЛЕНО: API ожидает 'files' (множественное число)
      uploadFormData.append('files', file);
      uploadFormData.append('category', 'news');

      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) { clearInterval(progressInterval); return 90; }
          return prev + 10;
        });
      }, 200);

      // ✅ ИСПРАВЛЕНО: относительный путь без API_URL
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: uploadFormData
      });

      clearInterval(progressInterval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setUploadProgress(100);

      if (data.success && data.files?.length > 0) {
        const uploadedFile = data.files[0];

        if (blockIndex !== null) {
          updateBlock(blockIndex, {
            media: uploadedFile.url,
            mediaType: file.type
          });
        } else {
          setFormData(prev => ({ ...prev, featuredImage: uploadedFile.url }));
        }
      } else if (data.success && data.image_urls?.length > 0) {
        // Обратная совместимость со старым форматом ответа
        if (blockIndex !== null) {
          updateBlock(blockIndex, {
            media: data.image_urls[0],
            mediaType: file.type
          });
        } else {
          setFormData(prev => ({ ...prev, featuredImage: data.image_urls[0] }));
        }
      } else {
        throw new Error(data.error || 'Ошибка загрузки файла');
      }

      setTimeout(() => setUploadProgress(0), 800);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Ошибка загрузки: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };
  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
  };

  const addYouTubeBlock = () => {
    if (!youtubeUrl.trim()) {
      alert('Введите ссылку на YouTube видео');
      return;
    }
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      alert('Неверная ссылка YouTube');
      return;
    }
    setFormData(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, {
        type: 'youtube',
        media: videoId,
        videoUrl: youtubeUrl,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        description: '',
        position: prev.contentBlocks.length
      }]
    }));
    setYoutubeUrl('');
  };

  const addTextBlock = () => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, { type: 'text', content: '', position: prev.contentBlocks.length }]
    }));
  };

  const addMediaBlock = (type) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, {
        type,
        media: '',
        description: '',
        mediaType: type === 'video' ? 'video/mp4' : '',
        position: prev.contentBlocks.length
      }]
    }));
  };

  const updateBlock = (index, updates) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map((block, i) =>
        i === index ? { ...block, ...updates } : block
      )
    }));
  };

  const removeBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== index)
    }));
  };

  const moveBlock = (index, direction) => {
    const newBlocks = [...formData.contentBlocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newBlocks.length) {
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
      newBlocks.forEach((block, idx) => { block.position = idx; });
      setFormData(prev => ({ ...prev, contentBlocks: newBlocks }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { alert('Введите заголовок'); return; }
    if (formData.contentBlocks.length === 0) { alert('Добавьте контент'); return; }
    onSave(formData);
  };

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e, blockIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      handleFileUpload(file, type, blockIndex);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editor}>
      {/* Заголовок */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Заголовок новости *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Введите заголовок..."
          required
          className={styles.titleInput}
        />
      </div>

      {/* Главное изображение с Drag & Drop */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Главное изображение</label>
        <div
          className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, null)}
        >
          {!formData.featuredImage ? (
            <div className={styles.dropZoneContent}>
              <span className={styles.dropIcon}>📷</span>
              <p>Перетащите изображение сюда или нажмите для выбора</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                disabled={uploading}
                className={styles.fileInput}
              />
            </div>
          ) : (
            <div className={styles.imagePreview}>
              <img src={formData.featuredImage} alt="Preview" className={styles.previewImage} />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                className={styles.removeImageButton}
                disabled={uploading}
              >×</button>
            </div>
          )}
        </div>
        {uploading && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
            <span>{uploadProgress}%</span>
          </div>
        )}
      </div>

      {/* Блоки контента */}
      <div className={styles.blocksSection}>
        <div className={styles.blocksHeader}>
          <h3>Блоки контента</h3>
          <div className={styles.blockButtons}>
            <button type="button" onClick={addTextBlock} className={styles.addButton}>+ Текст</button>
            <button type="button" onClick={() => addMediaBlock('image')} className={styles.addButton}>+ Фото</button>
            <button type="button" onClick={() => addMediaBlock('video')} className={styles.addButton}>+ Видео</button>
          </div>
        </div>

        {/* YouTube */}
        <div className={styles.youtubeSection}>
          <div className={styles.youtubeInput}>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Вставьте ссылку YouTube..."
              className={styles.youtubeUrlInput}
            />
            <button type="button" onClick={addYouTubeBlock} disabled={!youtubeUrl.trim()} className={styles.youtubeAddButton}>
              + YouTube
            </button>
          </div>
        </div>

        {formData.contentBlocks.length === 0 ? (
          <div className={styles.emptyBlocks}><p>Добавьте блоки контента</p></div>
        ) : (
          formData.contentBlocks.map((block, index) => (
            <div key={index} className={styles.block}>
              <div className={styles.blockHeader}>
                <span className={styles.blockType}>
                  {block.type === 'text' && '📝 Текст'}
                  {block.type === 'image' && '🖼️ Фото'}
                  {block.type === 'video' && '🎬 Видео'}
                  {block.type === 'youtube' && '📺 YouTube'}
                </span>
                <div className={styles.blockActions}>
                  <button type="button" onClick={() => moveBlock(index, 'up')} className={styles.moveButton}>↑</button>
                  <button type="button" onClick={() => moveBlock(index, 'down')} className={styles.moveButton}>↓</button>
                  <button type="button" onClick={() => removeBlock(index)} className={styles.removeButton}>×</button>
                </div>
              </div>
              <div className={styles.blockContent}>
                {block.type === 'text' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                    placeholder="Текст..."
                    rows={6}
                    className={styles.textArea}
                    required
                  />
                )}
                {block.type === 'image' && (
                  <div className={styles.mediaBlock}>
                    {!block.media ? (
                      <div
                        className={styles.dropZoneSmall}
                        onDragEnter={handleDrag} onDragLeave={handleDrag}
                        onDragOver={handleDrag} onDrop={(e) => handleDrop(e, index)}
                      >
                        <input type="file" accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image', index)}
                          disabled={uploading} className={styles.fileInput} />
                        <span>📷 Перетащите или выберите фото</span>
                      </div>
                    ) : (
                      <div className={styles.mediaPreview}>
                        <img src={block.media} alt="" className={styles.mediaImage} />
                        <button type="button" onClick={() => updateBlock(index, { media: '' })} className={styles.removeImageButton}>×</button>
                      </div>
                    )}
                    <input type="text" value={block.description || ''}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                      placeholder="Подпись к фото..." className={styles.captionInput} />
                  </div>
                )}
                {block.type === 'video' && (
                  <div className={styles.mediaBlock}>
                    {!block.media ? (
                      <div
                        className={styles.dropZoneSmall}
                        onDragEnter={handleDrag} onDragLeave={handleDrag}
                        onDragOver={handleDrag} onDrop={(e) => handleDrop(e, index)}
                      >
                        <input type="file" accept="video/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video', index)}
                          disabled={uploading} className={styles.fileInput} />
                        <span>🎬 Перетащите или выберите видео (до 100MB)</span>
                      </div>
                    ) : (
                      <div className={styles.mediaPreview}>
                        <video controls className={styles.mediaVideo}>
                          <source src={block.media} type={block.mediaType} />
                        </video>
                        <button type="button" onClick={() => updateBlock(index, { media: '' })} className={styles.removeImageButton}>×</button>
                      </div>
                    )}
                    <input type="text" value={block.description || ''}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                      placeholder="Описание видео..." className={styles.captionInput} />
                  </div>
                )}
                {block.type === 'youtube' && (
                  <div className={styles.youtubeBlock}>
                    {block.thumbnail && (
                      <div className={styles.youtubePreview}>
                        <img src={block.thumbnail} alt="" className={styles.youtubeThumbnail} />
                        <div className={styles.youtubeInfo}>
                          <p><strong>ID:</strong> {block.media}</p>
                        </div>
                      </div>
                    )}
                    <input type="text" value={block.description || ''}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                      placeholder="Описание YouTube..." className={styles.captionInput} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* SEO */}
      <div className={styles.metaSection}>
        <h3>SEO настройки</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Meta Title ({formData.metaTitle.length}/70)</label>
          <input type="text" value={formData.metaTitle} maxLength={70}
            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
            className={styles.metaInput} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Meta Description ({formData.metaDescription.length}/160)</label>
          <textarea value={formData.metaDescription} maxLength={160}
            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
            rows={3} className={styles.metaTextarea} />
        </div>
      </div>

      {/* Публикация */}
      <div className={styles.publishSection}>
        <label className={styles.publishLabel}>
          <input type="checkbox" checked={formData.isPublished}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
            className={styles.publishCheckbox} />
          Опубликовать сразу
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={saving || uploading} className={styles.saveButton}>
          {saving ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Создать новость')}
        </button>
      </div>
    </form>
  );
}