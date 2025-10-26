'use client';
import { useState } from 'react';

export default function FileUploadForm({ onUpload }) {
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        fileType: 'other'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fileInput = e.target.file;
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Выберите файл');
            return;
        }

        setUploading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('file', file);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('fileType', formData.fileType);

            const response = await fetch('/api/depository/files', {
                method: 'POST',
                body: formDataToSend
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Файл успешно загружен');
                setFormData({ description: '', fileType: 'other' });
                fileInput.value = '';
                if (onUpload) onUpload();
            } else {
                alert('Ошибка: ' + result.error);
            }
        } catch (error) {
            alert('Ошибка загрузки файла');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="upload-form">
            <h3>Загрузить новый файл</h3>
            <div>
                <label>Файл:</label>
                <input type="file" name="file" required />
            </div>
            <div>
                <label>Тип файла:</label>
                <select 
                    value={formData.fileType} 
                    onChange={e => setFormData({...formData, fileType: e.target.value})}
                >
                    <option value="firmware">Прошивка</option>
                    <option value="dashboard">Дашборд</option>
                    <option value="document">Документ</option>
                    <option value="other">Другой</option>
                </select>
            </div>
            <div>
                <label>Описание:</label>
                <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Описание файла..."
                    rows="3"
                />
            </div>
            <button type="submit" disabled={uploading}>
                {uploading ? 'Загрузка...' : 'Загрузить файл'}
            </button>
        </form>
    );
}