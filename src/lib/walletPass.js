import jwt from 'jsonwebtoken';

const SAVE_URL_BASE = 'https://pay.google.com/gp/v/save';
const WALLET_OBJECTS_API = 'https://walletobjects.googleapis.com/walletobjects/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

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

/**
 * Получает OAuth2 access token сервисного аккаунта для Google Wallet
 * Objects REST API (JWT bearer grant, RFC 7523) — отдельный от JWT для
 * "savetowallet" выше, у него другая аудитория (aud) и он реально уходит
 * в Google, а не просто подписывается для ссылки.
 */
async function getWalletAccessToken() {
  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const assertion = jwt.sign(
    {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    },
    sa.private_key,
    { algorithm: 'RS256' }
  );

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Не удалось получить access token Google Wallet: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Обновляет баланс бонусов на уже выданной карте лояльности в Google Wallet
 * (PATCH объекта через Wallet Objects API), чтобы клиент видел актуальное
 * число, а не то, что было на момент добавления карты. Вызывается после
 * каждого изменения User.bonuses — начисление, списание, ручная
 * корректировка. Никогда не бросает исключение наружу: если карта ещё не
 * была добавлена клиентом (404 — объект не существует в Google) или сервис
 * временно недоступен, это не должно ломать саму операцию с бонусами,
 * которая уже сохранена в БД к моменту вызова.
 */
export async function syncWalletBalance({ userId, bonuses }) {
  try {
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID ?? '3388000000023112880';
    const objectId  = `${issuerId}.sb_${userId}`;

    const accessToken = await getWalletAccessToken();

    await fetch(`${WALLET_OBJECTS_API}/loyaltyObject/${objectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        loyaltyPoints: {
          label: 'Бонусы',
          balance: { string: String(bonuses) },
        },
      }),
    });
    // Ответ намеренно не проверяем на ok — 404 (карта ещё не добавлена)
    // и любые другие ошибки здесь не критичны, см. комментарий к функции.
  } catch (err) {
    console.error('syncWalletBalance: не удалось обновить карту Google Wallet:', err.message);
  }
}
