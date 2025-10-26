'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerificationErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get('message') || 'Произошла ошибка при подтверждении email';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl transform hover:-translate-y-1">
          
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-12 sm:py-16 text-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-6 left-12 w-10 h-10 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-14 w-8 h-8 bg-white rounded-full animate-pulse delay-500"></div>
            </div>
            
            <div className="relative z-10">
              <div className="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-full shadow-lg mb-6">
                <svg 
                  className="h-10 w-10 sm:h-12 sm:w-12 text-red-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ошибка подтверждения
              </h1>
              
              <p className="text-red-100 text-lg sm:text-xl opacity-90">
                Не удалось подтвердить email
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-8 sm:py-12">
            {/* Error Message */}
            <div className="text-center mb-6">
              <p className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
                {message}
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-6 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Возможные причины:
                  </h3>
                  <ul className="text-red-700 space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Ссылка устарела (действительна 24 часа)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Ссылка уже была использована
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Некорректная ссылка подтверждения
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Что можно сделать:
                  </h3>
                  <ul className="text-blue-700 space-y-2 text-left">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Запросить новую ссылку подтверждения
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Проверить правильность email
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Обратиться в службу поддержки
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
              <Link
                href="/api/auth/resend-verification"
                className="w-full sm:flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Новая ссылка
              </Link>
              
              <Link
                href="/"
                className="w-full sm:flex-1 inline-flex items-center justify-center px-6 py-4 border border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                На главную
              </Link>
            </div>

            {/* Support Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center text-base text-blue-600 hover:text-blue-500 font-medium transition-colors duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Связаться с поддержкой
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Мы поможем решить проблему
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerificationError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Загрузка...</p>
          <p className="text-gray-600 text-sm mt-2">Пожалуйста, подождите</p>
        </div>
      </div>
    }>
      <VerificationErrorContent />
    </Suspense>
  );
}