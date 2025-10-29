'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../AdminPanel.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// SVG placeholder как data URL
const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><rect fill='%23F1F1F1' width='400' height='400'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%23b3b3b3'>Нет фото</text></svg>";

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  subcategory: "",
  old_price: "",
  new_price: "",
  quantity: "",
  images: []
};

// Функция для генерации slug
const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function ListProduct() {
  const [allproducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSubcategories, setEditingSubcategories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProduct, setNewProduct] = useState({ ...emptyProduct, images: [] });
  const [imageErrors, setImageErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories-with-subcategories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Автоматическая генерация slug
  useEffect(() => {
    if (newProduct.name) {
      const generatedSlug = generateSlug(newProduct.name);
      setNewProduct(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [newProduct.name]);

  // Update subcategories when category changes
  useEffect(() => {
    if (newProduct.category && newProduct.category !== "__new__") {
      const selectedCategory = categories.find(c => c.category === newProduct.category);
      setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
    } else {
      setSubcategories([]);
    }
  }, [newProduct.category, categories]);

  // Handle image errors
  const handleImageError = (imageUrl) => (e) => {
    setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
    e.target.src = PLACEHOLDER_IMAGE;
  };

  // Upload images for new product
  const handleNewImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1) return;

    console.log('Selected files:', files); // Debug log

    setUploadProgress(10);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file)); // Исправлено на 'files'
    formData.append('category', 'products');

    try {
      setUploadProgress(30);
      
      const res = await fetch(`${API_URL}/api/uploads/`, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(70);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Ошибка сервера: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setNewProduct(prev => ({ 
          ...prev, 
          images: [...prev.images, ...(data.image_urls || [])] 
        }));
        setUploadProgress(100);
        
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Ошибка загрузки: ${error.message}`);
      setUploadProgress(0);
    }
  };

  // Remove image from new product
  const removeNewImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle new product form changes
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit new product
  const handleNewSubmit = async (e) => {
    e.preventDefault();
    
    // Базовая валидация
    if (!newProduct.name.trim()) {
      alert("Введите название товара!");
      return;
    }

    if (!newProduct.new_price || Number(newProduct.new_price) <= 0) {
      alert("Введите корректную цену!");
      return;
    }

    if (!newProduct.quantity || Number(newProduct.quantity) < 0) {
      alert("Введите корректное количество!");
      return;
    }

    if (!newProduct.category) {
      alert("Выберите категорию!");
      return;
    }

    setAdding(true);

    try {
      const category = newProduct.category === "__new__" 
        ? (newProduct.category_typed || "").trim()
        : newProduct.category;

      const subcategory = newProduct.subcategory === "__new__"
        ? (newProduct.subcategory_typed || "").trim()
        : newProduct.subcategory;

      if (!category) {
        alert("Категория обязательна!");
        return;
      }

      const finalSlug = generateSlug(newProduct.name);

      const productData = {
        name: newProduct.name.trim(),
        slug: finalSlug,
        category: category,
        subcategory: subcategory,
        old_price: Number(newProduct.old_price) || 0,
        new_price: Number(newProduct.new_price) || 0,
        description: newProduct.description,
        quantity: Number(newProduct.quantity) || 0,
        images: newProduct.images.length > 0 ? newProduct.images : [PLACEHOLDER_IMAGE]
      };

      console.log('Sending product data:', productData);

      const response = await fetch(`${API_URL}/api/addproduct`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewProduct({ ...emptyProduct, images: [] });
        await fetchInfo();
        alert('Товар успешно добавлен!');
      } else {
        alert(data.message || 'Ошибка при добавлении товара');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert("Ошибка при добавлении товара: " + error.message);
    } finally {
      setAdding(false);
    }
  };

  // Fetch all products
  const fetchInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/allproducts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.products)) {
        setAllProducts(data.products);
      } else if (Array.isArray(data)) {
        setAllProducts(data);
      } else {
        console.error('Неверный формат данных:', data);
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка товаров:", error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchInfo(); 
  }, []);

  // Delete product
  const remove_product = async (product) => {
    if (!product?._id && !product?.slug) {
      alert('Неверный идентификатор товара');
      return;
    }
    
    if (!window.confirm(`Удалить товар "${product.name}"?`)) return;
    
    try {
      const identifier = product.slug || product._id;
      const response = await fetch(`${API_URL}/api/removeproduct/${identifier}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Товар успешно удален');
        await fetchInfo();
      } else {
        alert(data.message || 'Ошибка при удалении товара');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Ошибка удаления: ' + error.message);
    }
  };

  // Start editing product
  const startEditing = (product) => {
    setEditingProduct({
      ...product,
      images: Array.isArray(product.images) ? product.images : 
             product.image ? [product.image] : []
    });
    
    if (product.category && product.category !== "__new__") {
      const selectedCategory = categories.find(c => c.category === product.category);
      setEditingSubcategories(selectedCategory ? selectedCategory.subcategories : []);
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'name' && value) {
      const newSlug = generateSlug(value);
      setEditingProduct(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  };

  // Handle category change in edit
  const handleEditCategoryChange = (e) => {
    const value = e.target.value;
    setEditingProduct(prev => ({
      ...prev,
      category: value,
      subcategory: "",
      category_typed: "",
      subcategory_typed: ""
    }));
  };

  // Handle subcategory change in edit
  const handleEditSubcategoryChange = (e) => {
    setEditingProduct(prev => ({
      ...prev,
      subcategory: e.target.value,
      subcategory_typed: ""
    }));
  };

  // Upload images for editing
  const handleEditImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1) return;
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file)); // Исправлено на 'files'
    formData.append('category', 'products');
    
    try {
      const res = await fetch(`${API_URL}/api/uploads/`, { 
        method: 'POST', 
        body: formData 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Ошибка сервера: ${res.status}`);
      }
      
      const data = await res.json();
      setEditingProduct(prev => ({ 
        ...prev, 
        images: [...prev.images, ...(data.image_urls || [])] 
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(`Ошибка загрузки изображений: ${error.message}`);
    }
  };

  // Remove image from editing product
  const removeEditImage = (index) => {
    setEditingProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Save edited product
  const saveEdit = async () => {
    if (!editingProduct) return;
    
    // Валидация
    if (!editingProduct.name.trim()) {
      alert("Введите название товара!");
      return;
    }

    if (!editingProduct.new_price || Number(editingProduct.new_price) <= 0) {
      alert("Введите корректную цену!");
      return;
    }

    if (!editingProduct.quantity || Number(editingProduct.quantity) < 0) {
      alert("Введите корректное количество!");
      return;
    }

    const category = editingProduct.category === "__new__"
      ? (editingProduct.category_typed || "").trim()
      : editingProduct.category;

    let subcategory = "";
    if (editingProduct.category === "__new__") {
      subcategory = (editingProduct.subcategory_typed || "").trim();
    } else {
      subcategory = editingProduct.subcategory === "__new__"
        ? (editingProduct.subcategory_typed || "").trim()
        : (editingProduct.subcategory || "").trim();
    }

    if (!category) {
      alert("Категория обязательна!");
      return;
    }

    try {
      const identifier = editingProduct.slug || editingProduct._id;
      
      const updateData = {
        name: editingProduct.name.trim(),
        slug: editingProduct.slug,
        category: category,
        subcategory: subcategory,
        old_price: Number(editingProduct.old_price) || 0,
        new_price: Number(editingProduct.new_price) || 0,
        description: editingProduct.description,
        quantity: Number(editingProduct.quantity) || 0,
        images: editingProduct.images.length > 0 ? editingProduct.images : [PLACEHOLDER_IMAGE]
      };

      console.log('Updating product with data:', updateData);

      const response = await fetch(`${API_URL}/api/updateproduct/${identifier}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEditingProduct(null);
        await fetchInfo();
        alert('Товар успешно обновлен!');
      } else {
        alert(data.message || 'Ошибка обновления товара');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert("Ошибка обновления товара: " + error.message);
    }
  };

  // Filter products based on search
  const filteredProducts = allproducts.filter(product => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    
    const searchFields = [
      product.name,
      product.description,
      product.category,
      product.subcategory,
      product.slug
    ];
    
    return searchFields.some(field => 
      field && field.toString().toLowerCase().includes(q)
    );
  });

  // Get product images safely
  const getProductImages = (product) => {
    if (Array.isArray(product.images)) {
      return product.images.filter(img => img);
    }
    if (product.image) {
      return [product.image];
    }
    return [PLACEHOLDER_IMAGE];
  };

  // Создаем уникальный ключ для каждого продукта
  const getProductKey = (product) => {
    return `${product._id}-${product.slug || 'no-slug'}`;
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Управление товарами</h1>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Поиск товаров по названию, категории, описанию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Add New Product Form */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Добавить новый товар</h3>
        <form className={styles.createForm} onSubmit={handleNewSubmit}>
          <div className={styles.formGrid}>
            {/* Basic Info */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Название товара *</label>
              <input
                name="name"
                placeholder="Введите название товара"
                value={newProduct.name}
                onChange={handleNewChange}
                required
                className={styles.formInput}
              />
              {newProduct.name && (
                <div className={styles.slugPreview}>
                  <strong>URL:</strong> {generateSlug(newProduct.name)}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Описание товара</label>
              <textarea
                name="description"
                placeholder="Подробное описание товара"
                value={newProduct.description}
                onChange={handleNewChange}
                rows={3}
                className={styles.formTextarea}
              />
            </div>

            {/* Image Upload */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Изображения товара</label>
              <div className={styles.uploadArea}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleNewImages} 
                  className={styles.fileInput}
                  id="new-images"
                />
                <label htmlFor="new-images" className={styles.fileInputLabel}>
                  <span>Выберите файлы</span>
                  <span className={styles.fileHint}>(поддерживаются JPG, PNG, WebP)</span>
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              <div className={styles.imagePreviews}>
                {newProduct.images.map((img, index) => (
                  <div key={`new-${index}`} className={styles.previewImageContainer}>
                    <img
                      src={img}
                      alt="Предпросмотр"
                      width={80}
                      height={80}
                      className={styles.previewImage}
                      onError={handleImageError(img)}
                    />
                    <button 
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className={styles.removeImageButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {newProduct.images.length === 0 && (
                <p className={styles.helpText}>Если не загрузить изображения, будет использована заглушка</p>
              )}
            </div>

            {/* Category & Subcategory */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Категория *</label>
              <select
                name="category"
                value={newProduct.category}
                onChange={handleNewChange}
                required
                className={styles.formSelect}
              >
                <option value="">Выберите категорию...</option>
                {categories.map((cat, index) => (
                  <option key={`cat-${index}`} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
                <option value="__new__">+ Создать новую категорию</option>
              </select>
            </div>

            {newProduct.category === "__new__" && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Название новой категории *</label>
                <input
                  name="category_typed"
                  placeholder="Введите название новой категории"
                  value={newProduct.category_typed || ""}
                  onChange={handleNewChange}
                  required
                  className={styles.formInput}
                />
              </div>
            )}

            {(newProduct.category && newProduct.category !== "__new__" && subcategories.length > 0) && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Подкатегория</label>
                <select
                  name="subcategory"
                  value={newProduct.subcategory}
                  onChange={handleNewChange}
                  className={styles.formSelect}
                >
                  <option value="">Выберите подкатегорию...</option>
                  {subcategories.map((sub, index) => (
                    <option key={`sub-${index}`} value={sub}>{sub}</option>
                  ))}
                  <option value="__new__">+ Создать новую подкатегорию</option>
                </select>
              </div>
            )}

            {newProduct.subcategory === "__new__" && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Название новой подкатегории</label>
                <input
                  name="subcategory_typed"
                  placeholder="Введите название новой подкатегории"
                  value={newProduct.subcategory_typed || ""}
                  onChange={handleNewChange}
                  required
                  className={styles.formInput}
                />
              </div>
            )}

            {/* Prices & Quantity */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Старая цена</label>
              <input
                name="old_price"
                placeholder="0"
                value={newProduct.old_price}
                onChange={handleNewChange}
                type="number"
                min="0"
                step="0.01"
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Новая цена *</label>
              <input
                name="new_price"
                placeholder="0"
                value={newProduct.new_price}
                onChange={handleNewChange}
                type="number"
                min="0"
                step="0.01"
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Количество на складе *</label>
              <input
                name="quantity"
                placeholder="0"
                value={newProduct.quantity}
                onChange={handleNewChange}
                type="number"
                min="0"
                required
                className={styles.formInput}
              />
            </div>

            {/* Submit Button */}
            <div className={styles.formGroup}>
              <button 
                type="submit" 
                disabled={adding} 
                className={`${styles.submitButton} ${adding ? styles.loading : ''}`}
              >
                {adding ? "Добавление..." : "Добавить товар"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className={styles.productsSection}>
        <h3 className={styles.sectionTitle}>
          Все товары ({filteredProducts.length})
          {loading && <span className={styles.loadingText}> (загрузка...)</span>}
        </h3>
        
        {loading ? (
          <div className={styles.loadingState}>Загрузка товаров...</div>
        ) : (
          <>
            <div className={styles.productsTable}>
              {/* Table Header */}
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Фото</div>
                <div className={styles.tableCell}>Название</div>
                <div className={styles.tableCell}>Категория</div>
                <div className={styles.tableCell}>Цены</div>
                <div className={styles.tableCell}>Кол-во</div>
                <div className={styles.tableCell}>Действия</div>
              </div>

              {/* Table Body */}
              <div className={styles.tableBody}>
                {filteredProducts.map((product) => (
                  <div key={getProductKey(product)} className={styles.tableRow}>
                    {editingProduct && editingProduct._id === product._id ? (
                      // Edit Mode
                      <>
                        <div className={styles.tableCell}>
                          <div className={styles.editImageSection}>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={handleEditImages} 
                              className={styles.fileInput}
                              id="edit-images"
                            />
                            <label htmlFor="edit-images" className={styles.fileInputLabel}>
                              Добавить фото
                            </label>
                            <div className={styles.editImagePreviews}>
                              {(editingProduct.images || []).map((img, index) => (
                                <div key={`edit-${index}`} className={styles.previewImageContainer}>
                                  <img
                                    src={img}
                                    alt=""
                                    width={60}
                                    height={60}
                                    className={styles.previewImage}
                                    onError={handleImageError(img)}
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => removeEditImage(index)}
                                    className={styles.removeImageButton}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className={styles.tableCell}>
                          <input 
                            name="name" 
                            value={editingProduct.name} 
                            onChange={handleEditChange} 
                            className={styles.editInput}
                            placeholder="Название товара"
                          />
                          <div className={styles.slugPreviewSmall}>
                            <strong>URL:</strong> {editingProduct.slug}
                          </div>
                          <textarea 
                            name="description" 
                            value={editingProduct.description} 
                            onChange={handleEditChange} 
                            rows={2} 
                            placeholder="Описание товара"
                            className={styles.editTextarea}
                          />
                        </div>

                        <div className={styles.tableCell}>
                          <select
                            name="category"
                            value={editingProduct.category}
                            onChange={handleEditCategoryChange}
                            required
                            className={styles.editSelect}
                          >
                            <option value="">Выберите категорию...</option>
                            {categories.map((cat, index) => (
                              <option key={`edit-cat-${index}`} value={cat.category}>
                                {cat.category}
                              </option>
                            ))}
                            <option value="__new__">+ Новая категория</option>
                          </select>
                          
                          {editingProduct.category && editingProduct.category !== "__new__" && (
                            <select
                              name="subcategory"
                              value={editingProduct.subcategory}
                              onChange={handleEditSubcategoryChange}
                              className={styles.editSelect}
                            >
                              <option value="">Подкатегория...</option>
                              {editingSubcategories.map((sub, index) => (
                                <option key={`edit-sub-${index}`} value={sub}>{sub}</option>
                              ))}
                              <option value="__new__">+ Новая подкатегория</option>
                            </select>
                          )}
                          {editingProduct.category === "__new__" && (
                            <input
                              name="category_typed"
                              placeholder="Новая категория"
                              value={editingProduct.category_typed || ""}
                              onChange={handleEditChange}
                              className={styles.editInput}
                            />
                          )}
                          {editingProduct.subcategory === "__new__" && (
                            <input
                              name="subcategory_typed"
                              placeholder="Новая подкатегория"
                              value={editingProduct.subcategory_typed || ""}
                              onChange={handleEditChange}
                              className={styles.editInput}
                            />
                          )}
                        </div>

                        <div className={styles.tableCell}>
                          <div className={styles.priceEditGroup}>
                            <input 
                              name="old_price" 
                              value={editingProduct.old_price} 
                              onChange={handleEditChange} 
                              type="number" 
                              min="0"
                              step="0.01"
                              placeholder="Старая цена"
                              className={styles.editInput}
                            />
                            <input 
                              name="new_price" 
                              value={editingProduct.new_price} 
                              onChange={handleEditChange} 
                              type="number" 
                              min="0"
                              step="0.01"
                              placeholder="Новая цена"
                              className={styles.editInput}
                            />
                          </div>
                          <input 
                            name="quantity" 
                            value={editingProduct.quantity} 
                            onChange={handleEditChange} 
                            type="number" 
                            min="0"
                            placeholder="Количество"
                            className={styles.editInput}
                          />
                        </div>

                        <div className={styles.tableCell}>
                          <div className={styles.actionButtons}>
                            <button onClick={saveEdit} className={styles.saveButton}>
                              Сохранить
                            </button>
                            <button 
                              onClick={() => setEditingProduct(null)} 
                              className={styles.cancelButton}
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <div className={styles.tableCell}>
                          <div className={styles.productImages}>
                            {getProductImages(product).slice(0, 1).map((img, index) => (
                              <div key={`prod-${product._id}-img-${index}`} className={styles.productImageContainer}>
                                <img
                                  src={img}
                                  alt={product.name}
                                  width={50}
                                  height={50}
                                  className={styles.productImage}
                                  onError={handleImageError(img)}
                                />
                              </div>
                            ))}
                            {getProductImages(product).length > 1 && (
                              <div className={styles.moreImages}>+{getProductImages(product).length - 1}</div>
                            )}
                          </div>
                        </div>

                        <div className={styles.tableCell}>
                          <div className={styles.productName}>{product.name}</div>
                          <div className={styles.productDescription}>
                            {product.description && product.description.length > 100 
                              ? `${product.description.substring(0, 100)}...`
                              : product.description
                            }
                          </div>
                          <div className={styles.productSlug}>
                            <code>{product.slug}</code>
                          </div>
                        </div>

                        <div className={styles.tableCell}>
                          <div className={styles.productCategory}>{product.category}</div>
                          {product.subcategory && product.subcategory !== "" ? (
                            <div className={styles.productSubcategory}>{product.subcategory}</div>
                          ) : (
                            <div className={styles.noSubcategory}>(без подкатегории)</div>
                          )}
                        </div>

                        <div className={styles.tableCell}>
                          <div className={styles.priceGroup}>
                            {product.old_price > 0 && (
                              <span className={styles.oldPrice}>{product.old_price}₽</span>
                            )}
                            <span className={styles.newPrice}>{product.new_price}₽</span>
                          </div>
                        </div>

                        <div className={styles.tableCell}>
                          <span className={product.quantity > 0 ? styles.inStock : styles.outOfStock}>
                            {product.quantity}
                          </span>
                        </div>

                        <div className={styles.tableCell}>
                          <div className={styles.actionButtons}>
                            <button 
                              onClick={() => startEditing(product)} 
                              className={styles.editButton}
                            >
                              Редактировать
                            </button>
                            <button 
                              onClick={() => remove_product(product)} 
                              className={styles.deleteButton}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {filteredProducts.length === 0 && (
              <div className={styles.emptyState}>
                <p>Товары не найдены</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}