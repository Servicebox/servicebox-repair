// components/Admin/UsersManagement/UsersManagement.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import styles from './UsersManagement.module.css';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: 'user',
    phone: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { user: currentUser } = useAuth();

  // Загрузка пользователей
// В компоненте UsersManagement обновите fetchUsers:
const fetchUsers = async (page = 1, search = '') => {
  try {
    setLoading(true);
    setError('');

    console.log('🔄 === CLIENT: Starting fetchUsers ===');
    console.log('📋 Current user:', currentUser);
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search })
    });

    const apiUrl = `${window.location.origin}/api/users?${params}`;
    console.log('🌐 Making request to:', apiUrl);

    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const endTime = Date.now();
    console.log('⏱️ Request took:', endTime - startTime, 'ms');
    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Data received:', data);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(data.pagination?.currentPage || 1);
    } else {
      console.log('❌ Error response received');
      
      let errorMessage = 'Ошибка при загрузке пользователей';
      let errorDetails = '';
      
      try {
        const errorText = await response.text();
        console.log('📄 Raw error response:', errorText);
        
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
            errorDetails = JSON.stringify(errorData, null, 2);
          } catch (e) {
            errorMessage = errorText || `HTTP Error: ${response.status}`;
          }
        } else {
          errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        }
      } catch (parseError) {
        console.error('📄 Error parsing response:', parseError);
        errorMessage = `Network Error: ${parseError.message}`;
      }
      
      console.log('🚫 Final error message:', errorMessage);
      if (errorDetails) {
        console.log('📋 Error details:', errorDetails);
      }
      
      setError(errorMessage);
    }
  } catch (err) {
    console.error('💥 Fetch users network error:', err);
    setError('Ошибка сети при загрузке пользователей: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    console.log('🎯 === CLIENT: useEffect triggered ===', { 
      currentUser, 
      hasUser: !!currentUser,
      userRole: currentUser?.role 
    });
    
    if (currentUser?.role === 'admin') {
      console.log('✅ User is admin, fetching users...');
      fetchUsers();
    } else if (currentUser) {
      console.log('❌ User is not admin:', currentUser.role);
      setError('У вас нет прав администратора');
      setLoading(false);
    } else {
      console.log('⏳ User not loaded yet...');
    }
  }, [currentUser]);


  // Поиск пользователей
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  // Начать редактирование пользователя
  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
      phone: user.phone || ''
    });
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      username: '',
      email: '',
      role: 'user',
      phone: ''
    });
  };

  // Сохранить изменения
  const saveUser = async (userId) => {
    try {
      setError('');
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Пользователь успешно обновлен');
        setEditingUser(null);
        fetchUsers(currentPage, searchTerm);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при обновлении пользователя');
      }
    } catch (err) {
      console.error('Save user error:', err);
      setError('Ошибка сети при обновлении пользователя');
    }
  };

  // Удалить пользователя
  const deleteUser = async (userId, userEmail) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userEmail}?`)) {
      return;
    }

    try {
      setError('');
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Пользователь успешно удален');
        fetchUsers(currentPage, searchTerm);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при удалении пользователя');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setError('Ошибка сети при удалении пользователя');
    }
  };

  // Изменить роль пользователя
  const changeRole = async (userId, newRole, currentEmail) => {
    if (!confirm(`Вы уверены, что хотите ${newRole === 'admin' ? 'назначить администратором' : 'снять права администратора'} пользователя ${currentEmail}?`)) {
      return;
    }

    try {
      setError('');
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Роль пользователя успешно изменена');
        fetchUsers(currentPage, searchTerm);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Ошибка при изменении роли');
      }
    } catch (err) {
      console.error('Change role error:', err);
      setError('Ошибка сети при изменении роли');
    }
  };

  // Обработчик изменения формы
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          У вас нет доступа к этой странице
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Управление пользователями</h1>
        <p>Всего пользователей: {users.length}</p>
      </div>

      {/* Поиск */}
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Поиск по имени, email или телефону..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Поиск
          </button>
          {searchTerm && (
            <button 
              type="button" 
              onClick={() => {
                setSearchTerm('');
                fetchUsers(1, '');
              }}
              className={styles.clearButton}
            >
              Сбросить
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={() => setError('')} className={styles.closeButton}>×</button>
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className={styles.closeButton}>×</button>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={styles.userRow}>
                {editingUser === user._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleEditChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        className={styles.select}
                      >
                        <option value="user">Пользователь</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </td>
                    <td>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Не указана'}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => saveUser(user._id)}
                          className={styles.saveButton}
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={cancelEdit}
                          className={styles.cancelButton}
                        >
                          Отмена
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.username || 'Не указано'}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'Не указан'}</td>
                    <td>
                      <span className={`${styles.role} ${styles[user.role]}`}>
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </td>
                    <td>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Не указана'}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => startEdit(user)}
                          className={styles.editButton}
                        >
                          Редактировать
                        </button>
                        
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => changeRole(user._id, 'admin', user.email)}
                            className={styles.promoteButton}
                          >
                            Сделать админом
                          </button>
                        )}
                        
                        {user.role === 'admin' && user._id !== currentUser.id && (
                          <button
                            onClick={() => changeRole(user._id, 'user', user.email)}
                            className={styles.demoteButton}
                          >
                            Убрать админку
                          </button>
                        )}
                        
                        {user._id !== currentUser.id && (
                          <button
                            onClick={() => deleteUser(user._id, user.email)}
                            className={styles.deleteButton}
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className={styles.empty}>
            <p>{searchTerm ? 'Пользователи по вашему запросу не найдены' : 'Пользователи не найдены'}</p>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => fetchUsers(currentPage - 1, searchTerm)}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              Назад
            </button>
            
            <span className={styles.pageInfo}>
              Страница {currentPage} из {totalPages}
            </span>
            
            <button
              onClick={() => fetchUsers(currentPage + 1, searchTerm)}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              Вперед
            </button>
          </div>
        )}
      </div>
    </div>
  );
}