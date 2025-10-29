// src/components/NewsEditor/NewsEditor.js
'use client';

import { useState, useEffect } from 'react';
import styles from './NewsEditor.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

  const handleTitleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const addTextBlock = () => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        { type: 'text', content: '', position: prev.contentBlocks.length }
      ]
    }));
  };

  const addMediaBlock = (type) => {
    setFormData(prev => ({
      ...prev,
      contentBlocks: [
        ...prev.contentBlocks,
        { 
          type, 
          media: '', 
          description: '',
          mediaType: type === 'video' ? 'video/mp4' : '',
          position: prev.contentBlocks.length 
        }
      ]
    }));
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };

  const addYouTubeBlock = () => {
    if (!youtubeUrl.trim()) {
      alert('Введите ссылку на YouTube видео');
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      alert('Неверная ссылка YouTube. Используйте формат: https://www.youtube.com/watch?v=VIDEO_ID');
      return;
    }

    const newBlock = {
      type: 'youtube',
      media: videoId,
      videoUrl: youtubeUrl,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      description: '',
      position: formData.contentBlocks.length
    };

    setFormData(prev => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, newBlock]
    }));

    setYoutubeUrl('');
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
      newBlocks.forEach((block, idx) => {
        block.position = idx;
      });
      setFormData(prev => ({ ...prev, contentBlocks: newBlocks }));
    }
  };

  const handleFileUpload = async (file, type, blockIndex = null) => {
    if (!file) {
      alert('Файл не выбран');
      return;
    }

    if (type === 'video' && file.size > 50 * 1024 * 1024) {
      alert('Размер видео файла не должен превышать 50MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('category', 'news');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_URL}/api/uploads/`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setUploadProgress(100);
        
        if (blockIndex !== null) {
          updateBlock(blockIndex, { 
            media: data.image_urls[0],
            mediaType: file.type 
          });
        } else {
          setFormData(prev => ({ ...prev, featuredImage: data.image_urls[0] }));
        }
        
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        throw new Error(data.error || 'Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Ошибка загрузки файла: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (blockIndex = null) => {
    if (blockIndex !== null) {
      updateBlock(blockIndex, { media: '', videoUrl: '', thumbnail: '' });
    } else {
      setFormData(prev => ({ ...prev, featuredImage: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Введите заголовок новости');
      return;
    }

    if (formData.contentBlocks.length === 0) {
      alert('Добавьте хотя бы один блок контента');
      return;
    }

    const emptyTextBlocks = formData.contentBlocks.filter(block => 
      block.type === 'text' && !block.content.trim()
    );
    
    if (emptyTextBlocks.length > 0) {
      alert('Заполните все текстовые блоки');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editor}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Заголовок новости *</label>
        <input
          type="text"
          value={formData.title}
          onChange={handleTitleChange}
          placeholder="Введите заголовок..."
          required
          className={styles.titleInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Главное изображение</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file, 'image');
          }}
          disabled={uploading}
          className={styles.fileInput}
        />
        {uploading && uploadProgress > 0 && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${uploadProgress}%` }}
            />
            <span className={styles.progressText}>{uploadProgress}%</span>
          </div>
        )}
        {formData.featuredImage && (
          <div className={styles.imagePreview}>
            <img src={formData.featuredImage} alt="Предпросмотр" className={styles.previewImage} />
            <button 
              type="button"
              onClick={() => removeImage()}
              className={styles.removeImageButton}
              disabled={uploading}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className={styles.blocksSection}>
        <div className={styles.blocksHeader}>
          <h3>Блоки контента</h3>
          <div className={styles.blockButtons}>
            <button type="button" onClick={addTextBlock} className={styles.addButton}>+ Текст</button>
            <button type="button" onClick={() => addMediaBlock('image')} className={styles.addButton}>+ Изображение</button>
            <button type="button" onClick={() => addMediaBlock('video')} className={styles.addButton}>+ Видео файл</button>
          </div>
        </div>

        <div className={styles.youtubeSection}>
          <h4>Добавить YouTube видео</h4>
          <div className={styles.youtubeInput}>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Вставьте ссылку на YouTube видео..."
              className={styles.youtubeUrlInput}
            />
            <button
              type="button"
              onClick={addYouTubeBlock}
              className={styles.youtubeAddButton}
              disabled={!youtubeUrl.trim()}
            >
              Добавить YouTube
            </button>
          </div>
        </div>

        {formData.contentBlocks.length === 0 ? (
          <div className={styles.emptyBlocks}>
            <p>Добавьте блоки контента для вашей новости</p>
          </div>
        ) : (
          formData.contentBlocks.map((block, index) => (
            <div key={index} className={styles.block}>
              <div className={styles.blockHeader}>
                <span className={styles.blockType}>
                  {block.type === 'text' && '📝 Текст'}
                  {block.type === 'image' && '🖼️ Изображение'}
                  {block.type === 'video' && '🎬 Видео файл'}
                  {block.type === 'youtube' && '📺 YouTube видео'}
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
                    placeholder="Введите текст..."
                    rows={6}
                    className={styles.textArea}
                    required
                  />
                )}

                {block.type === 'image' && (
                  <div className={styles.mediaBlock}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(file, 'image', index);
                      }}
                      disabled={uploading}
                      className={styles.fileInput}
                    />
                    {block.media && (
                      <div className={styles.mediaPreview}>
                        <img src={block.media} alt="Preview" className={styles.mediaImage} />
                        <button type="button" onClick={() => removeImage(index)} className={styles.removeImageButton}>×</button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={block.description || ''}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                      placeholder="Подпись к изображению..."
                      className={styles.captionInput}
                    />
                  </div>
                )}

                {block.type === 'video' && (
                  <div className={styles.mediaBlock}>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(file, 'video', index);
                      }}
                      disabled={uploading}
                      className={styles.fileInput}
                    />
                    {block.media && (
                      <div className={styles.mediaPreview}>
                        <video controls className={styles.mediaVideo}>
                          <source src={block.media} type={block.mediaType} />
                          Ваш браузер не поддерживает видео тег.
                        </video>
                        <button type="button" onClick={() => removeImage(index)} className={styles.removeImageButton}>×</button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={block.description || ''}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                      placeholder="Описание видео..."
                      className={styles.captionInput}
                    />
                  </div>
                )}

                {block.type === 'youtube' && (
                  <div className={styles.youtubeBlock}>
                    {block.media && (
                      <div className={styles.youtubePreview}>
                        <img src={block.thumbnail} alt="YouTube preview" className={styles.youtubeThumbnail} />
                        <div className={styles.youtubeInfo}>
                          <p><strong>YouTube ID:</strong> {block.media}</p>
                          <p><strong>Ссылка:</strong> {block.videoUrl}</p>
                        </div>
                      </div>
                    )}
                    <input
                      type="text"
                      value={block.description || ''}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                      placeholder="Описание YouTube видео..."
                      className={styles.captionInput}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.metaSection}>
        <h3>SEO настройки</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Meta Title</label>
          <input
            type="text"
            value={formData.metaTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
            placeholder="Заголовок для SEO..."
            className={styles.metaInput}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Meta Description</label>
          <textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
            placeholder="Описание для SEO..."
            rows={3}
            className={styles.metaTextarea}
          />
        </div>
      </div>

      <div className={styles.publishSection}>
        <label className={styles.publishLabel}>
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
            className={styles.publishCheckbox}
          />
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