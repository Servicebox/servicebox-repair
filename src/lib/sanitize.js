// lib/sanitize.js
//
// Санитизация HTML для полей, которые администратор вводит как сырую
// разметку (service.content, News contentBlocks.text) и которые рендерятся
// через dangerouslySetInnerHTML. Без этого скомпрометированный или
// злонамеренный админ-аккаунт мог вставить <script> прямо в эти поля —
// найдено независимым security-review 2026-10-23 (ServiceForm.js и
// NewsEditor.js сохраняют content как plain textarea без какой-либо
// проверки). isomorphic-dompurify работает одинаково на сервере (SSR) и
// в браузере.
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'table', 'thead',
  'tbody', 'tr', 'th', 'td', 'img', 'figure', 'figcaption', 'div', 'span',
];
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'colspan', 'rowspan'];

export function sanitizeHtml(dirty) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR });
}
