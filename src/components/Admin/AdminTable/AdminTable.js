// components/Admin/AdminTable/AdminTable.js
'use client';
import styles from './AdminTable.module.css';

export default function AdminTable({ columns, data, onEdit, onDelete, onAction }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || onAction) && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row._id || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete || onAction) && (
                <td className={styles.actions}>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className={styles.editBtn}
                    >
                      ✏️ Редактировать
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm('Вы уверены?')) {
                          onDelete(row._id);
                        }
                      }}
                      className={styles.deleteBtn}
                    >
                      🗑️ Удалить
                    </button>
                  )}
                  {onAction && (
                    <button
                      onClick={() => onAction(row)}
                      className={styles.actionBtn}
                    >
                      {onAction.label}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
