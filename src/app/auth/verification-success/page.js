'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerificationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const alreadyVerified = searchParams.get('alreadyVerified');
  const email = searchParams.get('email');

  useEffect(() => {
    // Автоматическое перенаправление через 3 секунды
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg w-full">

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl transform hover:-translate-y-1">
          
          {/* Header with Animated Icon */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-12 sm:py-16 text-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-10 w-8 h-8 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 right-12 w-6 h-6 bg-white rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white rounded-full animate-pulse delay-700"></div>
            </div>
            
            <div className="relative z-10">
              <div className="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-full shadow-lg mb-6 transform transition-transform duration-500 hover:scale-110">
                <svg 
                  className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                {alreadyVerified ? '✓ Уже подтверждено' : '✓ Подтверждено!'}
              </h1>
              
              <p className="text-emerald-100 text-lg sm:text-xl opacity-90">
                {alreadyVerified 
                  ? 'Ваш email уже был подтвержден ранее'
                  : 'Email успешно подтвержден'
                }
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-8 sm:py-12">
            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                {alreadyVerified 
                  ? 'Добро пожаловать обратно!' 
                  : 'Добро пожаловать в наше сообщество! 🎉'
                }
              </h2>
              
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                {alreadyVerified
                  ? 'Ваш email адрес уже был подтвержден. Теперь вы можете пользоваться всеми возможностями нашего сервиса.'
                  : 'Поздравляем! Ваш email адрес успешно подтвержден. Теперь вы полноправный член нашего сообщества.'
                }
              </p>

              {email && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-emerald-800 font-medium">
                    Email: <span className="font-bold">{email}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Features List */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Теперь вам доступно:
              </h3>
              <ul className="text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 flex-shrink-0"></span>
                  Полный доступ к личному кабинету
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 flex-shrink-0"></span>
                  История заказов и покупок
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 flex-shrink-0"></span>
                  Специальные предложения
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 flex-shrink-0"></span>
                  Быстрое оформление заказов
                </li>
              </ul>
            </div>

            {/* Auto-redirect Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-center">
              <p className="text-blue-700 text-sm">
                ⏱️ Автоматическое перенаправление на главную страницу через 3 секунды...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
              <Link
                href="/"
                className="w-full sm:flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Перейти на главную
              </Link>
              
              <Link
                href="/profile"
                className="w-full sm:flex-1 inline-flex items-center justify-center px-6 py-4 border border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Личный кабинет
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Нужна помощь?
                </p>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center text-base text-emerald-600 hover:text-emerald-500 font-medium transition-colors duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Связаться с поддержкой
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Благодарим за выбор нашей платформы
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerificationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Загрузка...</p>
          <p className="text-gray-500 text-sm mt-2">Пожалуйста, подождите</p>
        </div>
      </div>
    }>
      <VerificationSuccessContent />
    </Suspense>
  );
}