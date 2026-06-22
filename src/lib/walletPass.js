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

  const issuerId    = process.env.GOOGLE_WALLET_ISSUER_ID ?? '9299-5484-6696';
  const classSuffix = process.env.GOOGLE_WALLET_CLASS_ID ?? 'loyalty_class';
  const classId     = `${issuerId}.${classSuffix}`;
  // objectId должен быть уникален для каждого юзера и без спецсимволов
  const objectId = `${classId}.sb_${userId}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

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
    // Google не может загрузить изображение с localhost — пропускаем heroImage в dev
    ...(!isLocalhost && baseUrl && {
      heroImage: {
        sourceUri: { uri: `${baseUrl}/images/wallet-hero.jpg` },
      },
    }),
    accountId:   userId,
    accountName: username,
  };

  const payload = {
    iss: sa.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
  };

  // Google Wallet требует RS256 с приватным ключом сервисного аккаунта
  const token = jwt.sign(payload, sa.private_key, { algorithm: 'RS256' });

  return {
    saveUrl:  `${SAVE_URL_BASE}/${token}`,
    objectId,
  };
}
