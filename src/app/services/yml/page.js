// app/services/yml/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export default function ServicesYmlPage() {
  const [state, setState] = useState({
    xml: '',
    stats: {
      totalServices: 0,
      lastUpdated: null
    },
    loading: true,
    error: null
  });

  const fetchYmlData = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const url = '/api/services-yml' + (forceRefresh ? '?refresh=' + Date.now() : '');
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const serviceCount = response.headers.get('X-Services-YML-Count') || '0';

      setState(prev => ({
        ...prev,
        xml: xmlText,
        stats: {
          totalServices: parseInt(serviceCount) || 0,
          lastUpdated: new Date().toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        },
        loading: false
      }));

    } catch (error) {
      console.error('Ошибка загрузки YML:', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Неизвестная ошибка при загрузке данных'
      }));
    }
  }, []);

  const downloadYml = useCallback(() => {
    if (!state.xml) return;

    try {
      const blob = new Blob([state.xml], {
        type: 'application/xml; charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `servicebox-yml-${new Date().toISOString().split('T')[0]}.xml`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Файл успешно скачан!');
    } catch (error) {
      console.error('Ошибка скачивания:', error);
      alert('Ошибка при скачивании файла');
    }
  }, [state.xml]);

  useEffect(() => {
    fetchYmlData();
  }, [fetchYmlData]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Генерация YML-фида</h2>
          <p className="text-gray-600">Подготовка фида для Яндекс.Услуг...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Заголовок и кнопки */}
        <div className="bg-white rounded-xl shadow p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                YML-фид для Яндекс Услуг
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Скачайте фид для загрузки в Яндекс.Вебмастер
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fetchYmlData(true)}
                disabled={state.loading}
                className="px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Обновить
              </button>

              <button
                onClick={downloadYml}
                disabled={!state.xml}
                className="px-5 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Скачать YML
              </button>

              <a
                href="/api/services-yml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Прямая ссылка
              </a>
            </div>
          </div>
        </div>

        {/* Сообщение об ошибке */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">Ошибка загрузки</h3>
                  <p className="text-red-800">{state.error}</p>
                </div>
              </div>
              <button
                onClick={() => fetchYmlData(true)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Повторить
              </button>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Услуг в фиде</h3>
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{state.stats.totalServices}</p>
            <p className="text-sm text-gray-700 mt-2">активных предложений</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Обновлено</h3>
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{state.stats.lastUpdated}</p>
            <p className="text-sm text-gray-700 mt-2">последняя генерация</p>
          </div>
        </div>

        {/* Предпросмотр XML */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gray-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Предпросмотр YML фида</h2>
              <p className="text-gray-300 text-sm">
                Размер: {(state.xml.length / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>

          <div className="overflow-hidden">
            {state.xml ? (
              <div className="relative">
                <pre className="p-6 font-mono text-sm bg-gray-900 text-gray-100 max-h-[600px] overflow-auto whitespace-pre-wrap break-all leading-relaxed">
                  {state.xml.length > 10000
                    ? `${state.xml.substring(0, 10000)}\n\n... [файл обрезан] ...\n\nРазмер файла: ${(state.xml.length / 1024).toFixed(2)} KB`
                    : state.xml}
                </pre>
              </div>
            ) : (
              <div className="p-12 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Фид пустой</h3>
                <p className="text-gray-600 mb-6">Не удалось загрузить фид</p>
                <button
                  onClick={() => fetchYmlData(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Инструкция */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Инструкция по загрузке в Яндекс</h3>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-5 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-bold text-gray-900">Перейдите в Яндекс.Вебмастер</h4>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>Добавьте сайт servicebox35.ru в Яндекс.Вебмастер</li>
                <li>Перейдите в раздел "Маркет → Услуги"</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-bold text-gray-900">Добавьте фид</h4>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>Нажмите "Добавить фид"</li>
                <li>Введите URL: <code className="ml-2 bg-blue-50 px-2 py-1 rounded text-sm font-mono">https://servicebox35.ru/api/services-yml</code></li>
                <li>Нажмите "Загрузить"</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-bold text-gray-900">Проверка и публикация</h4>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>Яндекс проверит фид на валидность</li>
                <li>Исправьте ошибки, если они будут</li>
                <li>После проверки услуги появятся в Яндекс.Услугах</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}