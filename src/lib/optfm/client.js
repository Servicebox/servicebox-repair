// src/lib/optfm/client.js
const API_URL = 'https://optfm.ru/api/';
const REQUEST_DELAY_MS = 400;
const MAX_ATTEMPTS = 5;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCredentials() {
  const authId = process.env.OPTFM_AUTH_ID;
  const authKey = process.env.OPTFM_AUTH_KEY;
  if (!authId || !authKey) {
    throw new Error('OPTFM_AUTH_ID / OPTFM_AUTH_KEY не заданы в переменных окружения');
  }
  return { authId, authKey };
}

function buildForm(method, params, extraParams) {
  const { authId, authKey } = getCredentials();
  const form = new FormData();
  form.append('auth_id', authId);
  form.append('auth_key', authKey);
  form.append('method', method);
  for (const [key, value] of Object.entries(params)) {
    form.append(key, String(value));
  }
  // Задел под будущий параметр фильтрации по складу (см. спеку, раздел
  // "Открытый вопрос — склад") — значение подставится сюда без изменения
  // кода, вызывающего optfmRequest, как только менеджер OPTFM подтвердит
  // точное имя параметра.
  for (const [key, value] of Object.entries(extraParams)) {
    form.append(key, String(value));
  }
  return form;
}

/**
 * Низкоуровневый вызов метода OPTFM API. У поставщика агрессивный WAF —
 * подтверждено вживую при подготовке этой интеграции (503 "too many
 * requests" уже после двух быстрых запросов подряд), поэтому между
 * запросами обязательная пауза, а на 503 — повтор с растущей задержкой.
 */
export async function optfmRequest(method, params = {}, extraParams = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await sleep(REQUEST_DELAY_MS * 2 ** (attempt - 1));
    }

    let res;
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'User-Agent': USER_AGENT },
        body: buildForm(method, params, extraParams),
      });
    } catch (networkError) {
      lastError = networkError;
      continue;
    }

    if (res.status === 503) {
      lastError = new Error(`OPTFM API вернул 503 для ${method} (попытка ${attempt}/${MAX_ATTEMPTS})`);
      continue;
    }

    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      // Успешный catalog.getImage возвращает бинарные данные напрямую
      const buffer = Buffer.from(await res.arrayBuffer());
      await sleep(REQUEST_DELAY_MS);
      return { buffer, contentType };
    }

    const json = await res.json();
    await sleep(REQUEST_DELAY_MS);

    // Реальные ответы API не всегда содержат поле status из документации —
    // подтверждено вживую 2026-08-03 (успешный catalog.getSectionList
    // вернул {"response": {...}} без "status" вовсе). Надёжнее проверять
    // по факту наличия error/response, а не по значению status.
    if (json.error) {
      throw new Error(
        `OPTFM API (${method}): ${json.error.error_msg || 'неизвестная ошибка'} (код ${json.error.error_code})`
      );
    }

    if (!json.response) {
      throw new Error(`OPTFM API (${method}): неожиданный формат ответа: ${JSON.stringify(json).slice(0, 200)}`);
    }

    return { response: json.response };
  }

  throw lastError || new Error(`OPTFM API недоступен для ${method} после ${MAX_ATTEMPTS} попыток`);
}
