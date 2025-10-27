// app/admin-panel/imagelist/page.js
'use client';
import { useState, useEffect } from 'react';
import './ImageGallery.css';

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      } else {
        throw new Error(data.error || 'Failed to fetch images');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setImages([]);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setUploadStatus('Uploading...');

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadStatus('Upload successful!');
        fetchImages(); // Обновляем список
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus(`Upload failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить это изображение?')) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setImages(images.filter(img => img.id !== id));
        setSelectedImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleMassDelete = async () => {
    if (selectedImages.size === 0) {
      alert('Выберите изображения для удаления.');
      return;
    }
    if (!confirm(`Вы уверены, что хотите удалить ${selectedImages.size} изображений?`)) return;

    try {
      const response = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedImages) }),
      });

      const result = await response.json();
      if (result.success) {
        setImages(images.filter(img => !selectedImages.has(img.id)));
        setSelectedImages(new Set());
      } else {
        throw new Error(result.error || 'Mass delete failed');
      }
    } catch (err) {
      console.error('Mass delete error:', err);
      alert(`Mass delete failed: ${err.message}`);
    }
  };

  const handleUpdateDescription = async (id) => {
    if (!newDescription.trim()) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription }),
      });

      const result = await response.json();
      if (result.success) {
        setImages(images.map(img => img.id === id ? { ...img, description: newDescription } : img));
        setNewDescription('');
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(`Update failed: ${err.message}`);
    }
  };

  const toggleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.id)));
    }
  };

  if (loading) return <div className="admin-gallery-loading">Загрузка...</div>;
  if (error) return <div className="admin-gallery-error">Ошибка: {error}</div>;

  return (
    <div className="admin-gallery-container">
      <h1>Админка Галереи</h1>

      {/* Форма загрузки */}
      <section className="upload-section">
        <h2>Загрузить Изображения</h2>
        <form onSubmit={handleFileUpload} encType="multipart/form-data">
          <input type="file" name="images" multiple accept="image/*" required />
          <textarea name="description" placeholder="Описание для всех изображений (опционально)" />
          <button type="submit">Загрузить</button>
        </form>
        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </section>

      {/* Управление изображениями */}
      <section className="manage-section">
        <div className="manage-header">
          <h2>Управление Изображениями</h2>
          <div>
            <button onClick={toggleSelectAll}>
              {selectedImages.size === images.length ? 'Снять выделение' : 'Выделить все'}
            </button>
            <button onClick={handleMassDelete} disabled={selectedImages.size === 0}>Удалить выбранные</button>
          </div>
        </div>

        <div className="admin-gallery-grid">
          {images.map((image) => (
            <div key={image.id} className={`admin-gallery-item ${selectedImages.has(image.id) ? 'selected' : ''}`}>
              <div className="admin-image-wrapper">
                <img src={image.filePath} alt={image.description} />
                <input
                  type="checkbox"
                  checked={selectedImages.has(image.id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedImages);
                    if (e.target.checked) {
                      newSet.add(image.id);
                    } else {
                      newSet.delete(image.id);
                    }
                    setSelectedImages(newSet);
                  }}
                />
              </div>
              <div className="admin-image-info">
                <p><strong>Описание:</strong> {image.description}</p>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Новое описание..."
                />
                <button onClick={() => handleUpdateDescription(image.id)}>Обновить</button>
                <button onClick={() => handleDelete(image.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}