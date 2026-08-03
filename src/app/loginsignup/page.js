// app/loginsignup/page.js
'use client';
import { useRouter } from 'next/navigation';
import LoginSignup from '../../components/LoginSignup/LoginSignup';

// Раньше файл не имел default export (весь код был внутри неиспользуемого
// ParentComponent со ссылками на несуществующие isOpen/onClose/onLoginSuccess)
// — маршрут отдавал 500 на проде. При этом на него реально ведут ссылки
// "Войдите" из ReviewsClient.js и CommentSection.js (найдено при разборе
// SEO-аудита, 2026-08-03). Здесь модалка используется как полноэкранная
// форма входа: закрытие или успешный вход возвращают на главную.
export default function LoginSignupPage() {
  const router = useRouter();
  return (
    <LoginSignup
      isOpen
      onClose={() => router.push('/')}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
