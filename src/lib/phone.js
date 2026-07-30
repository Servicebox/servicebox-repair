/**
 * Builds a regex that matches a phone number regardless of formatting
 * (spaces, dashes, parentheses, leading +7/8) by comparing only the last
 * 10 digits with any non-digit characters allowed between them. Mirrors
 * crm-repair's buildPhoneMatcher so both sides agree on "same phone number"
 * without requiring any existing User.phone values to be normalized first.
 */
export function phoneMatchRegex(rawPhone) {
  const digits = (rawPhone ?? '').replace(/\D/g, '').slice(-10);
  if (digits.length < 7) return null;
  return new RegExp(digits.split('').join('\\D*'));
}

/** Last-10-digits form, used only when we need to *store* a phone value ourselves. */
export function normalizePhoneDigits(rawPhone) {
  return (rawPhone ?? '').replace(/\D/g, '').slice(-10);
}
