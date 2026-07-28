'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';
import { resolvePrice } from '@/lib/resolve-price';

// Статичный список категорий устройств калькулятора — те же 6, что и в
// src/components/Admin/PricingMatrix/PricingMatrix.js. Живых данных на этот
// список нет (это не более чем ярлыки), сами цены/бренды/модели — из БД.
const DEVICE_TYPES = [
    { key: 'phone', label: 'Смартфон', icon: '📱' },
    { key: 'laptop', label: 'Ноутбук', icon: '💻' },
    { key: 'tablet', label: 'Планшет', icon: '📲' },
    { key: 'tv', label: 'Телевизор', icon: '📺' },
    { key: 'console', label: 'Игровая приставка', icon: '🎮' },
    { key: 'videocard', label: 'Видеокарта', icon: '🔥' },
];

// Бренд считается "Apple" по имени — в унифицированной модели данных нет
// отдельного стабильного ключа бренда (раньше был литерал 'apple' в pricing-data.js).
const isAppleBrand = (brand) => /apple/i.test(brand?.name || '');

// Проверяет, применим ли ремонтный пункт (service) к выбранным бренду/модели.
// Переносит фильтрацию из старой pricing-data.js версии 1:1 на compatFlags.
const isServiceApplicable = (service, brand, model) => {
    const flags = service.compatFlags || {};
    if (flags.appleOnly && !isAppleBrand(brand)) return false;
    if (flags.portType) {
        if (!model.portType) return false;
        if (flags.portType !== model.portType) return false;
    }
    if (flags.requiresSeparateGlass && !model.hasSeparateGlass) return false;
    if (flags.requiresThermalPads && !model.hasThermalPads) return false;
    if (flags.requiresBga && !model.hasBga) return false;
    // requiresFaceId: в исходных данных ни у одной модели никогда не было
    // соответствующего флага — сохраняем это (пока не заведено) поведение как есть.
    if (flags.requiresFaceId && !model.hasFaceId) return false;
    if (flags.requiresTvType?.length && !flags.requiresTvType.includes(model.tvType)) return false;
    return true;
};

