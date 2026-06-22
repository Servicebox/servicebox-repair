'use client';
import { useState, useEffect } from 'react';
import styles from '../AdminPanel.module.css';

const PROVIDER_LABELS = {
  tinkoff:      { name: 'Тинькофф',      desc: 'Оплата картой через Тинькофф Касса', icon: '💳' },
  yandex_split: { name: 'Яндекс Сплит', desc: 'Оплата долями через Яндекс Pay Split', icon: '🔀' },
};

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: 48, height: 26, borderRadius: 999,
        background: checked ? '#2563eb' : '#cbd5e1',
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        transition: 'background .2s', padding: 0, flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        left: checked ? 24 : 2,
        width: 22, height: 22, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        transition: 'left .2s',
      }} />
    </button>
  );
}

export default function AdminPaymentsPage() {
  const [configs, setConfigs]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState('');
  const [message, setMessage]   = useState('');

  useEffect(() => {
    fetch('/api/admin/payments', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setConfigs(data.configs ?? []))
      .catch(() => setMessage('Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (provider, newValue) => {
    setSaving(provider);
    setMessage('');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider, isActive: newValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConfigs(prev => prev.map(c =>
        c.provider === provider ? { ...c, isActive: newValue } : c
      ));
      setMessage(`${PROVIDER_LABELS[provider]?.name ?? provider}: ${newValue ? 'включён' : 'выключен'}`);
    } catch (err) {
      setMessage(err.message || 'Ошибка сохранения');
    } finally {
      setSaving('');
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Настройки оплаты</h1>
      <p style={{ color: '#64748b', fontSize: '.875rem', marginBottom: '1.5rem' }}>
        Включайте/выключайте платёжные провайдеры. API-ключи хранятся только в переменных окружения.
      </p>

      {message && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: '1rem', fontSize: '.875rem',
          background: message.includes('Ошибка') ? '#fff5f5' : '#f0fdf4',
          color:      message.includes('Ошибка') ? '#dc2626'  : '#16a34a',
          border: `1.5px solid ${message.includes('Ошибка') ? '#fca5a5' : '#86efac'}`,
        }} role="status">
          {message}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Загрузка…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['tinkoff', 'yandex_split'].map(provider => {
            const cfg   = configs.find(c => c.provider === provider);
            const info  = PROVIDER_LABELS[provider];
            const active = cfg?.isActive ?? false;

            return (
              <div key={provider} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '1.25rem', background: '#fff',
                border: `1.5px solid ${active ? '#bfdbfe' : '#e2e8f0'}`,
                borderRadius: 14, transition: 'border-color .2s',
              }}>
                <span style={{ fontSize: '1.75rem' }}>{info.icon}</span>

                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{info.name}</p>
                  <p style={{ fontSize: '.8rem', color: '#64748b' }}>{info.desc}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 4,
                    padding: '2px 10px', borderRadius: 999, fontSize: '.72rem', fontWeight: 600,
                    background: active ? '#dbeafe' : '#f1f5f9',
                    color:      active ? '#1d4ed8' : '#94a3b8',
                  }}>
                    {active ? 'Активен' : 'Выключен'}
                  </span>
                </div>

                <ToggleSwitch
                  checked={active}
                  onChange={val => handleToggle(provider, val)}
                  disabled={saving === provider}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Инфо-блок */}
      <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: 12 }}>
        <p style={{ fontWeight: 600, color: '#92400e', fontSize: '.875rem', marginBottom: 4 }}>⚠️ Важно</p>
        <ul style={{ fontSize: '.8rem', color: '#78350f', lineHeight: 1.7, paddingLeft: '1.2rem' }}>
          <li>API-ключи провайдеров хранятся только в <code>.env</code> на сервере</li>
          <li>При включении Яндекс Сплит убедитесь, что <code>YANDEX_SPLIT_API_URL</code> и <code>YANDEX_SPLIT_API_KEY</code> заданы в <code>.env</code></li>
          <li>Webhook URL для Яндекс Сплит: <code>/api/payments/split/webhook</code></li>
          <li>Подпись webhook: <code>YANDEX_SPLIT_WEBHOOK_SECRET</code> (опционально, без него подпись не проверяется)</li>
        </ul>
      </div>
    </div>
  );
}
