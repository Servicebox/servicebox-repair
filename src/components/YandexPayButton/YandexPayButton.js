'use client';
import { useEffect, useRef } from 'react';

const SDK_URL = 'https://pay.yandex.ru/sdk/v1/pay.js';
const MERCHANT_ID = process.env.NEXT_PUBLIC_YANDEX_PAY_MERCHANT_ID ?? '40bd417c-f176-4293-9d70-f40237b5f2f2';

/**
 * Кнопка Яндекс Пэй через официальный WebSDK (версия 4).
 * Поддерживает оплату картой и долями (CARD + SPLIT).
 *
 * Props:
 *   items      — массив { productId, name, price, quantity, image?, slug? }
 *   customer   — { name, email, phone? }
 *   totalAmount — итоговая сумма в рублях
 *   className  — css-класс для контейнера кнопки
 *   onError    — callback(message) при ошибке
 */
export default function YandexPayButton({ items, customer, totalAmount, className = '', onError }) {
  const containerRef = useRef(null);
  const sessionRef   = useRef(null);

  // Храним актуальные данные в refs — они доступны в замыкании onPayButtonClick без пересоздания сессии
  const itemsRef    = useRef(items);
  const customerRef = useRef(customer);
  const totalRef    = useRef(totalAmount);

  useEffect(() => {
    itemsRef.current    = items;
    customerRef.current = customer;
    totalRef.current    = totalAmount;
  });

  useEffect(() => {
    let mounted = true;

    const init = () => {
      const YaPay = window.YaPay;
      if (!YaPay || !containerRef.current || !mounted) return;

      const paymentData = {
        env: YaPay.PaymentEnv.Production,
        version: 4,
        currencyCode: YaPay.CurrencyCode.Rub,
        merchantId: MERCHANT_ID,
        totalAmount: String(totalRef.current.toFixed(2)),
        availablePaymentMethods: ['CARD', 'SPLIT'],
      };

      YaPay.createSession(paymentData, {
        onPayButtonClick: async () => {
          const res = await fetch('/api/yandex-pay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              items:       itemsRef.current,
              customer:    customerRef.current,
              totalAmount: totalRef.current,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            onError?.(data.error ?? 'Ошибка создания платежа');
            // Бросаем ошибку чтобы Yandex Pay SDK знал об отказе
            throw new Error(data.error ?? 'create-order failed');
          }

          return data.paymentUrl;
        },

        onFormOpenError: (reason) => {
          console.error('YaPay form open error:', reason);
          onError?.('Не удалось открыть форму оплаты. Попробуйте ещё раз.');
        },
      })
        .then((session) => {
          if (!mounted || !containerRef.current) return;
          sessionRef.current = session;
          session.mountButton(containerRef.current, {
            type:  YaPay.ButtonType.Pay,
            theme: YaPay.ButtonTheme.Black,
            width: YaPay.ButtonWidth.Max,
          });
        })
        .catch((err) => {
          console.error('YaPay session error:', err);
        });
    };

    // Если SDK уже загружен другим экземпляром компонента — используем сразу
    if (window.YaPay) {
      init();
      return () => { mounted = false; };
    }

    // Если скрипт уже добавлен в DOM — ждём события load
    const existing = document.querySelector(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', init);
      return () => {
        mounted = false;
        existing.removeEventListener('load', init);
      };
    }

    // Загружаем SDK
    const script = document.createElement('script');
    script.src   = SDK_URL;
    script.async = true;
    script.onload = init;
    document.body.appendChild(script);

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — инициализация только при монтировании

  return <div ref={containerRef} className={className} />;
}
