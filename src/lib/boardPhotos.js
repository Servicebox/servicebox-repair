// src/lib/boardPhotos.js
// Чистые хелперы раздела «Фото плат». Никаких обращений к БД/ФС на импорте.
import path from 'path';

export const BOARD_PHOTOS_DIR = path.join(process.cwd(), 'uploads', 'board-photos');

export const DEVICE_TYPES = [
  'videocard', 'laptop', 'motherboard', 'phone', 'tablet', 'console', 'tv', 'other',
];

const LABELS = {
  videocard: 'Видеокарта',
  laptop: 'Ноутбук',
  motherboard: 'Материнская плата',
  phone: 'Телефон',
  tablet: 'Планшет',
  console: 'Игровая приставка',
  tv: 'Телевизор',
  other: 'Плата',
};

const SERVICE_URLS = {
  videocard: '/services/videocards',
  laptop: '/services/laptops',
  phone: '/services/phones',
  tablet: '/services/tablets',
  console: '/services/consoles',
  tv: '/services/tv',
};

export function deviceTypeLabel(type) {
  return LABELS[type] || 'Плата';
}

export function deviceTypeServiceUrl(type) {
  return SERVICE_URLS[type] || '/services';
}

// Родительный падеж для авто-описания: «ремонт видеокарт в Вологде»
const GENITIVE = {
  videocard: 'видеокарт',
  laptop: 'ноутбуков',
  motherboard: 'материнских плат',
  phone: 'телефонов',
  tablet: 'планшетов',
  console: 'игровых приставок',
  tv: 'телевизоров',
  other: 'техники',
};

export function boardPhotoDescription({ title, chip, description, deviceType }) {
  if (description && description.trim()) {
    const t = description.trim();
    return t.length > 160 ? t.slice(0, 157).trimEnd() + '…' : t;
  }
  const chipPart = chip && chip.trim() ? `, чип ${chip.trim()}` : '';
  return `Фото платы ${title}${chipPart} с точками замера сопротивления. `
    + `Диагностика и ремонт ${GENITIVE[deviceType] || 'техники'} в Вологде — СЕРВИС БОКС.`;
}
