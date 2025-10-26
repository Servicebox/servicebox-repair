'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './ShopCategory.module.css';
import Item from '../Item/Item';

const API_URL = ''; 

const ShopCategory = () => {
  const [categories, setCategories] = useState([]);
  const [openedCat, setOpenedCat] = useState(null);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState('');
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest'); 
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const [catsResponse, prodsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/categories-with-subcategories`),
          axios.get(`${API_URL}/api/allproducts`),
        ]);
        
        if (!ignore) {
          setCategories(catsResponse.data);
          
          const productsData = prodsResponse.data;
          let productsArray = [];
          
          if (productsData.success && Array.isArray(productsData.products)) {
            productsArray = productsData.products;
          } else if (Array.isArray(productsData)) {
            productsArray = productsData;
          }
          
          setProducts(productsArray);
          setAllProducts(productsArray);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => { ignore = true };
  }, []);

  const handleClearFilter = useCallback(() => {
    setSelectedCat('');
    setSelectedSubcat('');
    setSearch('');
    setCurrentPage(1);
    setSortBy('newest');
  }, []);

  const processedProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (selectedCat) {
      filtered = filtered.filter(p => p.category === selectedCat);
    }
    if (selectedSubcat) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcat);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(p =>
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q) ||
        (p.subcategory ?? '').toLowerCase().includes(q)
      );
    }
    
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.new_price || 0) - (b.new_price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.new_price || 0) - (a.new_price || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [search, selectedCat, selectedSubcat, allProducts, sortBy]);

  useEffect(() => {
    setProducts(processedProducts);
    setCurrentPage(1);
  }, [processedProducts]);

  const handleCatClick = useCallback((cat) => {
    setOpenedCat(openedCat === cat ? null : cat);
    setSelectedCat(cat);
    setSelectedSubcat('');
    setSearch('');
  }, [openedCat]);

  const handleSubcatClick = useCallback((cat, subcat) => {
    setSelectedCat(cat);
    setSelectedSubcat(subcat);
    setSearch('');
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => {
    return products.slice(indexOfFirstItem, indexOfLastItem);
  }, [products, indexOfFirstItem, indexOfLastItem]);
  
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const newArrivals = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [allProducts]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(12);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "numberOfItems": products.length,
          "itemListElement": currentItems.map((product, index) => ({
            "@type": "ListItem",
            "position": indexOfFirstItem + index + 1,
            "item": {
              "@type": "Product",
              "name": product.name,
              "description": product.description,
              "category": product.category
            }
          }))
        }) }}
      />

      <main className={styles.shopcategory} itemScope itemType="https://schema.org/ItemList">
        {showMobileFilters && (
          <div className={styles.shopcategoryMobileFiltersOverlay}>
            <div className={styles.shopcategoryMobileFiltersContent}>
              <div className={styles.shopcategoryMobileFiltersHeader}>
                <h2>Фильтры</h2>
                <button 
                  className={styles.shopcategoryMobileFiltersClose}
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Закрыть фильтры"
                >
                  ×
                </button>
              </div>
              <nav className={styles.shopcategorySidebar} role="navigation" aria-label="Навигация по категориям">
                <h3 className={styles.shopcategorySidebarTitle}>Категории товаров</h3>
                <ul className={styles.shopcategoryMenu}>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        handleClearFilter();
                        setShowMobileFilters(false);
                      }}
                      className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnCategory} ${(!selectedCat && !selectedSubcat ? styles.shopcategoryBtnActive : '')}`}
                      aria-current={!selectedCat && !selectedSubcat ? "page" : undefined}
                    >
                      Все товары
                    </button>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.category} className={styles.shopcategoryCategoryItem}>
                      <button
                        type="button"
                        className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnCategory} ${selectedCat === cat.category && !selectedSubcat ? styles.shopcategoryBtnActive : ''}`}
                        onClick={() => {
                          handleCatClick(cat.category);
                          setShowMobileFilters(false);
                        }}
                        aria-expanded={openedCat === cat.category}
                        aria-controls={`submenu-${cat.category}`}
                      >
                        <span className={styles.shopcategoryCategoryName}>{cat.category}</span>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <span 
                            className={`${styles.shopcategoryArrow} ${openedCat === cat.category ? styles.shopcategoryArrowOpen : ''}`}
                            aria-hidden="true"
                          >
                            ▼
                          </span>
                        )}
                      </button>
                      {cat.subcategories && cat.subcategories.length > 0 && openedCat === cat.category && (
                        <ul 
                          id={`submenu-${cat.category}`}
                          className={styles.shopcategorySubmenu}
                          role="group"
                          aria-label={`Подкатегории ${cat.category}`}
                        >
                          <li>
                            <button
                              type="button"
                              className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnSubcategory} ${selectedCat === cat.category && !selectedSubcat ? styles.shopcategoryBtnActive : ''}`}
                              onClick={() => {
                                handleCatClick(cat.category);
                                setShowMobileFilters(false);
                              }}
                            >
                              Все подкатегории
                            </button>
                          </li>
                          {cat.subcategories.map(sub => (
                            <li key={`${cat.category}-${sub}`}>
                              <button
                                type="button"
                                className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnSubcategory} ${selectedCat === cat.category && selectedSubcat === sub ? styles.shopcategoryBtnActive : ''}`}
                                onClick={() => {
                                  handleSubcatClick(cat.category, sub);
                                  setShowMobileFilters(false);
                                }}
                              >
                                {sub}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        <nav className={styles.shopcategorySidebar} role="navigation" aria-label="Навигация по категориям">
          <h2 className={styles.shopcategorySidebarTitle}>Категории товаров</h2>
          <ul className={styles.shopcategoryMenu}>
            <li>
              <button
                type="button"
                onClick={handleClearFilter}
                className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnCategory} ${(!selectedCat && !selectedSubcat ? styles.shopcategoryBtnActive : '')}`}
                aria-current={!selectedCat && !selectedSubcat ? "page" : undefined}
              >
                Все товары
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.category} className={styles.shopcategoryCategoryItem}>
                <button
                  type="button"
                  className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnCategory} ${selectedCat === cat.category && !selectedSubcat ? styles.shopcategoryBtnActive : ''}`}
                  onClick={() => handleCatClick(cat.category)}
                  aria-expanded={openedCat === cat.category}
                  aria-controls={`submenu-${cat.category}`}
                >
                  <span className={styles.shopcategoryCategoryName}>{cat.category}</span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <span 
                      className={`${styles.shopcategoryArrow} ${openedCat === cat.category ? styles.shopcategoryArrowOpen : ''}`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  )}
                </button>
                {cat.subcategories && cat.subcategories.length > 0 && openedCat === cat.category && (
                  <ul 
                    id={`submenu-${cat.category}`}
                    className={styles.shopcategorySubmenu}
                    role="group"
                    aria-label={`Подкатегории ${cat.category}`}
                  >
                    <li>
                      <button
                        type="button"
                        className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnSubcategory} ${selectedCat === cat.category && !selectedSubcat ? styles.shopcategoryBtnActive : ''}`}
                        onClick={() => handleCatClick(cat.category)}
                      >
                        Все подкатегории
                      </button>
                    </li>
                    {cat.subcategories.map(sub => (
                      <li key={`${cat.category}-${sub}`}>
                        <button
                          type="button"
                          className={`${styles.shopcategoryBtn} ${styles.shopcategoryBtnSubcategory} ${selectedCat === cat.category && selectedSubcat === sub ? styles.shopcategoryBtnActive : ''}`}
                          onClick={() => handleSubcatClick(cat.category, sub)}
                        >
                          {sub}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.shopcategoryContent}>
          <header className={styles.shopcategoryHeader}>
            <div className={styles.shopcategoryHeaderTop}>
              <h1 className={styles.shopcategoryTitle} itemProp="name">
                {selectedCat 
                  ? `${selectedCat}${selectedSubcat ? ` / ${selectedSubcat}` : ''}` 
                  : 'Каталог товаров'}
              </h1>
              
              <button 
                className={styles.shopcategoryMobileFiltersBtn}
                onClick={() => setShowMobileFilters(true)}
                aria-label="Открыть фильтры"
              >
                Фильтры
              </button>
            </div>
            
            <div className={styles.shopcategoryControls}>
              <div className={styles.shopcategorySearchContainer}>
                <div className={styles.shopcategorySearchWrapper}>
                  <label htmlFor="product-search" className={styles.visuallyHidden}>
                    Поиск по товарам
                  </label>
                  <input
                    id="product-search"
                    type="search"
                    placeholder="Поиск по товарам..."
                    className={styles.shopcategorySearchInput}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {search && (
                    <button 
                      className={styles.shopcategorySearchClear}
                      onClick={() => setSearch('')}
                      aria-label="Очистить поиск"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.shopcategoryToolbar}>
                <div className={styles.shopcategoryResultsInfo}>
                  Найдено: <strong>{products.length}</strong> товаров
                </div>
                
                <div className={styles.shopcategoryViewControls}>
                  <label htmlFor="sort-select" className={styles.visuallyHidden}>
                    Сортировать по
                  </label>
                  <select
                    id="sort-select"
                    className={styles.shopcategorySortSelect}
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="newest">Сначала новые</option>
                    <option value="price-low">Цена: по возрастанию</option>
                    <option value="price-high">Цена: по убыванию</option>
                  </select>
                  
                  <div className={styles.shopcategoryViewMode}>
                    <button
                      className={`${styles.shopcategoryViewBtn} ${viewMode === 'grid' ? styles.shopcategoryViewBtnActive : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Сетка"
                    >
                      🟦
                    </button>
                    <button
                      className={`${styles.shopcategoryViewBtn} ${viewMode === 'list' ? styles.shopcategoryViewBtnActive : ''}`}
                      onClick={() => setViewMode('list')}
                      aria-label="Список"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {!selectedCat && !selectedSubcat && !search && (
            <section className={styles.shopcategoryNewArrivals}>
              <h2 className={styles.shopcategorySectionTitle}>Новинки</h2>
              <div className={styles.shopcategoryNewArrivalsGrid}>
                {newArrivals.map((product, index) => (
                  <div key={product.slug || product._id} className={styles.shopcategoryNewArrivalItem}>
                    <Item 
                      id={product.slug}
                      slug={product.slug}
                      name={product.name}
                      images={product.images}
                      new_price={product.new_price}
                      old_price={product.old_price}
                      description={product.description}
                      quantity={product.quantity}
                      category={product.category}
                      subcategory={product.subcategory}
                      position={index + 1}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {loading ? (
            <div className={styles.shopcategoryLoading} role="status">
              <span className={styles.shopcategoryLoadingText}>Загрузка товаров...</span>
            </div>
          ) : !products.length ? (
            <div className={styles.shopcategoryEmpty}>
              <p><strong>Товары не найдены.</strong></p>
              <button 
                className={styles.shopcategoryResetBtn}
                onClick={handleClearFilter}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div 
                className={`${styles.shopcategoryGrid} ${viewMode === 'grid' ? styles.shopcategoryGridGrid : styles.shopcategoryGridList}`}
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {currentItems.map((product, index) => (
                  <div 
                    key={product.slug || product._id}
                    className={styles.shopcategoryGridItem}
                  >
                    <Item 
                      id={product.slug}
                      slug={product.slug}
                      name={product.name}
                      images={product.images}
                      new_price={product.new_price}
                      old_price={product.old_price}
                      description={product.description}
                      quantity={product.quantity}
                      category={product.category}
                      subcategory={product.subcategory}
                      position={indexOfFirstItem + index + 1}
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <nav 
                  className={styles.shopcategoryPagination}
                  role="navigation"
                  aria-label="Навигация по страницам"
                >
                  <ul className={styles.shopcategoryPaginationList}>
                    <li>
                      <button
                        className={styles.shopcategoryPaginationBtn}
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        aria-label="Предыдущая страница"
                      >
                        ‹
                      </button>
                    </li>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <li key={page}>
                          <button
                            className={`${styles.shopcategoryPaginationBtn} ${currentPage === page ? styles.shopcategoryPaginationBtnActive : ''}`}
                            onClick={() => paginate(page)}
                            aria-current={currentPage === page ? "page" : undefined}
                            aria-label={`Страница ${page}`}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <li className={styles.shopcategoryPaginationEllipsis}>…</li>
                        <li>
                          <button
                            className={`${styles.shopcategoryPaginationBtn} ${currentPage === totalPages ? styles.shopcategoryPaginationBtnActive : ''}`}
                            onClick={() => paginate(totalPages)}
                            aria-current={currentPage === totalPages ? "page" : undefined}
                            aria-label={`Страница ${totalPages}`}
                          >
                            {totalPages}
                          </button>
                        </li>
                      </>
                    )}
                    
                    <li>
                      <button
                        className={styles.shopcategoryPaginationBtn}
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Следующая страница"
                      >
                        ›
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default ShopCategory;