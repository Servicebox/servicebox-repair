'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ListProduct.module.css';

const API_URL = '';

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

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSubcategories, setEditingSubcategories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProduct, setNewProduct] = useState({ ...emptyProduct, images: [] });
  const [newProductPreview, setNewProductPreview] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  // Загрузка категорий
  useEffect(() => {
    fetch(`${API_URL}/api/categories-with-subcategories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Обновление подкатегорий при изменении категории
  useEffect(() => {
    const selectedCategory = categories.find(c => c.category === newProduct.category);
    setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
  }, [newProduct.category, categories]);

  // Обновление подкатегорий при редактировании
  useEffect(() => {
    if (!editingProduct) return;
    const selectedCategory = categories.find(c => c.category === editingProduct.category);
    setEditingSubcategories(selectedCategory ? selectedCategory.subcategories : []);
  }, [editingProduct?.category, categories]);

  // Обработчик ошибок изображений
  const handleImageError = (imageUrl) => (e) => {
    setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
    e.target.src = '/images/placeholder.jpg';
  };

  // Загрузка изображений для нового товара
// В компоненте ListProduct исправьте функции загрузки:

// Upload images for new product
  // Upload images for new product
  const handleNewImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1) return;

    setUploadProgress(10);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file)); // исправлено на 'files'
    formData.append('category', 'products');

    try {
      setUploadProgress(30);
      
      const res = await fetch(`${API_URL}/api/uploads/`, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(70);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка сервера: ${errorText}`);
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

  // Upload images for editing
  const handleEditImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 1) return;
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file)); // исправлено на 'files'
    formData.append('category', 'products');
    
    try {
      const res = await fetch(`${API_URL}/api/uploads/`, { 
        method: 'POST', 
        body: formData 
      });
      
      if (!res.ok) throw new Error('Ошибка загрузки файлов');
      
      const data = await res.json();
      setEditingProduct(prev => ({ 
        ...prev, 
        images: [...prev.images, ...(data.image_urls || [])] 
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Ошибка загрузки изображений');
    }
  };


  // Изменение полей нового товара
  const handleNewChange = (e) => {
    setNewProduct(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Отправка нового товара
  const handleNewSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.images || newProduct.images.length === 0) {
      alert("Сначала загрузите минимум 1 изображение!");
      return;
    }
    setAdding(true);

    try {
      const cat = newProduct.category === "__new__" 
        ? newProduct.category_typed 
        : newProduct.category;
        
      const subcat = newProduct.subcategory === "__new__"
        ? newProduct.subcategory_typed
        : newProduct.subcategory;

      const response = await fetch(`${API_URL}/api/addproduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          category: cat,
          subcategory: subcat,
          old_price: Number(newProduct.old_price),
          new_price: Number(newProduct.new_price),
          description: newProduct.description.replace(/\n/g, '<br>'),
          quantity: Number(newProduct.quantity),
          images: newProduct.images
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewProduct({ ...emptyProduct, images: [] });
        setNewProductPreview([]);
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

  // Загрузка списка товаров
  const fetchInfo = async () => {
    try {
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
    } catch (e) {
      console.error("Ошибка загрузки списка товаров:", e);
      setAllProducts([]);
      alert("Ошибка загрузки списка товаров: " + e.message);
    }
  };

  useEffect(() => { fetchInfo(); }, []);

  // Удаление товара
  const remove_product = async (slug) => {
    if (!slug) {
      alert('Неверный идентификатор товара');
      return;
    }
    
    if (!window.confirm('Удалить этот товар?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/removeproduct/${slug}`, {
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

  // Начало редактирования товара
  const startEditing = (p) => {
    setEditingProduct({
      ...p,
      images: Array.isArray(p.images) ? p.images : [p.images]
    });
    const selectedCategory = categories.find(c => c.category === p.category);
    setEditingSubcategories(selectedCategory ? selectedCategory.subcategories : []);
  };

  // Изменение полей редактирования
  const handleEditChange = (e) => {
    setEditingProduct(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Изменение категории при редактировании
  const handleEditCategoryChange = (e) => {
    const value = e.target.value;
    setEditingProduct(prev => ({
      ...prev,
      category: value,
      subcategory: "",
      category_typed: "",
      subcategory_typed: ""
    }));
    const selectedCategory = categories.find(c => c.category === value);
    setEditingSubcategories(selectedCategory ? selectedCategory.subcategories : []);
  };

  // Изменение подкатегории при редактировании
  const handleEditSubcategoryChange = (e) => {
    setEditingProduct(prev => ({
      ...prev,
      subcategory: e.target.value
    }));
  };


  // Сохранение изменений
  const saveEdit = async () => {
    if (!editingProduct) return;
    
    const cat = editingProduct.category === "__new__"
      ? editingProduct.category_typed
      : editingProduct.category;
    let subcat = "";
    if (editingProduct.category === "__new__") {
      subcat = editingProduct.subcategory_typed || "";
    } else {
      if (editingProduct.subcategory === "__new__") {
        subcat = editingProduct.subcategory_typed;
      } else {
        subcat = editingProduct.subcategory || "";
      }
    }

    try {
      const response = await fetch(`${API_URL}/api/updateproduct/${editingProduct.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          category: cat,
          subcategory: subcat,
          old_price: Number(editingProduct.old_price),
          new_price: Number(editingProduct.new_price),
          quantity: Number(editingProduct.quantity),
        }),
      });
      if (!response.ok) throw new Error();
      setEditingProduct(null);
      await fetchInfo();
      alert('Товар успешно обновлен!');
    } catch {
      alert("Ошибка обновления товара");
    }
  };

  // Фильтрация товаров
  const filteredProducts = allproducts.filter(product => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.description && product.description.toLowerCase().includes(q)) ||
      (product.category && product.category.toLowerCase().includes(q)) ||
      (product.subcategory && product.subcategory.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.listProduct}>
      <h2>Добавить новый товар</h2>
      
      <input
        type="text"
        placeholder="Поиск..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />

      <form className={styles.createForm} onSubmit={handleNewSubmit}>
        <div className={styles.imageUpload}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleNewImages} 
            className={styles.fileInput}
          />
          <div className={styles.imagePreviews}>
            {(newProduct.images?.length > 0 ? newProduct.images : newProductPreview).map((img, i) => (
              <Image
                key={`new-img-${img}`}
                src={imageErrors[img] ? '/images/placeholder.jpg' : img}
                alt="Предпросмотр изображения"
                width={60}
                height={60}
                className={styles.previewImage}
                onError={handleImageError(img)}
              />
            ))}
          </div>
        </div>

        <input 
          name="name" 
          placeholder="Название" 
          value={newProduct.name} 
          onChange={handleNewChange} 
          required 
          className={styles.formInput}
        />
        
        <textarea 
          name="description" 
          placeholder="Описание" 
          value={newProduct.description} 
          onChange={handleNewChange} 
          rows={3} 
          required 
          className={styles.formTextarea}
        />

        <select
          name="category"
          value={newProduct.category}
          onChange={(e) => {
            setNewProduct(prev => ({
              ...prev,
              category: e.target.value,
              subcategory: "",
              category_typed: "",
              subcategory_typed: ""
            }));
          }}
          required
          className={styles.formSelect}
        >
          <option value="">Выберите категорию...</option>
          {categories.map(c => (
            <option key={c.category} value={c.category}>{c.category}</option>
          ))}
          <option value="__new__">+ Новая категория</option>
        </select>

        {newProduct.category === "__new__" && (
          <input
            name="category_typed"
            placeholder="Введите новую категорию"
            value={newProduct.category_typed || ""}
            onChange={(e) => setNewProduct(prev => ({
              ...prev,
              category_typed: e.target.value
            }))}
            required
            className={styles.formInput}
          />
        )}

        {((newProduct.category === "__new__") || subcategories.length > 0) && (
          <div className={styles.subcategorySection}>
            <label className={styles.subcategoryLabel}>Подкатегория</label>
            {newProduct.category === "__new__" ? (
              <input
                name="subcategory_typed"
                placeholder="Введите подкатегорию (опционально)"
                value={newProduct.subcategory_typed || ""}
                onChange={(e) => setNewProduct(prev => ({
                  ...prev,
                  subcategory_typed: e.target.value
                }))}
                className={styles.formInput}
              />
            ) : (
              <select
                name="subcategory"
                value={newProduct.subcategory}
                onChange={(e) => setNewProduct(prev => ({
                  ...prev,
                  subcategory: e.target.value,
                  subcategory_typed: ""
                }))}
                className={styles.formSelect}
              >
                <option value="">Выберите подкатегорию...</option>
                {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__new__">+ Новая подкатегория</option>
              </select>
            )}
            
            {newProduct.category !== "__new__" && newProduct.subcategory === "__new__" && (
              <input
                name="subcategory_typed"
                placeholder="Введите новую подкатегорию"
                value={newProduct.subcategory_typed || ""}
                onChange={(e) => setNewProduct(prev => ({
                  ...prev,
                  subcategory_typed: e.target.value
                }))}
                required
                className={styles.formInput}
              />
            )}
          </div>
        )}

        <input 
          name="old_price" 
          placeholder="Старая цена" 
          value={newProduct.old_price} 
          onChange={handleNewChange} 
          type="number" 
          className={styles.formInput}
        />
        
        <input 
          name="new_price" 
          placeholder="Новая цена" 
          value={newProduct.new_price} 
          onChange={handleNewChange} 
          type="number" 
          required 
          className={styles.formInput}
        />
        
        <input 
          name="quantity" 
          placeholder="Количество" 
          value={newProduct.quantity} 
          onChange={handleNewChange} 
          type="number" 
          required 
          className={styles.formInput}
        />
        
        <button 
          disabled={adding} 
          className={`${styles.submitButton} ${adding ? styles.loading : ''}`}
        >
          {adding ? "Добавление..." : "Добавить товар"}
        </button>
      </form>

      <h2>Все товары ({filteredProducts.length})</h2>
      
      <div className={styles.productsHeader}>
        <div className={styles.headerCell}>Фото</div>
        <div className={styles.headerCell}>Название</div>
        <div className={styles.headerCell}>Описание</div>
        <div className={styles.headerCell}>Категория</div>
        <div className={styles.headerCell}>Подкатегория</div>
        <div className={styles.headerCell}>Старая цена</div>
        <div className={styles.headerCell}>Новая цена</div>
        <div className={styles.headerCell}>Кол-во</div>
        <div className={styles.headerCell}>Действия</div>
      </div>

      <div className={styles.productsList}>
        {filteredProducts.map((product) => (
          <div key={product.slug} className={styles.productRow}>
            {editingProduct && editingProduct.slug === product.slug ? (
              // Режим редактирования
              <div className={styles.editForm}>
                <div className={styles.editImageSection}>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleEditImages} 
                    className={styles.fileInput}
                  />
                  <div className={styles.editImagePreviews}>
                    {(editingProduct.images || []).map((img) => (
                      <Image
                        key={`edit-img-${img}`}
                        src={imageErrors[img] ? '/images/placeholder.jpg' : img}
                        alt=""
                        width={50}
                        height={50}
                        className={styles.previewImage}
                        onError={handleImageError(img)}
                      />
                    ))}
                  </div>
                </div>

                <input 
                  name="name" 
                  value={editingProduct.name} 
                  onChange={handleEditChange} 
                  className={styles.formInput}
                />
                
                <textarea 
                  name="description" 
                  value={editingProduct.description} 
                  onChange={handleEditChange} 
                  rows={2} 
                  className={styles.formTextarea}
                />

                <select
                  name="category"
                  value={editingProduct.category}
                  onChange={handleEditCategoryChange}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Выберите категорию...</option>
                  {categories.map(c => (
                    <option key={c.category} value={c.category}>{c.category}</option>
                  ))}
                  <option value="__new__">+ Новая категория</option>
                </select>

                {editingProduct.category === "__new__" && (
                  <input
                    name="category_typed"
                    placeholder="Введите новую категорию"
                    value={editingProduct.category_typed || ""}
                    onChange={(e) => setEditingProduct(prev => ({
                      ...prev,
                      category_typed: e.target.value
                    }))}
                    required
                    className={styles.formInput}
                  />
                )}

                {((editingProduct.category === "__new__") || editingSubcategories.length > 0) && (
                  <>
                    {editingProduct.category === "__new__" ? (
                      <input
                        name="subcategory_typed"
                        placeholder="Введите подкатегорию (опционально)"
                        value={editingProduct.subcategory_typed || ""}
                        onChange={(e) => setEditingProduct(prev => ({
                          ...prev,
                          subcategory_typed: e.target.value
                        }))}
                        className={styles.formInput}
                      />
                    ) : (
                      <select
                        name="subcategory"
                        value={editingProduct.subcategory}
                        onChange={handleEditSubcategoryChange}
                        className={styles.formSelect}
                      >
                        <option value="">Выберите подкатегорию...</option>
                        {editingSubcategories.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="__new__">+ Новая подкатегория</option>
                      </select>
                    )}
                    
                    {editingProduct.category !== "__new__" && editingProduct.subcategory === "__new__" && (
                      <input
                        name="subcategory_typed"
                        placeholder="Введите новую подкатегорию"
                        value={editingProduct.subcategory_typed || ""}
                        onChange={(e) => setEditingProduct(prev => ({
                          ...prev,
                          subcategory_typed: e.target.value
                        }))}
                        required
                        className={styles.formInput}
                      />
                    )}
                  </>
                )}

                <input 
                  name="old_price" 
                  value={editingProduct.old_price} 
                  onChange={handleEditChange} 
                  type="number" 
                  className={styles.formInput}
                />
                
                <input 
                  name="new_price" 
                  value={editingProduct.new_price} 
                  onChange={handleEditChange} 
                  type="number" 
                  className={styles.formInput}
                />
                
                <input 
                  name="quantity" 
                  value={editingProduct.quantity} 
                  onChange={handleEditChange} 
                  type="number" 
                  className={styles.formInput}
                />

                <div className={styles.editActions}>
                  <button 
                    type="button" 
                    onClick={saveEdit} 
                    className={styles.saveButton}
                  >
                    Сохранить
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingProduct(null)} 
                    className={styles.cancelButton}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              // Режим просмотра
              <>
                <div className={styles.productImages}>
                  {(Array.isArray(product.images) ? product.images : 
                   product.image ? [product.image] : []).slice(0, 3).map((img) =>
                    img && (
                      <Image
                        key={`prod-img-${img}`}
                        src={imageErrors[img] ? '/images/placeholder.jpg' : img}
                        alt={product.name}
                        width={45}
                        height={45}
                        className={styles.productImage}
                        onError={handleImageError(img)}
                      />
                    )
                  )}
                </div>
                
                <div className={styles.productCell}>{product.name}</div>
                <div className={styles.productCell}>{product.description}</div>
                <div className={styles.productCell}>{product.category}</div>
                <div className={styles.productCell}>{product.subcategory}</div>
                <div className={styles.productCell}>{product.old_price}₽</div>
                <div className={styles.productCell}>{product.new_price}₽</div>
                <div className={styles.productCell}>{product.quantity}</div>
                
                <div className={styles.productActions}>
                  <button 
                    onClick={() => startEditing(product)} 
                    className={styles.editButton}
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => remove_product(product.slug)} 
                    className={styles.deleteButton}
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;