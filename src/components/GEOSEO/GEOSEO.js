'use client';

const GEOSEO = () => {
  const geo = {
    latitude: 59.229445,
    longitude: 39.878542,
    region: 'RU-VLG',
    city: 'Вологда',
    country: 'RU',
    postalCode: '160000'
  };

  return (
    <>
      {/* === СТАНДАРТНЫЕ ГЕО-ТЕГИ (ICBM & Dublin Core) === */}
      {/* Поддерживаются Google, Bing и Apple Maps [[Источник: ICBM standard, Dublin Core]] */}
      <meta name="geo.region" content={geo.region} />
      <meta name="geo.placename" content={geo.city} />
      <meta name="geo.position" content={`${geo.latitude};${geo.longitude}`} />
      <meta name="ICBM" content={`${geo.latitude}, ${geo.longitude}`} />

      {/* === OPEN GRAPH GEO (для соцсетей и мессенджеров) === */}
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:locality" content={geo.city} />
      <meta property="og:region" content="Вологодская область" />
      <meta property="og:country-name" content={geo.country} />
      <meta property="og:postal-code" content={geo.postalCode} />

      {/* Верификация (убедитесь, что ID актуальны) */}
      <meta name="google-site-verification" content="6k281LQ_idKz1FOxlcDm522DmLoGRjR3Pu3_so0dLhs" />
      <meta name="yandex-verification" content="97888825" />
    </>
  );
};

export default GEOSEO;