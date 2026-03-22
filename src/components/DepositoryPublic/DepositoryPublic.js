// app/depository-public/page.jsx
'use client';
import { useEffect, useState } from 'react';
import styles from './DepositoryPublic.module.css';

export default function DepositoryPublic() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState(null);
    const [search, setSearch] = useState("");
    const [width, setWidth] = useState(0);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        // Устанавливаем ширину только на клиенте
        setWidth(window.innerWidth);
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    useEffect(() => {
        fetchFiles();
        fetchCategories();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory && selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }
            
            const response = await fetch(`/api/depository/files?${params}`);
            if (response.ok) {
                const data = await response.json();
                setFiles(data);
            } else {
                console.error('Failed to fetch files');
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const filterFiles = files.filter(f => {
        const searchStr = [
            f.originalName,
            f.description,
            f.mimetype,
            f.category?.name
        ].filter(Boolean).join(" ").toLowerCase();
        return searchStr.includes(search.toLowerCase());
    });

    const handleDownload = (id, filename) => {
        // Просто открываем ссылку для скачивания в новом окне
        window.open(`/api/depository/files/${id}/download`, '_blank');
    };

    const getFileIcon = (mimetype) => {
        if (mimetype.startsWith('image/')) return '🖼️';
        if (mimetype.startsWith('video/')) return '🎬';
        if (mimetype.startsWith('audio/')) return '🎵';
        if (mimetype.includes('pdf')) return '📕';
        if (mimetype.includes('word')) return '📄';
        if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
        if (mimetype.includes('zip') || mimetype.includes('compressed')) return '📦';
        if (mimetype.includes('firmware') || mimetype.includes('bin')) return '⚙️';
        return '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (width === 0) {
        return <div className={styles.loading}>Загрузка...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Депозитарий файлов</h1>
                <p className={styles.subtitle}>
                    Прошивки, документация и файлы для сервисного центра
                </p>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Поиск по названию файла, описанию..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                
                <div className={styles.categoryFilter}>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={styles.categorySelect}
                    >
                        <option value="">Все категории</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <button 
                    onClick={fetchFiles}
                    className={styles.refreshButton}
                >
                    Обновить
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingMessage}>
                    <div className={styles.loadingSpinner}></div>
                    Загрузка файлов...
                </div>
            ) : (
                <>
                    <div className={styles.stats}>
                        Найдено файлов: {filterFiles.length}
                    </div>

                    {filterFiles.length === 0 ? (
                        <div className={styles.emptyState}>
                            <h3>Файлы не найдены</h3>
                            <p>Попробуйте изменить параметры поиска</p>
                        </div>
                    ) : width >= 900 ? (
                        // Desktop Table View
                        <div className={styles.tableContainer}>
                            <table className={styles.fileTable}>
                                <thead>
                                    <tr>
                                        <th>Тип</th>
                                        <th>Название файла</th>
                                        <th>Категория</th>
                                        <th>Описание</th>
                                        <th>Размер</th>
                                        <th>Дата</th>
                                        <th>Скачать</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterFiles.map(file => (
                                        <tr key={file._id}>
                                            <td className={styles.typeCell}>
                                                <span className={styles.fileIcon}>
                                                    {getFileIcon(file.mimetype)}
                                                </span>
                                            </td>
                                            <td className={styles.nameCell}>
                                                <span className={styles.fileName}>{file.originalName}</span>
                                            </td>
                                            <td className={styles.categoryCell}>
                                                <span className={styles.categoryName}>
                                                    {file.category?.name || 'Без категории'}
                                                </span>
                                            </td>
                                            <td className={styles.descriptionCell}>
                                                <span className={styles.fileDescription}>
                                                    {file.description || '-'}
                                                </span>
                                            </td>
                                            <td className={styles.sizeCell}>
                                                {formatFileSize(file.size)}
                                            </td>
                                            <td className={styles.dateCell}>
                                                {new Date(file.createdAt).toLocaleDateString('ru-RU')}
                                            </td>
                                            <td className={styles.actionCell}>
                                                <button
                                                    className={styles.downloadButton}
                                                    onMouseEnter={() => setHovered(file._id)}
                                                    onMouseLeave={() => setHovered(null)}
                                                    onClick={() => handleDownload(file._id, file.originalName)}
                                                >
                                                    📥 Скачать
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // Mobile Card View
                        <div className={styles.cardsContainer}>
                            {filterFiles.map(file => (
                                <div className={styles.fileCard} key={file._id}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.fileIcon}>
                                            {getFileIcon(file.mimetype)}
                                        </div>
                                        <div className={styles.fileInfo}>
                                            <h3 className={styles.fileName}>{file.originalName}</h3>
                                            <div className={styles.fileMeta}>
                                                <span className={styles.category}>
                                                    {file.category?.name || 'Без категории'}
                                                </span>
                                                <span>•</span>
                                                <span>{formatFileSize(file.size)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {file.description && (
                                        <div className={styles.cardDescription}>
                                            <p>{file.description}</p>
                                        </div>
                                    )}
                                    
                                    <div className={styles.cardDetails}>
                                        <div className={styles.detailItem}>
                                            <strong>Тип:</strong>
                                            <span>{file.mimetype}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <strong>Дата:</strong>
                                            <span>{new Date(file.createdAt).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <strong>Скачиваний:</strong>
                                            <span>{file.downloadCount || 0}</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        className={styles.downloadButton}
                                        onClick={() => handleDownload(file._id, file.originalName)}
                                        onMouseEnter={() => setHovered(file._id)}
                                        onMouseLeave={() => setHovered(null)}
                                    >
                                        📥 Скачать файл
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}