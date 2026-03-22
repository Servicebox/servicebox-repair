// components/GlobalSearch/GlobalSearch.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './GlobalSearch.module.css';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Закрытие поиска при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фокусировка на input при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Загрузка недавних поисков из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Поиск по сайту с автодополнением
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Для автодополнения показываем только первые 5 результатов
        const autocompleteResults = (data.results || []).slice(0, 5);
        setResults(autocompleteResults);
        
        // Сохраняем в недавние поиски (только когда пользователь явно выполняет поиск)
        // А не при каждом вводе буквы
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Оптимизированный поиск с debounce - ТЕПЕРЬ ПОКАЗЫВАЕТ РЕЗУЛЬТАТЫ ПРИ КАЖДОМ ВВОДЕ!
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 200); // Уменьшил время debounce для более быстрого отклика

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Открываем выпадающий список при вводе
    if (value.trim() && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Сохраняем в недавние поиски при явном поиске
      if (!recentSearches.includes(query)) {
        const updated = [query, ...recentSearches.slice(0, 4)];
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
      
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (url, resultTitle) => {
    // Сохраняем в недавние поиски при клике на результат
    if (resultTitle && !recentSearches.includes(resultTitle)) {
      const updated = [resultTitle, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    
    router.push(url);
    setIsOpen(false);
    setQuery('');
  };

  const removeRecentSearch = (searchTerm, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter(item => item !== searchTerm);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Пример популярных поисковых подсказок
  const popularSuggestions = [
    'Замена экрана',
    'Ремонт ноутбука',
    'Чистка от пыли',
    'Восстановление данных',
    'Установка Windows',
    'Ремонт видеокарты',
    'Замена батареи',
    'Ремонт iPhone',
    'Ремонт телевизора',
    'Настройка Wi-Fi'
  ];

  // Фильтруем популярные подсказки по текущему запросу
  const filteredPopularSuggestions = popularSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      {/* Кнопка открытия поиска (для мобильных) */}
      <button
        className={styles.searchToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Открыть поиск"
      >
        
      </button>

      {/* Форма поиска */}
      <form 
        className={`${styles.searchForm} ${isOpen ? styles.searchFormOpen : ''}`}
        onSubmit={handleSubmit}
      >
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Поиск услуг, товаров, статей..."
            className={styles.searchInput}
            aria-label="Поиск по сайту"
            onClick={() => {
              // Открываем список при клике на поле ввода
              if (query || recentSearches.length > 0) {
                setIsOpen(true);
              }
            }}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className={styles.clearButton}
              aria-label="Очистить поиск"
            >
              ✕
            </button>
          )}
          {loading && (
            <div className={styles.loadingIndicator}>
              <span className={styles.spinner}></span>
            </div>
          )}
        </div>

        {/* Выпадающий список с результатами/подсказками */}
        {isOpen && (
          <div className={styles.resultsDropdown}>
            <div className={styles.resultsContainer}>
              {/* Показываем результаты поиска если есть запрос */}
              {query ? (
                <>
                  {/* Результаты из API */}
                  {results.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.resultsHeader}>
                        <span>Найдено в базе:</span>
                      </div>
                      {results.map((item, index) => (
                        <button
                          key={index}
                          className={styles.resultItem}
                          onClick={() => handleResultClick(item.url, item.title)}
                        >
                          <div className={styles.resultContent}>
                            <div className={styles.resultIcon}>
                              {item.type === 'product' ? '🛒' : 
                               item.type === 'service' ? '⚙️' : 
                               item.type === 'news' ? '📰' : '📄'}
                            </div>
                            <div className={styles.resultText}>
                              <div className={styles.resultTitle}>
                                {item.title}
                              </div>
                              {item.description && (
                                <div className={styles.resultDescription}>
                                  {item.description.length > 60 
                                    ? `${item.description.substring(0, 60)}...` 
                                    : item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Популярные подсказки по текущему запросу */}
                  {filteredPopularSuggestions.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.resultsHeader}>
                        <span>Возможно вы ищете:</span>
                      </div>
                      {filteredPopularSuggestions.slice(0, 5).map((suggestion, index) => (
                        <button
                          key={index}
                          className={styles.suggestionItem}
                          onClick={() => {
                            setQuery(suggestion);
                            inputRef.current?.focus();
                          }}
                        >
                          🔍 {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Кнопка полного поиска */}
                  {results.length > 0 && (
                    <div className={styles.fullSearchSection}>
                      <button
                        className={styles.viewAllResults}
                        onClick={handleSubmit}
                      >
                        🔍 Показать все результаты по запросу "{query}"
                      </button>
                    </div>
                  )}

                  {/* Сообщение "Ничего не найдено" */}
                  {!loading && results.length === 0 && filteredPopularSuggestions.length === 0 && query.length >= 2 && (
                    <div className={styles.noResults}>
                      <div className={styles.noResultsIcon}>😕</div>
                      <div className={styles.noResultsText}>
                        <p>По запросу "{query}" ничего не найдено</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Показываем историю и популярные запросы если нет текущего запроса */
                <>
                  {/* Недавние поиски */}
                  {recentSearches.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.resultsHeader}>
                        <span>Недавние поиски</span>
                        <button 
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem('recentSearches');
                          }}
                          className={styles.clearAllButton}
                        >
                          Очистить все
                        </button>
                      </div>
                      {recentSearches.map((searchTerm, index) => (
                        <button
                          key={index}
                          className={styles.recentSearchItem}
                          onClick={() => {
                            setQuery(searchTerm);
                            inputRef.current?.focus();
                            // Запускаем поиск сразу
                            performSearch(searchTerm);
                          }}
                        >
                          <span className={styles.recentIcon}>🕒</span>
                          <span className={styles.recentText}>{searchTerm}</span>
                          <button
                          type='submit'
                            onClick={(e) => removeRecentSearch(searchTerm, e)}
                            className={styles.removeRecentButton}
                            aria-label="Удалить из истории"
                          >
                            ✕
                          </button>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Популярные запросы */}
                  <div className={styles.section}>
                    <div className={styles.resultsHeader}>
                      <span>Популярные запросы</span>
                    </div>
                    <div className={styles.popularTags}>
                      {popularSuggestions.slice(0, 8).map((tag, index) => (
                        <button
                          key={index}
                          className={styles.popularTag}
                          onClick={() => {
                            setQuery(tag);
                            inputRef.current?.focus();
                            // Запускаем поиск сразу
                            setTimeout(() => performSearch(tag), 100);
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Оверлей для мобильных */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </div>
  );
}