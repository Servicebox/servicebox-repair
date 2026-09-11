'use client';

import { useState } from 'react';
import styles from './PriceItemForm.module.css';

const EMPTY = {
  name: '',
  model: '',
  revision: '',
  category: '',
  retailPrice: '',
  purchasePrice: '',
  quantity: '',
  description: '',
};

// Форма добавления/редактирования одной позиции прайса. initial=null — режим
// создания, иначе — редактирование (initial содержит существующую позицию).
export default function PriceItemForm({ initial, categories, onSave, onCancel, saving }) {
  const [values, setValues] = useState(() => (initial ? { ...EMPTY, ...initial } : EMPTY));
  const [error, setError] = useState('');

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;

    const name = values.name.trim();
    const retailPrice = parseFloat(String(values.retailPrice).replace(',', '.'));
    if (!name) {
      setError('Укажите наименование');
      return;
    }
    if (!Number.isFinite(retailPrice) || retailPrice < 0) {
      setError('Укажите корректную розничную цену');
      return;
    }

    const purchasePrice =
      values.purchasePrice === '' || values.purchasePrice === null
        ? null
        : parseFloat(String(values.purchasePrice).replace(',', '.'));
    const quantity = values.quantity === '' ? 0 : parseInt(values.quantity, 10);

    setError('');
    onSave({
      name,
      model: values.model.trim(),
      revision: values.revision.trim(),
      category: values.category.trim(),
      retailPrice,
      purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : null,
      quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
      description: values.description.trim(),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{initial ? 'Редактировать позицию' : 'Новая позиция'}</h2>

      {error && <div className={styles.error} role="alert">{error}</div>}

      <label className={styles.field}>
        <span className={styles.label}>Наименование *</span>
        <input
          className={styles.input}
          value={values.name}
          onChange={set('name')}
          placeholder="Например: Дисплей в сборе"
          autoFocus
          required
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Модель</span>
          <input className={styles.input} value={values.model} onChange={set('model')} placeholder="iPhone 13" />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ревизия</span>
          <input className={styles.input} value={values.revision} onChange={set('revision')} placeholder="Rev. A" />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Категория</span>
        <input
          className={styles.input}
          value={values.category}
          onChange={set('category')}
          placeholder="Телефоны"
          list="price-item-categories"
        />
        <datalist id="price-item-categories">
          {(categories || []).map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Розничная цена, ₽ *</span>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="1"
            value={values.retailPrice}
            onChange={set('retailPrice')}
            placeholder="0"
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>
            Закупка, ₽ <span className={styles.hint}>видна только вам</span>
          </span>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="1"
            value={values.purchasePrice}
            onChange={set('purchasePrice')}
            placeholder="—"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Наличие, шт.</span>
        <input
          className={`${styles.input} ${styles.quantityInput}`}
          type="number"
          min="0"
          step="1"
          value={values.quantity}
          onChange={set('quantity')}
          placeholder="0"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Описание</span>
        <textarea
          className={styles.textarea}
          value={values.description}
          onChange={set('description')}
          rows={3}
          placeholder="Короткое пояснение (необязательно)"
        />
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={saving}>
          Отмена
        </button>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Сохранение…' : initial ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
