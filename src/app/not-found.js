// app/not-found.js
'use client';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScrewdriverWrench, faGhost, faHome, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="text-center px-4 py-8 z-10">
        {/* Анимированный призрак */}
        <div className="mb-8 animate-bounce">
          <FontAwesomeIcon 
            icon={faGhost} 
            className="text-8xl text-blue-500 mb-4"
          />
        </div>

        {/* Заголовок с юмором */}
        <h1 className="text-8xl font-bold text-gray-800 mb-4 animate-pulse">
          404
        </h1>
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Ой! Эта страница уплыла на ремонт!
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Кажется, эта страница отправилась в наш сервисный центр...
          </p>
          <p className="text-lg text-gray-500">
            Но не волнуйтесь! Наши инженеры уже работают над её восстановлением 🔧
          </p>
        </div>

        {/* Смешное сообщение */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8 max-w-2xl mx-auto rounded-lg">
          <p className="text-gray-700">
            <strong>Диагностика:</strong> Страница не найдена<br/>
            <strong>Причина:</strong> Возможно, её съели вирусы или она просто устала работать<br/>
            <strong>Срок ремонта:</strong> Бесплатно и сразу - просто вернитесь на главную!
          </p>
        </div>

        {/* Интерактивные кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faHome} />
            Вернуться на главную
          </Link>
          
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} />
            Попробовать снова
          </button>
        </div>

        {/* Дополнительный юмор */}
        <div className="text-gray-500 text-sm max-w-2xl mx-auto">
          <p className="mb-2">
            ⚡ <strong>Акция!</strong> Принесите эту ошибку в наш сервис - получите скидку 5% на ремонт!
          </p>
          <p>
            📍 Пока вы здесь, можете ознакомиться с нашими 
            <Link href="/services" className="text-blue-500 hover:text-blue-600 mx-1 underline">
              услугами
            </Link>
            - они точно работают!
          </p>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute bottom-10 left-10 animate-pulse">
        <FontAwesomeIcon icon={faScrewdriverWrench} className="text-4xl text-gray-400 opacity-50" />
      </div>
      <div className="absolute top-10 right-10 animate-spin-slow">
        <div className="w-16 h-16 border-4 border-dashed border-blue-300 rounded-full"></div>
      </div>
      <div className="absolute top-1/3 left-1/4 animate-bounce">
        <div className="text-2xl">🔧</div>
      </div>
      <div className="absolute bottom-1/3 right-1/4 animate-ping">
        <div className="text-xl">💻</div>
      </div>
    </div>
  );
}