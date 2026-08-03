'use client';
import { useContext, useState } from 'react';
import Item from '@/components/Item/Item';
import { ShopContext } from '@/components/ShopContext/ShopContext';

function AddToCartButton({ slug }) {
  const { addToCart } = useContext(ShopContext);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    await addToCart(slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full mt-2 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition"
    >
      {added ? 'Добавлено ✓' : 'В корзину'}
    </button>
  );
}

export default function ProductGrid({ items }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg">Товары не найдены</p>
        <p className="text-sm mt-2">Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => (
        <div key={item._id}>
          <Item
            slug={item.slug}
            name={item.name}
            images={item.images}
            new_price={item.new_price}
            old_price={item.old_price}
            quantity={item.quantity}
            category={item.category}
            subcategory={item.subcategory}
          />
          <AddToCartButton slug={item.slug} />
        </div>
      ))}
    </div>
  );
}
