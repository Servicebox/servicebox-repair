'use client';

import { useState, useEffect } from 'react';

export default function PricePage() {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        loadPriceData();
    }, []);

    const loadPriceData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/price/data');
            if (!response.ok) throw new Error('Не удалось загрузить прайс');

            const result = await response.json();
            setHeaders(result.headers);
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch('/api/price/current');
            if (!response.ok) throw new Error('Файл не найден');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `прайс-${new Date().toLocaleDateString('ru-RU')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Ошибка скачивания: ' + err.message);
        }
    };
    // Фильтрация
    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Пагинация
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Форматирование значения
    const formatValue = (value, header) => {
        if (value === '' || value === null || value === undefined) return '—';
        if (header === 'розница' && typeof value === 'number') {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0
            }).format(value);
        }
        return String(value);
    };
    if (loading) {
        return (
            <div className="min-h-screen bg-surface py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p style={{ color: 'var(--color-text-muted)' }}>Загрузка прайс-листа...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-surface py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="rounded-lg p-6 text-center border" style={{ background: 'var(--color-danger-bg)', borderColor: 'var(--color-danger)' }}>
                        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-danger)' }}>Ошибка загрузки</h3>
                        <p className="mb-4" style={{ color: 'var(--color-danger)' }}>{error}</p>
                        <button onClick={loadPriceData} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">
                            Повторить
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Прайс-лист</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Актуально на {new Date().toLocaleDateString('ru-RU')}</p>
                </div>

                {/* Поиск и кнопки */}
                <div className="bg-bg rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Поиск по наименованию, модели..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleDownload}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
                        >
                            Скачать Excel
                        </button>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Найдено: {filteredData.length} позиций
                    </p>
                </div>
                {/* Таблица */}
                {paginatedData.length > 0 ? (
                    <div className="bg-bg rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-surface">
                                    <tr>
                                        {headers.map((header) => (
                                            <th
                                                key={header}
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                                style={{ color: 'var(--color-text-muted)' }}
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-bg divide-y divide-border">
                                    {paginatedData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-surface">
                                            {headers.map((header) => (
                                                <td key={header} className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {formatValue(row[header], header)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Пагинация */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-border rounded disabled:opacity-50"
                                >
                                    Назад
                                </button>
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    Страница {currentPage} из {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-border rounded disabled:opacity-50"
                                >
                                    Вперед
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-bg rounded-lg shadow p-12 text-center">
                        <p style={{ color: 'var(--color-text-muted)' }}>Прайс-лист пуст или не загружен</p>
                    </div>
                )}
            </div>
        </div>
    );
}
