// Тонкая обёртка над window.ym / window.dataLayer для Яндекс.Метрики
// (счётчик 97888825). Активирует цели и события электронной коммерции,
// которые уже настроены в кабинете Метрики, но раньше никогда не
// вызывались из кода. Все функции безопасны к вызову в любой момент —
// до загрузки счётчика (нет согласия на cookie, SSR, скрипт ещё не
// догрузился) они молча ничего не делают.
const METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export function reachGoal(name, params) {
  if (typeof window === 'undefined' || !window.ym || !METRIKA_ID) return;
  window.ym(Number(METRIKA_ID), 'reachGoal', name, params);
}

function pushEcommerce(event) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: event });
}

const toEcommerceProduct = (product, quantity, listName) => ({
  id: product.slug || product._id || product.productId,
  name: product.name,
  price: product.new_price ?? product.price,
  ...(quantity != null && { quantity }),
  ...(listName && { list: listName }),
});

export function trackProductListView(products, listName) {
  if (!products?.length) return;
  reachGoal('product_list_view');
  pushEcommerce({
    impressions: products.map((p, i) => ({ ...toEcommerceProduct(p, null, listName), position: i + 1 })),
  });
}

export function trackProductClick(product, listName) {
  reachGoal('product_click');
  pushEcommerce({ click: { products: [toEcommerceProduct(product, null, listName)] } });
}

export function trackProductView(product) {
  reachGoal('view_product_details');
  pushEcommerce({ detail: { products: [toEcommerceProduct(product)] } });
}

export function trackAddToCart(product, quantity = 1) {
  reachGoal('add_to_cart');
  pushEcommerce({ add: { products: [toEcommerceProduct(product, quantity)] } });
}

export function trackRemoveFromCart(product, quantity = 1) {
  reachGoal('remove_from_cart');
  pushEcommerce({ remove: { products: [toEcommerceProduct(product, quantity)] } });
}

export function trackCheckoutOpen(items) {
  if (!items?.length) return;
  reachGoal('checkout_open');
  pushEcommerce({ checkout: { products: items.map(({ product, quantity }) => toEcommerceProduct(product, quantity)) } });
}

// isPrepaid: true — заказ оплачен онлайн (картой) заранее, false — наличными/при получении.
// Соответствует существующим целям order_prepaid/order_postpaid в кабинете Метрики.
export function trackOrderCreated({ orderNumber, totalAmount, products, isPrepaid }) {
  reachGoal(isPrepaid ? 'order_prepaid' : 'order_postpaid');
  pushEcommerce({
    purchase: {
      actionField: { id: orderNumber, revenue: totalAmount },
      products: (products || []).map(p => ({
        id: p.productId || p.slug,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
    },
  });
}

// Собственной цели под заявку на ремонт в кабинете ещё нет — событие уже
// отправляется, чтобы начать копиться в логах; цель можно добавить в
// кабинете Метрики позже (Действие/JS-событие "booking_submitted"),
// прошлые визиты при этом не потеряются.
export function trackBookingSubmitted(serviceName) {
  reachGoal('booking_submitted', { service: serviceName });
}
