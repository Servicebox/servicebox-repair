import Item from '@/components/Item/Item';

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
        <Item
          key={item._id}
          slug={item.slug}
          name={item.name}
          images={item.images}
          new_price={item.new_price}
          old_price={item.old_price}
          quantity={item.quantity}
          category={item.category}
          subcategory={item.subcategory}
        />
      ))}
    </div>
  );
}
