'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './TinkoffPayForm.module.css';

const terminalkey = "1709125434432"; // идентификатор магазина

function TinkoffPayForm({ amount, receiptData, onPaymentSuccess }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Проверяем, есть ли уже скрипт
    if (window.pay) {
      setIsScriptLoaded(true);
      return;
    }

    // Загружаем скрипт Tinkoff
    const script = document.createElement('script');
    script.src = 'https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js';
    script.async = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Tinkoff payment script');
    };

    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const calculateTotalAmount = () =>
    receiptData.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!isScriptLoaded) {
      alert('Платежная система загружается. Пожалуйста, подождите.');
      return;
    }

    const payForm = document.getElementById('payform-tinkoff');
    const calculatedAmount = calculateTotalAmount();

    if (calculatedAmount !== parseFloat(amount)) {
      alert("Сумма всех позиций в чеке должна равняться сумме заказа.");
      return;
    }

    if (!email && !phone) {
      alert('Укажите хотя бы email или телефон.');
      return;
    }

    // Формируем чек
    const receipt = {
      Email: email,
      Phone: phone,
      EmailCompany: "your@shop.com",
      Taxation: "patent",
      FfdVersion: "1.2",
      Items: receiptData.map(item => ({
        Name: item.name,
        Price: Math.round(item.price * 100).toString(),
        Quantity: item.quantity,
        Amount: Math.round(item.price * item.quantity * 100).toString(),
        PaymentMethod: "full_prepayment",
        PaymentObject: "commodity",
        Tax: "none",
        MeasurementUnit: "pc"
      }))
    };

    // DATA для личного кабинета
    const dataValue = [
      `ClientName=${encodeURIComponent(name)}`,
      `ClientPhone=${encodeURIComponent(phone)}`,
      `ClientEmail=${encodeURIComponent(email)}`,
      `OrderInfo=${encodeURIComponent(receiptData.map(i => i.name).join(", "))}`,
      `Time=${encodeURIComponent(new Date().toLocaleString("ru"))}`
    ].join('|');

    // Устанавливаем значения в скрытые поля
    const receiptInput = payForm.querySelector('input[name="receipt"]');
    const dataInput = payForm.querySelector('input[name="DATA"]');
    const phoneInput = payForm.querySelector('input[name="Phone"]');

    if (receiptInput) receiptInput.value = JSON.stringify(receipt);
    if (dataInput) dataInput.value = dataValue;
    if (phoneInput) phoneInput.value = phone;

    // Инициируем платеж
    try {
      window.pay(payForm, {
        onSuccess: () => {
          onPaymentSuccess?.();
          // Используем Next.js router для навигации
          router.push('/?paymentSuccess=true');
        },
        onError: (error) => {
          console.error('Payment error:', error);
          alert('Произошла ошибка при оплате. Пожалуйста, попробуйте еще раз.');
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Ошибка инициализации платежа.');
    }
  };

  const orderDescription = receiptData.map(item => item.name).join(", ");

  return (
    <form 
      id="payform-tinkoff" 
      name="payform-tinkoff" 
      onSubmit={handleSubmit}
      className="tinkoff-pay-form"
    >
      <input type="hidden" name="terminalkey" value={terminalkey} />
      <input type="hidden" name="frame" value="true" />
      <input type="hidden" name="language" value="ru" />
      <input type="hidden" name="receipt" value="" />
      <input type="hidden" name="DATA" value="" />
      
      <div className="form-group">
        <label htmlFor="amount">Сумма заказа</label>
        <input 
          type="text" 
          id="amount"
          name="amount" 
          value={amount} 
          readOnly 
          className="form-control"
        />
      </div>

      <input 
        type="hidden" 
        name="order" 
        value={`Order_${Date.now()}`} 
      />
      
      <div className="form-group">
        <label htmlFor="description">Описание заказа</label>
        <input 
          className="form-control form-control__description" 
          type="text" 
          id="description"
          name="description" 
          value={orderDescription} 
          readOnly 
        />
      </div>

      <div className="payform-field-group">
        <div className="form-group">
          <label htmlFor="name">ФИО плательщика *</label>
          <input 
            className="form-control" 
            type="text" 
            id="name"
            name="name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            placeholder="Иванов Иван Иванович"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail *</label>
          <input 
            className="form-control" 
            type="email" 
            id="email"
            name="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="example@mail.ru"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Контактный телефон *</label>
          <input 
            className="form-control" 
            type="tel" 
            id="phone"
            name="Phone" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            required 
            placeholder="+7 (999) 999-99-99"
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={!isScriptLoaded || receiptData.length === 0}
        >
          {isScriptLoaded ? 'Оплатить' : 'Загрузка платежной системы...'}
        </button>
      </div>

      {!isScriptLoaded && (
        <div className="loading-message">
          Подождите, идет загрузка платежной системы...
        </div>
      )}
    </form>
  );
}

export default TinkoffPayForm;