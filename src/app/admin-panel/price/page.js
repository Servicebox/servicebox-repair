'use client';

import { useState } from 'react';

export default function AdminPricePage() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        const file = e.target.file.files[0];

        if (!file) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/price/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Файл успешно загружен!' });
                e.target.reset();
            } else if (response.status === 403) {
                setMessage({ type: 'error', text: 'Ошибка доступа. Возможно, сессия истекла.' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Ошибка загрузки' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Ошибка сети' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Удалить прайс-лист?')) return;

        try {
            const response = await fetch('/api/price/delete', {
                method: 'DELETE',
                credentials: 'include', // ← добавляем
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Файл удален' });
            } else if (response.status === 403) {
                setMessage({ type: 'error', text: 'Ошибка доступа' });
            } else {
                setMessage({ type: 'error', text: 'Ошибка удаления' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Ошибка сети' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Управление прайс-листом</h1>

                {message && (
                    <div className={`p-4 rounded mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Загрузить новый прайс</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Файл Excel (.xlsx, .xls)
                            </label>
                            <input
                                type="file"
                                name="file"
                                accept=".xlsx,.xls"
                                required
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Загрузка...' : 'Загрузить файл'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">Опасная зона</h2>
                    <button
                        onClick={handleDelete}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                        Удалить прайс-лист
                    </button>
                </div>

                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold mb-2">Требования к файлу:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>Первая строка должна содержать заголовки</li>
                        <li>Обязательные колонки: наименование, модель, ревизия, розница</li>
                        <li>Колонка "цена закупа" будет проигнорирована (не показывается на сайте)</li>
                        <li>Рекомендуемый формат: .xlsx</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}