'use client'; // Это клиентский компонент, он только для интерактива

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categoryIcons = {
    'Ремонт ноутбуков': '/images/notebook.webp',
    'Ремонт телефонов': '/images/android.webp',
    'Ремонт компьютеров': '/images/monoblok.webp',
    'Техника Apple': '/images/apple.webp',
    'Ремонт планшетов': '/images/tablet.webp',
    'Ремонт телевизоров': '/images/tv.webp',
    'Замена стекла': '/images/glass.webp',
    'Ремонт видеокарт': '/images/videocard.webp',
    'Другие услуги': '/images/Devices.webp'
};

const defaultIcon = '/images/Devices.webp';

export default function ServicesClient({ initialCategories }) {
    const [searchQuery, setSearchQuery] = useState('');

    const getIconForCategory = (categoryName) => {
        for (const [key, icon] of Object.entries(categoryIcons)) {
            if (categoryName.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return defaultIcon;
    };

    const filteredCategories = initialCategories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!initialCategories.length) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm max-w-7xl mx-auto px-4">
                <p className="text-gray-600">Не удалось загрузить список услуг.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Поиск */}
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Поиск услуги (например, замена экрана)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-xl mx-auto block px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
            </div>

            {filteredCategories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Категории не найдены</h3>
                    <p className="text-gray-600 mb-6">Попробуйте изменить поисковый запрос</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCategories.map((category) => (
                        <Link
                            key={category._id}
                            href={`/services/${encodeURIComponent(category.slug)}`}
                            className="group block bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl hover:border-blue-300 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Image
                                        src={getIconForCategory(category.name)}
                                        alt={category.name}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {category.name}
                                </h3>

                                <p className="text-gray-600 mb-6 line-clamp-2">
                                    {category.description}
                                </p>

                                <div className="flex items-center justify-between w-full mt-auto">
                                    <span className="text-sm text-gray-500">
                                        {category.children?.length || 0} услуг
                                    </span>
                                    <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                                        Подробнее →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}