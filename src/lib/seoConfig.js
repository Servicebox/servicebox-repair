// lib/seoConfig.js
export const SEO_CONFIG = {
  site: {
    name: 'СЕРВИС БОКС',
    url: 'https://servicebox35.ru',
    city: 'Вологда',
    region: 'Вологдская область',
    country: 'Россия'
  },

  pages: {
    home: {
      title: 'Ремонт техники в Вологде | СЕРВИС БОКС',
      description: 'Профессиональный ремонт электроники, смартфонов, ноутбуков и планшетов в Вологде. Опыт 10+ лет, гарантия на работу, быстрая диагностика.',
      h1: 'Ремонт техники в Вологде - быстро и качественно',
      keywords: ['ремонт техники Вологда', 'ремонт смартфонов', 'ремонт ноутбуков', 'сервис центр'],
    },

    services: {
      title: 'Услуги по ремонту в Вологде | СЕРВИС БОКС',
      description: 'Все виды ремонтных услуг: смартфоны, планшеты, ноутбуки, ПК. Гарантия на работу, оригинальные запчасти.',
      h1: 'Услуги ремонта техники в Вологде',
      keywords: ['услуги ремонта', 'сервис центр Вологда', 'ремонт электроники'],
    },

    shop: {
      title: 'Запчасти и аксессуары в Вологде | СЕРВИС БОКС',
      description: 'Оригинальные запчасти и аксессуары для всех брендов. Доставка в Вологде и по России.',
      h1: 'Запчасти и аксессуары для техники в Вологде',
      keywords: ['запчасти', 'аксессуары', 'купить запчасти Вологда'],
    },

    about: {
      title: 'О компании СЕРВИС БОКС | Ремонт в Вологде',
      description: 'СЕРВИС БОКС - лидер в сфере ремонта техники в Вологде. Мастера с сертификатами, современное оборудование, гарантия качества.',
      h1: 'О сервис-центре СЕРВИС БОКС',
      keywords: ['о компании', 'сервис центр', 'профессионалы'],
    },

    contacts: {
      title: 'Контакты СЕРВИС БОКС | Ремонт в Вологде',
      description: 'Наши контакты: адрес, телефон, время работы. Сервис центр СЕРВИС БОКС в центре Вологды.',
      h1: 'Контакты СЕРВИС БОКС в Вологде',
      keywords: ['контакты', 'адрес', 'телефон', 'Вологда'],
    }
  }
};

export const generateLocalBusinessSchema = (address = '') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'СЕРВИС БОКС',
    'url': process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': address || 'Центр, Вологда',
      'addressLocality': 'Вологда',
      'addressRegion': 'Вологдская область',
      'addressCountry': 'RU'
    },
    'description': 'Профессиональный ремонт техники в Вологде',
    'areaServed': {
      '@type': 'City',
      'name': 'Вологда'
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'СЕРВИС БОКС',
    'url': process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru',
    'logo': `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/logo.png`,
    'description': 'Сервис центр ремонта техники в Вологде',
    'sameAs': [
      'https://www.instagram.com/servicebox35',
      'https://www.facebook.com/servicebox35'
    ],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Вологда',
      'addressLocality': 'Вологда',
      'addressRegion': 'Вологдская область',
      'addressCountry': 'RU'
    }
  };
};

export const generateServiceSchema = (name, description, price = null) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': name,
    'description': description,
    'areaServed': {
      '@type': 'City',
      'name': 'Вологда'
    },
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'СЕРВИС БОКС'
    },
    ...(price && { 'offers': { '@type': 'Offer', 'price': price } })
  };
};
