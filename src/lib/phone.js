/**
 * Строит регулярку, которая находит телефон независимо от форматирования
 * (пробелы, дефисы, скобки, +7/8 в начале) — сравниваются только последние
 * 10 цифр, между ними допускаются любые нецифровые символы. Логика зеркалит
 * buildPhoneMatcher из crm-repair, чтобы обе стороны одинаково понимали
 * "один и тот же номер телефона" без миграции уже сохранённых User.phone.
 */
export function phoneMatchRegex(rawPhone) {
  const digits = (rawPhone ?? '').replace(/\D/g, '').slice(-10);
  if (digits.length < 7) return null;
  return new RegExp(digits.split('').join('\\D*'));
}

/** Последние 10 цифр — используется только когда сами СОХРАНЯЕМ телефон. */
export function normalizePhoneDigits(rawPhone) {
  return (rawPhone ?? '').replace(/\D/g, '').slice(-10);
}
