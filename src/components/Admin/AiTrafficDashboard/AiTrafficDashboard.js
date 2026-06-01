// components/Admin/AiTrafficDashboard/AiTrafficDashboard.js
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './AiTrafficDashboard.module.css';

const API_ENDPOINT = '/api/analytics/ai-traffic';

const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const diff = new Date() - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (Math.floor(minutes / 60) < 24) return `${Math.floor(minutes / 60)} ч. назад`;
    return `${Math.floor(minutes / 1440)} дн. назад`;
};

const BOT_ICONS = {
    'Google-Extended': '🔍', 'GPTBot': '🤖', 'CCBot': '🕷️',
    'YandexAccessibilityBot': '🦊', 'BingPreview': '🔷',
    'Applebot-Extended': '🍎', 'PerplexityBot': '💬',
    'ClaudeBot': '🧠', 'unknown': '❓'
};
const getBotIcon = (name) => BOT_ICONS[name] || BOT_ICONS['unknown'];
const isArray = (val) => Array.isArray(val) && val.length > 0;

export default function AiTrafficDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [botStats, setBotStats] = useState([]);
    const [recentVisits, setRecentVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('7d');
    const [selectedBot, setSelectedBot] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.role !== 'admin') {
            setError('Доступ только для администраторов');
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();
                if (dateRange !== 'all') {
                    const days = parseInt(dateRange, 10);
                    if (!isNaN(days)) {
                        params.set('startDate', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
                    }
                }
                if (selectedBot && selectedBot !== 'all') params.set('bot', selectedBot);

                const response = await fetch(`${API_ENDPOINT}?${params}`, {
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' },
                    cache: 'no-store'
                });

                if (response.status === 401) throw new Error('Необходима авторизация');
                if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    throw new Error(`Ошибка ${response.status}: ${text || response.statusText}`);
                }

                const data = await response.json();
                if (!isMounted) return;

                if (data?.success) {
                    setBotStats(Array.isArray(data.data) ? data.data : []);
                    setRecentVisits(Array.isArray(data.recent) ? data.recent : []);
                } else {
                    throw new Error(data?.error || 'Ошибка сервера');
                }
            } catch (err) {
                if (!isMounted) return;
                console.error('Error:', err);
                setError(err.message || 'Ошибка загрузки');
                setBotStats([]);
                setRecentVisits([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [dateRange, selectedBot, refreshKey, authLoading, user]);

    const metrics = useMemo(() => {
        if (!isArray(botStats)) return { total: 0, uniqueBots: 0, topBot: '—', topBotCount: 0 };
        const total = botStats.reduce((s, i) => s + ((i?.count || i?.total || 0)), 0);
        const uniqueBots = new Set(botStats.map(x => x?._id || x?.bot).filter(Boolean)).size;
        const sorted = [...botStats].sort((a, b) => (b?.count || b?.total || 0) - (a?.count || a?.total || 0));
        return {
            total,
            uniqueBots,
            topBot: sorted[0]?._id || sorted[0]?.bot || '—',
            topBotCount: sorted[0]?.count || sorted[0]?.total || 0
        };
    }, [botStats]);

    const handleExport = useCallback(async () => {
        try {
            const params = new URLSearchParams({ format: 'csv' });
            if (dateRange !== 'all') {
                const days = parseInt(dateRange, 10);
                if (!isNaN(days)) params.set('startDate', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
            }
            if (selectedBot && selectedBot !== 'all') params.set('bot', selectedBot);

            const res = await fetch(`/api/analytics/ai-traffic/export?${params}`, {
                credentials: 'include',
                headers: { 'Accept': 'text/csv' }
            });
            if (res.status === 401) throw new Error('Требуется авторизация');
            if (!res.ok) throw new Error(`Ошибка ${res.status}`);

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-traffic-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Экспорт не удался: ' + err.message);
        }
    }, [dateRange, selectedBot]);

    if (authLoading || (loading && !botStats.length)) {
        return <div className={styles.loadingContainer}><div className={styles.spinner}></div><p>Загрузка...</p></div>;
    }
    if (error) {
        return <div className={styles.errorContainer}><div className={styles.errorIcon}>⚠️</div><h3>Ошибка</h3><p>{error}</p><button onClick={() => { setError(null); setRefreshKey(k => k + 1); }} className={styles.retryButton}>Повторить</button></div>;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1>🤖 Статистика ИИ-ботов</h1>
                <button onClick={() => setRefreshKey(k => k + 1)} className={styles.refreshButton}>🔄 Обновить</button>
            </div>
            <div className={styles.filters}>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)} className={styles.select}>
                    <option value="7d">7 дней</option><option value="30d">30 дней</option><option value="90d">90 дней</option><option value="all">Всё время</option>
                </select>
                <select value={selectedBot} onChange={e => setSelectedBot(e.target.value)} className={styles.select}>
                    <option value="all">Все боты</option>
                    {isArray(botStats) && botStats.map(s => { const n = s?._id || s?.bot; return n ? <option key={n} value={n}>{getBotIcon(n)} {n}</option> : null; })}
                </select>
                <button onClick={handleExport} className={styles.exportButton}>📥 CSV</button>
            </div>
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}><div className={styles.metricValue}>{metrics.total.toLocaleString('ru-RU')}</div><div className={styles.metricLabel}>Всего</div></div>
                <div className={styles.metricCard}><div className={styles.metricValue}>{metrics.uniqueBots}</div><div className={styles.metricLabel}>Ботов</div></div>
                <div className={styles.metricCard}><div className={styles.metricValue}>{getBotIcon(metrics.topBot)} {metrics.topBot}</div><div className={styles.metricLabel}>Топ ({metrics.topBotCount})</div></div>
                <div className={styles.metricCard}><div className={styles.metricValue}>{isArray(recentVisits) && recentVisits[0]?.timestamp ? formatRelativeTime(recentVisits[0].timestamp) : '—'}</div><div className={styles.metricLabel}>Последний</div></div>
            </div>
            <div className={styles.section}>
                <h2>По ботам</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead><tr><th>Бот</th><th>Визитов</th><th>Страниц</th><th>Первый</th><th>Последний</th></tr></thead>
                        <tbody>
                            {isArray(botStats) ? botStats.map((s, i) => {
                                const name = s?._id || s?.bot || `x-${i}`;
                                return <tr key={name}><td>{getBotIcon(name)} {name}</td><td>{(s?.count || s?.total || 0).toLocaleString('ru-RU')}</td><td>{(s?.pages?.length) || '—'}</td><td>{formatDate(s?.firstSeen)}</td><td>{formatDate(s?.lastSeen)}</td></tr>;
                            }) : <tr><td colSpan="5" className={styles.emptyRow}>Нет данных</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={styles.section}>
                <h2>Последние визиты</h2>
                <div className={styles.visitsList}>
                    {isArray(recentVisits) ? recentVisits.slice(0, 20).map((v, i) => (
                        <div key={v?._id || i} className={styles.visitItem}>
                            <div className={styles.visitHeader}><span>{getBotIcon(v?.bot)} {v?.bot}</span><span title={formatDate(v?.timestamp)}>{formatRelativeTime(v?.timestamp)}</span></div>
                            <div className={styles.visitDetails}><span className={styles.visitPage}>{v?.page || '—'}</span>{v?.query && <span>«{v.query}»</span>}</div>
                        </div>
                    )) : <p className={styles.emptyRow}>Нет визитов</p>}
                </div>
            </div>
        </div>
    );
}