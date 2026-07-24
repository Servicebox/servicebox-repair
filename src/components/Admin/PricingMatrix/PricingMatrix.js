'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './PricingMatrix.module.css';

const DEVICE_TYPES = [
    { key: 'phone', label: '📱 Смартфон' },
    { key: 'laptop', label: '💻 Ноутбук' },
    { key: 'tablet', label: '📲 Планшет' },
    { key: 'tv', label: '📺 Телевизор' },
    { key: 'console', label: '🎮 Приставка' },
    { key: 'videocard', label: '🔥 Видеокарта' },
];

export default function PricingMatrix() {
    const [deviceType, setDeviceType] = useState('phone');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    // Черновые правки: `${serviceId}:${modelId}` -> price, и basePrice правки: serviceId -> basePrice
    const [cellEdits, setCellEdits] = useState({});
    const [basePriceEdits, setBasePriceEdits] = useState({});

    const [newBrand, setNewBrand] = useState({ name: '', multiplier: 1 });
    const [newModelByBrand, setNewModelByBrand] = useState({});

    const load = useCallback((type) => {
        setLoading(true);
        setCellEdits({});
        setBasePriceEdits({});
        fetch(`/api/admin/pricing-matrix?deviceType=${type}`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(json => { if (json.success) setData(json); })
            .catch(() => setStatus('❌ Ошибка загрузки'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(deviceType); }, [deviceType, load]);

    const allModels = useMemo(() => {
        if (!data) return [];
        return data.brands.flatMap(brand =>
            brand.models.map(model => ({ ...model, brandName: brand.name, brandMultiplier: brand.multiplier }))
        );
    }, [data]);

    const variantPrice = (service, modelId) => {
        const editKey = `${service._id}:${modelId}`;
        if (editKey in cellEdits) return cellEdits[editKey];
        const variant = (service.priceVariants || []).find(v => String(v.modelId) === String(modelId));
        return variant ? variant.price : '';
    };

    const setCell = (serviceId, modelId, value) => {
        setCellEdits(prev => ({ ...prev, [`${serviceId}:${modelId}`]: value }));
    };

    const basePriceValue = (service) => {
        if (service._id in basePriceEdits) return basePriceEdits[service._id];
        return service.basePrice ?? '';
    };

    const setBasePrice = (serviceId, value) => {
        setBasePriceEdits(prev => ({ ...prev, [serviceId]: value }));
    };

    const hasDirty = Object.keys(cellEdits).length > 0 || Object.keys(basePriceEdits).length > 0;

    const handleSave = async () => {
        setSaving(true);
        try {
            const changes = Object.entries(cellEdits)
                .filter(([, v]) => v !== '')
                .map(([key, price]) => {
                    const [serviceId, modelId] = key.split(':');
                    return { serviceId, modelId, price: parseFloat(price) || 0 };
                });
            const basePrices = Object.entries(basePriceEdits).map(([serviceId, basePrice]) => ({
                serviceId,
                basePrice: basePrice === '' ? null : parseFloat(basePrice) || 0
            }));

            const res = await fetch('/api/admin/pricing-matrix', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ changes, basePrices }),
            });
            const result = await res.json();
            if (result.success) {
                setStatus('✅ Сохранено');
                load(deviceType);
            } else {
                setStatus('❌ Ошибка: ' + (result.error ?? ''));
            }
        } catch {
            setStatus('❌ Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    const addBrand = async () => {
        if (!newBrand.name.trim()) return;
        const res = await fetch('/api/admin/brands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name: newBrand.name, deviceType, multiplier: parseFloat(newBrand.multiplier) || 1 }),
        });
        if (res.ok) {
            setNewBrand({ name: '', multiplier: 1 });
            load(deviceType);
        } else {
            setStatus('❌ Не удалось добавить бренд');
        }
    };

    const deleteBrand = async (brandId) => {
        if (!confirm('Удалить бренд вместе со всеми его моделями и ценами по ним?')) return;
        const res = await fetch(`/api/admin/brands/${brandId}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) load(deviceType);
        else setStatus('❌ Не удалось удалить бренд');
    };

    const addModel = async (brandId) => {
        const form = newModelByBrand[brandId];
        if (!form?.name?.trim()) return;
        const res = await fetch('/api/admin/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ brandId, name: form.name, gen: parseFloat(form.gen) || 1 }),
        });
        if (res.ok) {
            setNewModelByBrand(prev => ({ ...prev, [brandId]: { name: '', gen: 1 } }));
            load(deviceType);
        } else {
            setStatus('❌ Не удалось добавить модель');
        }
    };

    const deleteModel = async (modelId) => {
        if (!confirm('Удалить модель вместе с ценами на неё?')) return;
        const res = await fetch(`/api/admin/models/${modelId}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) load(deviceType);
        else setStatus('❌ Не удалось удалить модель');
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>🧮 Матрица цен (калькулятор + услуги)</h1>
                    <p className={styles.subtitle}>Цены на модель редактируются здесь и сразу применяются и в калькуляторе, и на странице услуги.</p>
                </div>
                <div className={styles.headerActions}>
                    {status && <span className={styles.status}>{status}</span>}
                    <button className={styles.saveButton} onClick={handleSave} disabled={saving || !hasDirty}>
                        {saving ? 'Сохранение...' : `💾 Сохранить${hasDirty ? ` (${Object.keys(cellEdits).length + Object.keys(basePriceEdits).length})` : ''}`}
                    </button>
                </div>
            </div>

            <div className={styles.tabs}>
                {DEVICE_TYPES.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`${styles.tab} ${deviceType === key ? styles.tabActive : ''}`}
                        onClick={() => setDeviceType(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading && <div className={styles.loading}>Загрузка...</div>}

            {!loading && data && !data.category && (
                <div className={styles.warning}>
                    ⚠️ Корневая категория услуг не найдена среди: {(data.candidateRootNames || []).join(', ') || '—'}.
                    Создайте категорию с таким названием в разделе «Услуги», чтобы матрица цен появилась.
                </div>
            )}

            {!loading && data && data.category && (
                <>
                    <div className={styles.brandsPanel}>
                        <h3 className={styles.panelTitle}>Бренды и модели — {data.category.name}</h3>
                        <div className={styles.brandAddRow}>
                            <input
                                type="text"
                                placeholder="Новый бренд"
                                value={newBrand.name}
                                onChange={e => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                                className={styles.input}
                            />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Мультипликатор"
                                value={newBrand.multiplier}
                                onChange={e => setNewBrand(prev => ({ ...prev, multiplier: e.target.value }))}
                                className={styles.inputSmall}
                            />
                            <button className={styles.addButton} onClick={addBrand}>+ Бренд</button>
                        </div>

                        <div className={styles.brandsList}>
                            {data.brands.map(brand => (
                                <div key={brand._id} className={styles.brandCard}>
                                    <div className={styles.brandCardHeader}>
                                        <span className={styles.brandName}>{brand.name}</span>
                                        <span className={styles.brandMultiplier}>×{brand.multiplier}</span>
                                        <button className={styles.deleteLink} onClick={() => deleteBrand(brand._id)}>Удалить бренд</button>
                                    </div>
                                    <ul className={styles.modelList}>
                                        {brand.models.map(model => (
                                            <li key={model._id} className={styles.modelItem}>
                                                <span>{model.name} <em>(gen {model.gen})</em></span>
                                                <button className={styles.deleteLink} onClick={() => deleteModel(model._id)}>×</button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={styles.modelAddRow}>
                                        <input
                                            type="text"
                                            placeholder="Новая модель"
                                            value={newModelByBrand[brand._id]?.name || ''}
                                            onChange={e => setNewModelByBrand(prev => ({ ...prev, [brand._id]: { ...prev[brand._id], name: e.target.value } }))}
                                            className={styles.input}
                                        />
                                        <input
                                            type="number"
                                            step="0.1"
                                            placeholder="gen"
                                            value={newModelByBrand[brand._id]?.gen ?? ''}
                                            onChange={e => setNewModelByBrand(prev => ({ ...prev, [brand._id]: { ...prev[brand._id], gen: e.target.value } }))}
                                            className={styles.inputSmall}
                                        />
                                        <button className={styles.addButton} onClick={() => addModel(brand._id)}>+ Модель</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.matrixScroll}>
                        <table className={styles.matrixTable}>
                            <thead>
                                <tr>
                                    <th className={styles.stickyCol}>Модель / Услуга</th>
                                    {data.services.map(service => (
                                        <th key={service._id} className={styles.serviceHeader}>
                                            <div className={styles.serviceName} title={service.name}>{service.name}</div>
                                            <input
                                                type="number"
                                                className={styles.basePriceInput}
                                                placeholder="базовая"
                                                value={basePriceValue(service)}
                                                onChange={e => setBasePrice(service._id, e.target.value)}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allModels.map(model => (
                                    <tr key={model._id}>
                                        <td className={styles.stickyCol}>
                                            <span className={styles.rowBrand}>{model.brandName}</span> {model.name}
                                        </td>
                                        {data.services.map(service => (
                                            <td key={service._id}>
                                                <input
                                                    type="number"
                                                    className={styles.priceInput}
                                                    value={variantPrice(service, model._id)}
                                                    onChange={e => setCell(service._id, model._id, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {allModels.length === 0 && (
                                    <tr><td colSpan={data.services.length + 1} className={styles.empty}>Нет моделей — добавьте бренд и модель выше</td></tr>
                                )}
                            </tbody>
                        </table>
                        {data.services.length === 0 && (
                            <div className={styles.warning}>В категории «{data.category.name}» нет услуг (leaf-элементов) — добавьте их в разделе «Услуги».</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