export default function RepairCalculator({ initialDeviceType = null, initialServiceId = null }) {
    const [deviceType, setDeviceType] = useState(initialDeviceType);
    const [matrixData, setMatrixData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [brandId, setBrandId] = useState(null);
    const [modelId, setModelId] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [autoSelected, setAutoSelected] = useState(false);

    useEffect(() => {
        if (!deviceType) return;
        setLoading(true);
        setMatrixData(null);
        fetch(`/api/repair-pricing?deviceType=${deviceType}`)
            .then(res => res.json())
            .then(data => { if (data.success) setMatrixData(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [deviceType]);

    const brand = useMemo(
        () => matrixData?.brands.find(b => b._id === brandId) ?? null,
        [matrixData, brandId]
    );
    const model = useMemo(
        () => brand?.models.find(m => m._id === modelId) ?? null,
        [brand, modelId]
    );

    const toggleService = (id) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const reset = () => {
        setDeviceType(null);
        setMatrixData(null);
        setBrandId(null);
        setModelId(null);
        setSelectedServices([]);
    };

    const selectDeviceType = (key) => {
        setDeviceType(key);
        setBrandId(null);
        setModelId(null);
        setSelectedServices([]);
    };

    // Реагирует на изменение initialDeviceType ПОСЛЕ монтирования — обычный
    // useState(initialDeviceType) выше видит его только один раз при первом
    // рендере. Нужно для hero-пикера категории на главной (Main.js), который
    // передаёт initialDeviceType уже после того, как этот компонент смонтирован.
    useEffect(() => {
        if (initialDeviceType) selectDeviceType(initialDeviceType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialDeviceType]);

    const selectBrand = (id) => {
        setBrandId(id);
        setModelId(null);
        setSelectedServices([]);
    };

    const selectModel = (id) => {
        setModelId(id);
        setSelectedServices([]);
    };

    // Услуги, применимые к выбранным бренду/модели и имеющие вычислимую цену
    // (basePrice или подходящий priceVariant) — то, что ещё не привязано к
    // Brand/Model через матрицу цен в админке, в калькуляторе не показывается.
    const applicableServices = useMemo(() => {
        if (!matrixData || !brand || !model) return [];
        return matrixData.services
            .filter(service => isServiceApplicable(service, brand, model))
            .map(service => ({ service, resolved: resolvePrice(service, brand, model) }))
            .filter(({ resolved }) => resolved.type !== 'display');
    }, [matrixData, brand, model]);

    // Пришли со страницы конкретной услуги ("Точный расчёт по вашей модели") — как
    // только после выбора модели эта услуга появится в применимых, отмечаем её сами,
    // один раз (чтобы не мешать пользователю потом снять галочку вручную).
    useEffect(() => {
        if (autoSelected || !initialServiceId) return;
        if (applicableServices.some(({ service }) => service._id === initialServiceId)) {
            setSelectedServices(prev => prev.includes(initialServiceId) ? prev : [...prev, initialServiceId]);
            setAutoSelected(true);
        }
    }, [applicableServices, initialServiceId, autoSelected]);

    const calculatePrice = useMemo(() => {
        if (!model || selectedServices.length === 0) return null;

        let minTotal = 0;
        let maxTotal = 0;
        const details = selectedServices.map(id => {
            const entry = applicableServices.find(({ service }) => service._id === id);
            if (!entry) return null;
            const minPrice = Math.round(entry.resolved.price * 0.85);
            const maxPrice = Math.round(entry.resolved.price * 1.15);
            minTotal += minPrice;
            maxTotal += maxPrice;
            return { name: entry.service.name, minPrice, maxPrice };
        }).filter(Boolean);

        return { minTotal, maxTotal, details, modelName: model.name };
    }, [model, selectedServices, applicableServices]);

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
                    <h2 className="text-3xl md:text-4xl font-bold mb-3" itemProp="name" style={{ color: 'var(--color-primary-dark)' }}>
                        🧮 Калькулятор стоимости ремонта
                    </h2>
                    <p className="text-lg" itemProp="description" style={{ color: 'var(--color-text-muted)' }}>
                        Бесплатный онлайн-калькулятор. Точный расчёт с учётом вашей модели за 30 секунд
                    </p>
                    <p className="text-sm font-semibold mt-2" style={{ color: 'var(--color-warning)' }}>
                        ⚡ Точная цена после диагностики
                    </p>
                </header>
                <div className="rounded-3xl p-6 md:p-8 shadow-2xl border-2" style={{
                    background: 'transparent', borderColor: 'var(--color-primary-dark)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--color-primary-dark)' }}>1</div>
                            <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>Что ремонтируем?</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" role="radiogroup" aria-label="Категории техники">
                            {DEVICE_TYPES.map(({ key, label, icon }) => (
                                <button
                                    key={key}
                                    onClick={() => selectDeviceType(key)}
                                    className="group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border-2 hover:scale-105"
                                    role="radio"
                                    aria-checked={deviceType === key}
                                    aria-label={`Категория: ${label}`}
                                    style={{ background: deviceType === key ? 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 100%)' : 'var(--color-bg)', borderColor: deviceType === key ? 'var(--color-primary-dark)' : 'var(--color-border)', color: deviceType === key ? 'var(--color-text-inverse)' : 'var(--color-primary-dark)' }}
                                >
                                    <div className="text-4xl mb-2" aria-hidden="true">{icon}</div>
                                    <div className="font-bold text-sm">{label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {deviceType && loading && (
                        <div className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Загрузка цен...</div>
                    )}
                    {deviceType && !loading && matrixData && !matrixData.category && (
                        <div className="text-center py-4" style={{ color: 'var(--color-warning)' }}>
                            Для этой категории пока не настроены цены в новой системе — загляните позже.
                        </div>
                    )}
                    {deviceType && matrixData?.category && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--color-primary-dark)' }}>2</div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>Выберите бренд / серию</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Бренды">
                                {matrixData.brands.map((b) => (
                                    <button
                                        key={b._id}
                                        onClick={() => selectBrand(b._id)}
                                        className="rounded-xl p-4 transition-all duration-300 border-2 hover:scale-105 text-left"
                                        role="radio"
                                        aria-checked={brandId === b._id}
                                        aria-label={`Бренд: ${b.name}`}
                                        style={{ background: brandId === b._id ? 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)' : 'var(--color-bg)', borderColor: brandId === b._id ? '#ff8c00' : 'var(--color-border)', color: brandId === b._id ? 'var(--color-text-inverse)' : 'var(--color-primary-dark)' }}
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
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--color-primary-dark)' }}>3</div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>Выберите точную модель</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-label="Модели устройств">
                                    {brand.models.map((m) => (
                                        <button
                                            key={m._id}
                                            onClick={() => selectModel(m._id)}
                                            className="rounded-xl p-4 transition-all duration-300 border-2 text-left hover:scale-[1.02]"
                                            role="radio"
                                            aria-checked={modelId === m._id}
                                            aria-label={`Модель: ${m.name}`}
                                            style={{ background: modelId === m._id ? 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 100%)' : 'var(--color-bg)', borderColor: modelId === m._id ? 'var(--color-primary-dark)' : 'var(--color-border)', color: modelId === m._id ? 'var(--color-text-inverse)' : 'var(--color-primary-dark)' }}
                                        >
                                            <div className="font-semibold">{m.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {model && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--color-primary-dark)' }}>4</div>
                                <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>Какие работы нужны?</h3>
                            </div>
                            {applicableServices.length === 0 && (
                                <p style={{ color: 'var(--color-text-muted)' }}>Для этой модели пока нет настроенных цен — уточните стоимость по телефону.</p>
                            )}
                            <div className="space-y-3" role="group" aria-label="Список услуг">
                                {applicableServices.map(({ service, resolved }) => {
                                    const isSelected = selectedServices.includes(service._id);
                                    return (
                                        <button
                                            key={service._id}
                                            onClick={() => toggleService(service._id)}
                                            className="w-full rounded-2xl p-5 transition-all duration-300 border-2 hover:scale-[1.02] text-left"
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            aria-label={`${service.name}, цена ~${resolved.price?.toLocaleString('ru-RU')} рублей`}
                                            style={{ background: isSelected ? 'var(--color-warning-bg)' : 'var(--color-bg)', borderColor: isSelected ? '#ff8c00' : 'var(--color-border)' }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {isSelected && <span style={{ color: '#ff8c00' }} aria-hidden="true">✓</span>}
                                                        <h4 className="font-bold text-lg" style={{ color: 'var(--color-primary-dark)' }}>{service.name}</h4>
                                                    </div>
                                                    {(service.minTime || service.maxTime) && (
                                                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>⏱️ {service.minTime} — {service.maxTime}</div>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-bold text-lg" style={{ color: '#ff8c00' }}>~{resolved.price?.toLocaleString('ru-RU')}₽</div>
                                                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>работа</div>
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
                            <div className="rounded-3xl p-6 md:p-8 shadow-2xl" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-dark) 100%)', color: 'var(--color-text-inverse)' }}>
                                <div className="text-center mb-6">
                                    <div className="text-sm opacity-80 mb-2">Для {calculatePrice.modelName}</div>
                                    <h3 className="text-2xl font-bold mb-2">💰 Стоимость работ</h3>
                                    <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ff8c00' }}>
                                        {calculatePrice.minTotal.toLocaleString('ru-RU')} – {calculatePrice.maxTotal.toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>
                                <div className="rounded-2xl p-4 mb-6 space-y-2" style={{ background: 'color-mix(in srgb, var(--color-text-inverse) 10%, transparent)' }}>
                                    {calculatePrice.details.map((d, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="opacity-90">{d.name}</span>
                                            <span className="font-semibold">{d.minPrice.toLocaleString()} – {d.maxPrice.toLocaleString()} ₽</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-xl p-3 mb-6 text-center text-sm opacity-90" style={{ background: 'color-mix(in srgb, var(--color-text-inverse) 10%, transparent)' }}>
                                    ⚡ *Цена указана только за работу мастера<br />Стоимость запчастей рассчитывается отдельно
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <a href={`tel:${BUSINESS.phones.primary.replace(/-/g, '')}`} className="flex items-center justify-center py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform" style={{ background: 'var(--color-success)', color: 'var(--color-text-inverse)' }}>
                                        📞 {BUSINESS.phonesFormatted.primary}
                                    </a>
                                    <Link href="/contacts" className="flex items-center justify-center py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform" style={{ background: 'var(--color-bg-dark)', color: 'var(--color-primary-dark)' }}>
                                        📍 Приехать
                                    </Link>
                                </div>
                                <button onClick={reset} className="w-full py-3 rounded-xl font-semibold hover:scale-105 transition-transform" style={{ background: 'color-mix(in srgb, var(--color-text-inverse) 10%, transparent)', color: 'var(--color-text-inverse)', border: '2px solid color-mix(in srgb, var(--color-text-inverse) 30%, transparent)' }}>
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
