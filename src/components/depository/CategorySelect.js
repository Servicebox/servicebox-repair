// components/depository/CategorySelect.jsx
'use client';

import styles from './CategorySelect.module.css';

export default function CategorySelect({ 
  categories, 
  value, 
  onChange, 
  includeAllOption = false,
  placeholder = "Выберите категорию"
}) {
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.select}
    >
      <option value="">
        {placeholder}
      </option>
      
      {includeAllOption && (
        <option value="all">Все категории</option>
      )}
      
      {categories.map(category => (
        <option key={category._id} value={category._id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}