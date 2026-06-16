'use client';
import { useState, useEffect, useCallback } from 'react';

export default function CalculatorConfigEditor() {
    const [pricingData, setPricingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState('phone');
    const [activeSection, setActiveSection] = useState('services'); // 'services' | 'brands'
    const [editingService, setEditingService] = useState(null);
    const [showAddService, setShowAddService] = useState(false);
    const [newService, setNewService] = useState({
        name: '', basePrice: 0, minTime: '30 мин', maxTime: '1 час', desc: '',
        requiresBga: false, appleOnly: false, requiresSeparateGlass: false,
        requiresThermalPads: false, requiresFaceId: false, requiresTvType: [],
        portType: ''
    });

    // Загрузка данных
    useEffect(() => {
        fetch('/api/calculator-config')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.pricingData) {
                    setPricingData(data.pricingData);
                    setStatus('✅ Данные загружены');
                }
            })
            .catch(() => setStatus('❌ Ошибка загрузки'))
            .finally(() => setLoading(false));
    }, []);

    // Сохранение
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/calculator-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pricingData }),
            });
            const result = await res.json();
            if (result.success) setStatus('✅ Успешно сохранено!');
            else setStatus('❌ Ошибка: ' + result.message);
        } catch (e) {
            setStatus('❌ Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    // Обновление услуги
    const updateService = useCallback((deviceType, serviceKey, field, value) => {
        setPricingData(prev => {
            const updated = { ...prev };
            updated[deviceType] = {
                ...updated[deviceType],
                services: {
                    ...updated[deviceType].services,
                    [serviceKey]: {
                        ...updated[deviceType].services[serviceKey],
                        [field]: value
                    }
                }
            };
            return updated;
        });
    }, []);

    // Обновление мультипликатора бренда
    const updateBrandMultiplier = useCallback((deviceType, brandKey, value) => {
        setPricingData(prev => {
            const updated = { ...prev };
            updated[deviceType] = {
                ...updated[deviceType],
                brands: {
                    ...updated[deviceType].brands,
                    [brandKey]: {
                        ...updated[deviceType].brands[brandKey],
                        multiplier: parseFloat(value) || 1
                    }
                }
            };
            return updated;
        });
    }, []);

    // Обновление названия бренда
    const updateBrandName = useCallback((deviceType, brandKey, value) => {
        setPricingData(prev => {
            const updated = { ...prev };
            updated[deviceType] = {
                ...updated[deviceType],
                brands: {
                    ...updated[deviceType].brands,
                    [brandKey]: {
                        ...updated[deviceType].brands[brandKey],
                        name: value
                    }
                }
            };
            return updated;
        });
    }, []);

    // Добавление новой услуги
    const addService = useCallback(() => {
        if (!newService.name.trim()) return;
        const key = newService.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\wа-яё]/gi, '');

        setPricingData(prev => {
            const updated = { ...prev };
            updated[activeTab] = {
                ...updated[activeTab],
                services: {
                    ...updated[activeTab].services,
                    [key]: { ...newService }
                }
            };
            return updated;
        });

        setNewService({
            name: '', basePrice: 0, minTime: '30 мин', maxTime: '1 час', desc: '',
            requiresBga: false, appleOnly: false, requiresSeparateGlass: false,
            requiresThermalPads: false, requiresFaceId: false, requiresTvType: [],
            portType: ''
        });
        setShowAddService(false);
        setStatus('✅ Услуга добавлена');
    }, [activeTab, newService]);

    // Удаление услуги
    const deleteService = useCallback((deviceType, serviceKey) => {
        if (!confirm('Удалить эту услугу?')) return;
        setPricingData(prev => {
            const updated = { ...prev };
            const { [serviceKey]: _, ...rest } = updated[deviceType].services;
            updated[deviceType] = { ...updated[deviceType], services: rest };
            return updated;
        });
        setStatus('🗑️ Услуга удалена');
    }, []);

    // Удаление бренда
    const deleteBrand = useCallback((deviceType, brandKey) => {
        if (!confirm('Удалить этот бренд?')) return;
        setPricingData(prev => {
            const updated = { ...prev };
            const { [brandKey]: _, ...rest } = updated[deviceType].brands;
            updated[deviceType] = { ...updated[deviceType], brands: rest };
            return updated;
        });
        setStatus('🗑️ Бренд удалён');
    }, []);

    if (loading) return <div className="p-6 text-gray-500">Загрузка редактора...</div>;
    if (!pricingData) return <div className="p-6 text-red-500">Нет данных</div>;

    const deviceTypes = {
        phone: { label: '📱 Смартфон', color: 'bg-blue-50' },
        laptop: { label: '💻 Ноутбук', color: 'bg-purple-50' },
        tablet: { label: '📲 Планшет', color: 'bg-green-50' },
        tv: { label: '📺 Телевизор', color: 'bg-orange-50' },
        console: { label: '🎮 Приставка', color: 'bg-pink-50' },
        videocard: { label: '🔥 Видеокарта', color: 'bg-red-50' },
    };

    const currentData = pricingData[activeTab];

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {/* Шапка */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">🧮 Редактор цен калькулятора</h1>
                    <p className="text-sm text-gray-500 mt-1">Редактируйте базовые цены, названия услуг и мультипликаторы брендов</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${status.includes('✅') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
                        {status}
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        {saving ? 'Сохранение...' : '💾 Сохранить'}
                    </button>
                </div>
            </div>

            {/* Табы устройств */}
            <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl">
                {Object.entries(deviceTypes).map(([key, { label, color }]) => (
                    <button
                        key={key}
                        onClick={() => { setActiveTab(key); setActiveSection('services'); setEditingService(null); setShowAddService(false); }}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === key
                            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Переключатель секций */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveSection('services')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeSection === 'services'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    🛠️ Услуги ({Object.keys(currentData.services).length})
                </button>
                <button
                    onClick={() => setActiveSection('brands')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeSection === 'brands'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    🏢 Бренды ({Object.keys(currentData.brands).length})
                </button>
            </div>

            {/* СЕКЦИЯ: Услуги */}
            {activeSection === 'services' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Базовые цены на услуги</h3>
                        <button
                            onClick={() => setShowAddService(!showAddService)}
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            + Добавить услугу
                        </button>
                    </div>

                    {/* Форма добавления */}
                    {showAddService && (
                        <div className="p-4 bg-green-50 border-b space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Название услуги"
                                    value={newService.name}
                                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Базовая цена"
                                    value={newService.basePrice}
                                    onChange={e => setNewService({ ...newService, basePrice: parseInt(e.target.value) || 0 })}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Мин. время (например: 30 мин)"
                                    value={newService.minTime}
                                    onChange={e => setNewService({ ...newService, minTime: e.target.value })}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Макс. время (например: 2 часа)"
                                    value={newService.maxTime}
                                    onChange={e => setNewService({ ...newService, maxTime: e.target.value })}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <textarea
                                    placeholder="Описание"
                                    value={newService.desc}
                                    onChange={e => setNewService({ ...newService, desc: e.target.value })}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none md:col-span-2"
                                    rows={2}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <label className="flex items-center gap-1"><input type="checkbox" checked={newService.requiresBga} onChange={e => setNewService({ ...newService, requiresBga: e.target.checked })} /> BGA-пайка</label>
                                <label className="flex items-center gap-1"><input type="checkbox" checked={newService.appleOnly} onChange={e => setNewService({ ...newService, appleOnly: e.target.checked })} /> Только Apple</label>
                                <label className="flex items-center gap-1"><input type="checkbox" checked={newService.requiresSeparateGlass} onChange={e => setNewService({ ...newService, requiresSeparateGlass: e.target.checked })} /> Раздельное стекло</label>
                                <label className="flex items-center gap-1"><input type="checkbox" checked={newService.requiresFaceId} onChange={e => setNewService({ ...newService, requiresFaceId: e.target.checked })} /> Face ID</label>
                                <label className="flex items-center gap-1"><input type="checkbox" checked={newService.requiresThermalPads} onChange={e => setNewService({ ...newService, requiresThermalPads: e.target.checked })} /> Термопрокладки</label>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={addService} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Добавить</button>
                                <button onClick={() => setShowAddService(false)} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">Отмена</button>
                            </div>
                        </div>
                    )}

                    {/* Таблица услуг */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="text-left p-3 w-1/4">Название</th>
                                    <th className="text-center p-3 w-24">Базовая цена</th>
                                    <th className="text-center p-3 w-28">Время (мин-макс)</th>
                                    <th className="text-left p-3">Описание</th>
                                    <th className="text-center p-3 w-16">Теги</th>
                                    <th className="text-center p-3 w-20">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {Object.entries(currentData.services).map(([key, svc]) => (
                                    <tr key={key} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            {editingService === key ? (
                                                <input
                                                    type="text"
                                                    value={svc.name}
                                                    onChange={e => updateService(activeTab, key, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            ) : (
                                                <span className="font-medium text-gray-800">{svc.name}</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <input
                                                type="number"
                                                value={svc.basePrice}
                                                onChange={e => updateService(activeTab, key, 'basePrice', parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </td>
                                        <td className="p-3 text-center text-xs text-gray-600">
                                            {svc.minTime} / {svc.maxTime}
                                        </td>
                                        <td className="p-3 text-xs text-gray-500 max-w-xs truncate" title={svc.desc}>
                                            {svc.desc}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {svc.appleOnly && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">Apple</span>}
                                                {svc.requiresBga && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">BGA</span>}
                                                {svc.requiresSeparateGlass && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">Стекло</span>}
                                                {svc.requiresFaceId && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">FaceID</span>}
                                                {svc.requiresThermalPads && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px]">Прокладки</span>}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex gap-1 justify-center">
                                                <button
                                                    onClick={() => setEditingService(editingService === key ? null : key)}
                                                    className="p-1 hover:bg-blue-50 rounded text-blue-600"
                                                    title="Редактировать"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => deleteService(activeTab, key)}
                                                    className="p-1 hover:bg-red-50 rounded text-red-600"
                                                    title="Удалить"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* СЕКЦИЯ: Бренды */}
            {activeSection === 'brands' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Мультипликаторы брендов (коэффициенты цен)</h3>
                        <p className="text-xs text-gray-500 mt-1">Цена услуги = Базовая цена × Мультипликатор бренда. Значение 1.0 = без наценки.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {Object.entries(currentData.brands).map(([key, brand]) => (
                            <div key={key} className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                    <input
                                        type="text"
                                        value={brand.name}
                                        onChange={e => updateBrandName(activeTab, key, e.target.value)}
                                        className="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 w-3/4"
                                    />
                                    <button
                                        onClick={() => deleteBrand(activeTab, key)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                        title="Удалить бренд"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-sm text-gray-600">Коэффициент:</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={brand.multiplier}
                                        onChange={e => updateBrandMultiplier(activeTab, key, e.target.value)}
                                        className="w-20 px-2 py-1 border rounded text-center font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <span className="text-xs text-gray-500">
                                        ({brand.multiplier === 1 ? 'базовая' : brand.multiplier > 1 ? `+${Math.round((brand.multiplier - 1) * 100)}%` : `-${Math.round((1 - brand.multiplier) * 100)}%`})
                                    </span>
                                </div>
                                {brand.models && brand.models.length > 0 && (
                                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                        Моделей: {brand.models.length}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* JSON просмотр (для отладки) */}
            <details className="bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">📄 Показать/скрыть исходный JSON</summary>
                <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-auto max-h-96">
                    {JSON.stringify(pricingData, null, 2)}
                </pre>
            </details>
        </div>
    );
}