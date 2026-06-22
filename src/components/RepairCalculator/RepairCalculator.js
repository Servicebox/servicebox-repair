'use client';
import { PRICING } from '@/lib/pricing-data';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

// Вспомогательная функция (чистая функция, не хук)
const getServicePrice = (serviceKey, category, brandData, modelData) => {
    const service = category.services[serviceKey];
    if (!service || !modelData || !brandData) return null;
    let price = modelData.specificPrices?.[serviceKey];
    if (price === undefined) {
        const calculated = Math.round(
            service.basePrice *
            (modelData.gen || 1.0) *
            (brandData.multiplier || 1.0)
        );
        price = Math.max(calculated, service.basePrice);
    }
    return price;
};

export default function RepairCalculator({ initialDeviceType = null }) {
    // ✅ ХУКИ ВНУТРИ КОМПОНЕНТА
    const [dbPricing, setDbPricing] = useState(null);

    useEffect(() => {
        fetch('/api/calculator-config')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.pricingData) setDbPricing(data.pricingData);
            })
            .catch(() => { }); // Если API недоступен, останется null
    }, []);

    // Переменная, которая берет данные из БД, а если их нет - берет локальный PRICING
    const activePricing = dbPricing || PRICING;

    const [deviceType, setDeviceType] = useState(initialDeviceType);
    const [brand, setBrand] = useState(null);
    const [modelId, setModelId] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);

    const toggleService = (key) => {
        setSelectedServices(prev =>
            prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
        );
    };

    const reset = () => {
        setDeviceType(null);
        setBrand(null);
        setModelId(null);
        setSelectedServices([]);
    };

    const calculatePrice = useMemo(() => {
        if (!deviceType || !brand || !modelId || selectedServices.length === 0) return null;

        // Используем activePricing (который может быть из БД)
        const category = activePricing[deviceType];
        if (!category) return null;

        const brandData = category.brands[brand];
        const modelData = brandData?.models.find(m => m.id === modelId);
        if (!modelData) return null;

        let minTotal = 0;
        let maxTotal = 0;
        const details = selectedServices.map(serviceKey => {
            const price = getServicePrice(serviceKey, category, brandData, modelData);
            if (price === null) return null;
            const minPrice = Math.round(price * 0.85);
            const maxPrice = Math.round(price * 1.15);
            minTotal += minPrice;
            maxTotal += maxPrice;
            return { ...category.services[serviceKey], minPrice, maxPrice };
        }).filter(Boolean);
        return { minTotal, maxTotal, details, modelName: modelData.name };
    }, [deviceType, brand, modelId, selectedServices, activePricing]); // Добавил activePricing в зависимости

    const getFilteredServices = () => {
        if (!deviceType || !brand || !modelId) return [];
        const category = activePricing[deviceType];
        const brandData = category.brands[brand];
        const modelData = brandData.models.find(m => m.id === modelId);
        if (!modelData) return Object.entries(category.services);
        return Object.entries(category.services).filter(([key, svc]) => {
            if (svc.appleOnly && brand !== 'apple') return false;
            if (svc.portType) {
                if (modelData.portType) return svc.portType === modelData.portType;
                return false;
            }
            if (svc.requiresSeparateGlass && !modelData.hasSeparateGlass) return false;
            if (svc.requiresThermalPads && !modelData.hasThermalPads) return false;
            if (svc.requiresBga && !modelData.hasBga) return false;
            if (svc.requiresFaceId && !modelData.requiresFaceId) return false;
            if (svc.requiresTvType && Array.isArray(svc.requiresTvType)) {
                if (!modelData.tvType || !svc.requiresTvType.includes(modelData.tvType)) return false;
            }
            if (key === 'face_id' && brand !== 'apple') return false;
            if (key === 'silent_switch' && brand !== 'apple') return false;
            if (key === 'apple_id_setup' && brand !== 'apple') return false;
            if (key === 'glass' && brand !== 'apple') return false;
            return true;
        });
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                `}} />
            <section
                className="w-full max-w-4xl mx-auto"
                id="calculator"
                itemScope
                itemType="https://schema.org/WebApplication"
                aria-label="Калькулятор стоимости ремонта техники"
            >
                <meta itemProp="name" content="Калькулятор стоимости ремонта техники в Вологде" />
                <meta itemProp="applicationCategory" content="BusinessApplication" />
                <meta itemProp="operatingSystem" content="All" />
                <meta itemProp="isAccessibleForFree" content="true" />
                <header className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3" itemProp="name" style={{ color: '#002147' }}>
                        🧮 Калькулятор стоимости ремонта
                    </h2>
                    <p className="text-gray-600 text-lg" itemProp="description">
                        Бесплатный онлайн-калькулятор. Точный расчёт с учётом вашей модели за 30 секунд
                    </p>
                    <p className="text-sm text-orange-600 font-semibold mt-2">
                        ⚡ Точная цена после диагностики
                    </p>
                </header>
                <div className="rounded-3xl p-6 md:p-8 shadow-2xl border-2" style={{
                    background: 'transparent', borderColor: '#002147', backdropFilter: 'blur(10px)'
                }}>
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>1</div>
                            <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Что ремонтируем?</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" role="radiogroup" aria-label="Категории техники">
                            {Object.entries(activePricing).map(([key, cat]) => (
                                <button
                                    key={key}
                                    onClick={() => { setDeviceType(key); setBrand(null); setModelId(null); setSelectedServices([]); }}
                                    className="group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border-2 hover:scale-105"
                                    role="radio"
                                    aria-checked={deviceType === key}
                                    aria-label={`Категория: ${cat.label}`}
                                    style={{ background: deviceType === key ? 'linear-gradient(135deg, #002147 0%, #003d7a 100%)' : 'white', borderColor: deviceType === key ? '#002147' : '#e2e8f0', color: deviceType === key ? 'white' : '#002147' }}
                                >
                                    <div className="text-4xl mb-2" aria-hidden="true">{cat.icon}</div>
                                    <div className="font-bold text-sm">{cat.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {deviceType && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>2</div>
                                <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Выберите бренд / серию</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Бренды">
                                {Object.entries(activePricing[deviceType].brands).map(([key, b]) => (
                                    <button
                                        key={key}
                                        onClick={() => { setBrand(key); setModelId(null); setSelectedServices([]); }}
                                        className="rounded-xl p-4 transition-all duration-300 border-2 hover:scale-105 text-left"
                                        role="radio"
                                        aria-checked={brand === key}
                                        aria-label={`Бренд: ${b.name}`}
                                        style={{ background: brand === key ? 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)' : 'white', borderColor: brand === key ? '#ff8c00' : '#e2e8f0', color: brand === key ? 'white' : '#002147' }}
                                    >
                                        <div className="font-bold text-sm mb-1">{b.name}</div>
                                        <div className="text-xs opacity-80">{b.models.length} {b.models.length === 1 ? 'модель' : b.models.length < 5 ? 'модели' : 'моделей'}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {brand && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>3</div>
                                <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Выберите точную модель</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-label="Модели устройств">
                                    {activePricing[deviceType].brands[brand].models.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => { setModelId(m.id); setSelectedServices([]); }}
                                            className="rounded-xl p-4 transition-all duration-300 border-2 text-left hover:scale-[1.02]"
                                            role="radio"
                                            aria-checked={modelId === m.id}
                                            aria-label={`Модель: ${m.name}`}
                                            style={{ background: modelId === m.id ? 'linear-gradient(135deg, #002147 0%, #003d7a 100%)' : 'white', borderColor: modelId === m.id ? '#002147' : '#e2e8f0', color: modelId === m.id ? 'white' : '#002147' }}
                                        >
                                            <div className="font-semibold">{m.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {modelId && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>4</div>
                                <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Какие работы нужны?</h3>
                            </div>
                            <div className="space-y-3" role="group" aria-label="Список услуг">
                                {getFilteredServices().map(([key, svc]) => {
                                    const modelData = activePricing[deviceType].brands[brand].models.find(m => m.id === modelId);
                                    const brandData = activePricing[deviceType].brands[brand];
                                    const price = getServicePrice(key, activePricing[deviceType], brandData, modelData);
                                    const isSelected = selectedServices.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => toggleService(key)}
                                            className="w-full rounded-2xl p-5 transition-all duration-300 border-2 hover:scale-[1.02] text-left"
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            aria-label={`${svc.name}, цена ~${price?.toLocaleString('ru-RU')} рублей`}
                                            style={{ background: isSelected ? 'linear-gradient(135deg, #fff4e6 0%, #ffe8cc 10%)' : 'white', borderColor: isSelected ? '#ff8c00' : '#e2e8f0' }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {isSelected && <span style={{ color: '#ff8c00' }} aria-hidden="true">✓</span>}
                                                        <h4 className="font-bold text-lg" style={{ color: '#002147' }}>{svc.name}</h4>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">{svc.desc}</p>
                                                    <div className="text-xs text-gray-500">⏱️ {svc.minTime} — {svc.maxTime}</div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-bold text-lg" style={{ color: '#ff8c00' }}>~{price?.toLocaleString('ru-RU')}₽</div>
                                                    <div className="text-xs text-gray-500">работа</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {calculatePrice && (
                        <div className="animate-fadeIn" itemScope itemType="https://schema.org/Offer" aria-live="polite">
                            <meta itemProp="priceCurrency" content="RUB" />
                            <meta itemProp="lowPrice" content={calculatePrice.minTotal} />
                            <meta itemProp="highPrice" content={calculatePrice.maxTotal} />
                            <div className="rounded-3xl p-6 md:p-8 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #002147 0%, #003d7a 100%)' }}>
                                <div className="text-center mb-6">
                                    <div className="text-sm opacity-80 mb-2">Для {calculatePrice.modelName}</div>
                                    <h3 className="text-2xl font-bold mb-2">💰 Стоимость работ</h3>
                                    <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ff8c00' }}>
                                        {calculatePrice.minTotal.toLocaleString('ru-RU')} – {calculatePrice.maxTotal.toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-4 mb-6 space-y-2">
                                    {calculatePrice.details.map((d, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="opacity-90">{d.name}</span>
                                            <span className="font-semibold">{d.minPrice.toLocaleString()} – {d.maxPrice.toLocaleString()} ₽</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white/10 rounded-xl p-3 mb-6 text-center text-sm opacity-90">
                                    ⚡ *Цена указана только за работу мастера<br />Стоимость запчастей рассчитывается отдельно
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <a href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`} className="flex items-center justify-center py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform" style={{ background: '#28a745', color: 'white' }}>
                                        📞 {BUSINESS.phonesFormatted.primary}
                                    </a>
                                    <Link href="/contacts" className="flex items-center justify-center py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform" style={{ background: 'white', color: '#002147' }}>
                                        📍 Приехать
                                    </Link>
                                </div>
                                <button onClick={reset} className="w-full py-3 rounded-xl font-semibold hover:scale-105 transition-transform" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>
                                    🔄 Рассчитать заново
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}