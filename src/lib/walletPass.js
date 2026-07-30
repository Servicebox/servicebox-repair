import jwt from 'jsonwebtoken';

const SAVE_URL_BASE = 'https://pay.google.com/gp/v/save';

function getServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY не задан');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY содержит невалидный JSON');
  }
}

/**
 * Генерирует JWT для Google Wallet Loyalty Pass.
 * @param {{ userId: string, username: string, bonuses: number }} user
 * @returns {{ saveUrl: string, objectId: string }}
 */
export function generateWalletJwt({ userId, username, bonuses }) {
  const sa = getServiceAccount();

  // issuerId должен быть чисто числовым (формат ресурса Google Wallet API это
  // требует) — реальный номер эмитента 3388000000023112880, найден в кабинете
  // pay.google.com/business/console (URL класса лояльности). "9299-5484-6696"
  // (с дефисами) — это реальный, но человекочитаемый суффикс класса,
  // ошибочно использовавшийся как issuerId (issuerId и classSuffix были
  // перепутаны местами в конфиге ранее).
  const issuerId    = process.env.GOOGLE_WALLET_ISSUER_ID ?? '3388000000023112880';
  const classSuffix = process.env.GOOGLE_WALLET_CLASS_ID ?? '9299-5484-6696';
  const classId     = `${issuerId}.${classSuffix}`;
  // Правильный формат: issuerId.suffix — точка только одна (не classId.suffix)
  const objectId    = `${issuerId}.sb_${userId}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://servicebox35.ru';

  // Определение класса обязательно включать в JWT — иначе Google не знает о его существовании
  const loyaltyClass = {
    id: classId,
    issuerName: 'ServiceBox',
    reviewStatus: 'UNDER_REVIEW',
    programName: 'Программа лояльности ServiceBox',
    // programLogo — обязательное поле для LoyaltyClass
    programLogo: {
      sourceUri: {
        uri: `${baseUrl}/images/servicebox.webp`,
      },
      contentDescription: {
        defaultValue: {
          language: 'ru-RU',
          value: 'Логотип ServiceBox',
        },
      },
    },
  };

  const loyaltyObject = {
    id:      objectId,
    classId: classId,
    state:   'ACTIVE',
    loyaltyPoints: {
      label:   'Бонусы',
      balance: { string: String(bonuses) },
    },
    textModulesData: [
      { id: 'welcome', header: 'Добро пожаловать!', body: 'Участник программы лояльности ServiceBox' },
      { id: 'info',    header: 'Как использовать',  body: 'Называйте имя при визите или предъявите QR-код' },
    ],
    barcode: {
      type:          'QR_CODE',
      value:         userId,
      alternateText: 'ServiceBox ID',
    },
    heroImage: {
      sourceUri: { uri: `${baseUrl}/images/servicebox.webp` },
      contentDescription: {
        defaultValue: {
          language: 'ru-RU',
          value: 'ServiceBox',
        },
      },
    },
    accountId:   userId,
    accountName: username,
  };

  const payload = {
    iss: sa.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [baseUrl || 'https://servicebox35.ru'],
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects:  [loyaltyObject],
    },
  };

  const token = jwt.sign(payload, sa.private_key, { algorithm: 'RS256' });

  return {
    saveUrl:  `${SAVE_URL_BASE}/${token}`,
    objectId,
  };
}
