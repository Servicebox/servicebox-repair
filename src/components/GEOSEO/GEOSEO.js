'use client';

const GEOSEO = () => {
  return (
    <>
      {/* Гео-метатеги для Вологды */}
      <meta name="geo.region" content="RU-VLG" />
      <meta name="geo.placename" content="Вологда" />
      <meta name="geo.position" content="59.218066;39.269049" />
      <meta name="ICBM" content="59.218066, 39.269049" />
      
      {/* Дополнительные SEO-теги */}
      <meta name="yandex-verification" content="ваш_код_проверки" />
      <meta name="google-site-verification" content="ваш_код_проверки" />
    </>
  );
};

export default GEOSEO;