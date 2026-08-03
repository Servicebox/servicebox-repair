// app/checkout/page.js
import CheckoutForm from '@/components/Checkout/CheckoutForm';

// Раньше страница не имела своих meta-тегов и наследовала title/description
// главной (root layout.js) — из-за этого /checkout, /profile, /thank-you и
// т.д. дублировали заголовок и описание главной страницы в глазах поисковика
// (найдено в SEO-аудите, 2026-08-03). Транзакционная страница, не должна
// участвовать в выдаче.
export const metadata = {
  title: 'Оформление заказа',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}