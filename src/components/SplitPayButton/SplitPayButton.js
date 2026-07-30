'use client';
import { useState } from 'react';

/**
 * items: Array<{ productId, name, price, quantity, image?, slug? }>
 * customer: { name, email, phone }
 * bonusPoints?: number — сколько бонусов списать как скидку (лимит проверяется на сервере)
 * onError?: (msg: string) => void
 */
export default function SplitPayButton({ items, customer, bonusPoints = 0, className = '', onError }) {
  const [loading, setLoading] = useState(false);

  if (process.env.NEXT_PUBLIC_SPLIT_ENABLED !== 'true') return null;

  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
  // Минимальный порог Яндекс Сплит — 3 000 ₽
  if (totalAmount < 3000) return null;

  const handleClick = async () => {
    if (loading) return;

    const phoneDigits = (customer.phone ?? '').replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      onError?.('Для оплаты долями укажите номер телефона в форме выше');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments/split/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items,
          customerName:  customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          bonusPoints,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError?.(data.error ?? 'Ошибка создания платежа');
        return;
      }

      // Редирект на страницу оплаты Яндекс Сплит
      window.location.href = data.paymentUrl;
    } catch {
      onError?.('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const plans = process.env.NEXT_PUBLIC_SPLIT_PLANS?.split(',') ?? ['2', '4', '6'];
  const partAmount = Math.ceil((totalAmount - bonusPoints) / Number(plans[0]));

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex flex-col items-center justify-center gap-0.5 w-full py-3 px-4 rounded-xl bg-[#FC3F1D] hover:bg-[#e0381a] disabled:opacity-60 text-white transition-colors ${className}`}
    >
      {loading ? (
        <span className="text-sm font-medium">Подготовка платежа…</span>
      ) : (
        <>
          <span className="text-sm font-semibold">Оплатить долями</span>
          <span className="text-xs opacity-85">
            от {partAmount.toLocaleString('ru-RU')} ₽ × {plans[0]} платежа — Яндекс Сплит
          </span>
        </>
      )}
    </button>
  );
}
