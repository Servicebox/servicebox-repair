// components/GEOSEO/GEOSEO.js
'use client';

/**
 * Компонент гео-метатегов для локального SEO и голосового поиска
 * Оптимизирован для Яндекса, Google и ИИ-ассистентов
 */
const GEOSEO = () => {
  // Координаты сервисного центра в Вологде
  const geo = {
    latitude: 59.229445,
    longitude: 39.878542,
    region: 'RU-VLG',
    city: 'Вологда',
    district: 'Центральный район',
    country: 'RU',
    postalCode: '160000'
  };

  // Бизнес-данные для микроразметки
  const business = {
    name: 'ServiceBox',
    category: 'electronics_repair_service',
    address: 'ул. Северная, д. 7А, 1 этаж, ТЦ \'КИТ\'',
    landmark: 'напротив эскалатора, рядом с магазином \'Бристоль\'',
    phone: '+79115018828',
    phoneFormatted: '+7 (911) 501-88-28'
  };

  return (
    <>
      {/* === БАЗОВЫЕ ГЕО-ТЕГИ (стандарт ICBM) === */}
      <meta name="geo.region" content={geo.region} />
      <meta name="geo.placename" content={geo.city} />
      <meta name="geo.position" content={`${geo.latitude};${geo.longitude}`} />
      <meta name="ICBM" content={`${geo.latitude}, ${geo.longitude}`} />

      {/* === РАСШИРЕННЫЕ ГЕО-ТЕГИ ДЛЯ ПОИСКОВЫХ СИСТЕМ === */}
      <meta name="yandex-geo" content={`lat:${geo.latitude};lon:${geo.longitude};city:${geo.city}`} />
      <meta name="google-site-verification" content="6k281LQ_idKz1FOxlcDm522DmLoGRjR3Pu3_so0dLhs" />
      <meta name="yandex-verification" content="aaae5f6d8950e0e0" />

      {/* === БИЗНЕС-МЕТАТЕГИ ДЛЯ ЛОКАЛЬНОГО ПОИСКА === */}
      <meta name="business:name" content={business.name} />
      <meta name="business:category" content={business.category} />
      <meta name="business:locality" content={geo.city} />
      <meta name="business:region" content="Вологодская область" />
      <meta name="business:country" content={geo.country} />
      <meta name="business:postal_code" content={geo.postalCode} />
      <meta name="business:street_address" content={business.address} />
      <meta name="business:phone" content={business.phoneFormatted} />

      {/* === ТЕГИ ДЛЯ ГОЛОСОВОГО ПОИСКА И ИИ-АССИСТЕНТОВ === */}
      <meta name="voice-search:query" content="ремонт техники Вологда" />
      <meta name="voice-search:address" content={`${geo.city}, ${business.address}`} />
      <meta name="voice-search:landmark" content={business.landmark} />
      <meta name="voice-search:phone" content={business.phoneFormatted} />
      <meta name="voice-search:hours" content="Ежедневно с 10:00 до 20:00" />

      {/* === АЛЬТЕРНАТИВНЫЕ ФОРМАТЫ КООРДИНАТ === */}
      <meta name="geo.latitude" content={geo.latitude.toString()} />
      <meta name="geo.longitude" content={geo.longitude.toString()} />
      <meta name="coordinates" content={`${geo.latitude},${geo.longitude}`} />

      {/* === ДОПОЛНИТЕЛЬНЫЕ ТЕГИ ДЛЯ ЯНДЕКС.КАРТ И 2ГИС === */}
      <meta name="yandex-map-org-id" content="70000001074528888" />
      <meta name="2gis-org-id" content="70000001074528888" />

      {/* === OPEN GRAPH GEO (для соцсетей) === */}
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:locality" content={geo.city} />
      <meta property="og:region" content="Вологодская область" />
      <meta property="og:country-name" content="Россия" />
      <meta property="og:street-address" content={business.address} />
      <meta property="og:postal-code" content={geo.postalCode} />
    </>
  );
};

export default GEOSEO;