# Hero-секция главной: улучшения по образцу конкурента (iservice35.ru)

**Контекст:** 27.07.2026. Разбор посадочной страницы конкурента (iservice35.ru), пришедшей по рекламному клику (`yclid` в URL), выявил несколько практик, которые стоит перенести на наш сайт. У нас уже реализована часть аналогичных элементов (бейдж 5.0★/150+ отзывов, статы 5000+/10 лет, ссылки «Новости»/«Акции» в меню, кнопка калькулятора со скроллом) — ниже только реальные разрывы, подтверждённые чтением кода.

**Цель:** снизить барьер обращения (VK в hero, быстрый вход в расчёт цены) и открыть доступ к уже существующей, но никак не используемой функции — собственной системе отзывов пользователей (`/reviews`).

**Отдельное решение по Telegram (уточнено с Томой 27.07.2026):** Telegram как публичный канал связи с сайта убирается полностью (юридические ограничения) — не только не добавляется в hero, но и удаляется из всех существующих публичных мест. Внутренние уведомления через Telegram-бота (`api/telegram/*`, вызываются из `BookingForm.js` и `Chat.js` при новой заявке/сообщении) — это отдельный, служебный канал уведомлений для владельца бизнеса, не публичная ссылка; он НЕ трогается и продолжает работать как раньше.

## Что уже реализовано (не трогаем)

- `MainBanner.js`: бейдж 5.0★/150+ отзывов, статы, кнопки «Записаться»/«Рассчитать стоимость» (скроллит к `#repair-calculator`).
- `BurgerMenu.js` и `Header.js`: ссылки на `/news` и `/promotions-page`.
- `BUSINESS.socials.vk` в `src/lib/constants.js` — уже используется в `Header.js`/`Footer.js`, остаётся без изменений.

## Изменение 1: кнопка VK в hero

**Файл:** `src/components/MainBanner/MainBanner.js` (+ `.module.css`)

В блок `.heroCTA` (после существующих кнопок «Записаться на ремонт» / «Рассчитать стоимость») добавляется компактная ссылка-кнопка на `BUSINESS.socials.vk`, `target="_blank" rel="noopener noreferrer"`. Иконка — `FontAwesomeIcon` с `faVk` из `@fortawesome/free-brands-svg-icons` (тот же пакет и та же иконка уже используется в `Header.js`).

## Изменение 2: якорь на отзывы в hero

**Файл:** `src/components/MainBanner/MainBanner.js`, `src/components/ReviewsSection/ReviewsSection.js`

- `ReviewsSection.js`: секция `<section className={styles.reviewsSection} aria-labelledby="reviews-heading">` получает `id="reviews"`.
- `MainBanner.js`: существующий блок `.heroBadge` (бейдж «5.0 · 150+ отзывов») оборачивается в `<a href="#reviews">` — клик скроллит вниз к `ReviewsSection` (обычный HTML-якорь, без JS, работает как переход `scroll-behavior: smooth` уже задан глобально — см. `data-scroll-behavior` на `<html>` в `layout.js`).

## Изменение 3: мини-калькулятор — выбор категории в hero, переход к существующему полному калькулятору

**Файлы:**
- Modify: `src/components/Main/Main.js` — поднимает состояние `heroDeviceType` наверх, передаёт вниз в обе части.
- Modify: `src/components/MainBanner/MainBanner.js` — принимает новый проп `onSelectDeviceType(key)`, рендерит 6 иконок-категорий (те же `DEVICE_TYPES`, что в `RepairCalculator.js`: `phone/laptop/tablet/tv/console/videocard`), клик вызывает колбэк и скроллит к `#repair-calculator` (переиспользуется существующая `scrollToCalculator`).
- Modify: `src/components/RepairCalculator/RepairCalculator.js` — добавляется `useEffect`, синхронизирующий изменение пропа `initialDeviceType` после монтирования (сейчас `initialDeviceType` используется только как начальное значение `useState`, что не реагирует на последующие изменения пропа):
  ```js
  useEffect(() => {
    if (initialDeviceType) selectDeviceType(initialDeviceType);
  }, [initialDeviceType]);
  ```

**Почему не отдельный виджет:** реальный расчёт цены требует последовательного выбора устройство → бренд → модель → услуга через матрицу цен в БД (`resolvePrice`, `isServiceApplicable`, `isAppleBrand` — вся эта логика уже существует только в `RepairCalculator.js`). Дублирование этой логики в лёгком hero-виджете нарушило бы DRY и создало риск рассинхронизации при будущих изменениях правил ценообразования. Вместо этого hero — это просто первый шаг существующего калькулятора, вынесенный выше по странице.

## Изменение 4: доступ к собственной системе отзывов (`/reviews`)

**Файл:** `src/components/ReviewsSection/ReviewsSection.js` (+ `.module.css`)

Проверено: страница `/reviews` (авторизованные пользователи ставят оценку и пишут текст через `ReviewsClient.js`, модерация через `Review.status`) существует и полностью работает, но ни одна ссылка на сайте на неё не ведёт (`grep` не находит `href="/reviews"` нигде в `src`).

В блок `.reviewsCta` (рядом с существующей ссылкой «Читать все отзывы на Яндекс.Картах») добавляется вторая кнопка — `<Link href="/reviews">Оставить свой отзыв</Link>`.

## Изменение 5: удаление публичных ссылок на Telegram

Найдены `grep`'ом все публичные (клиентские) упоминания `t.me/Tomkka` в коде — 4 места:

- `src/components/Footer/Footer.js:97-103` — ссылка-текст «Telegram» в блоке соцсетей футера. Удаляется целиком (остаётся только ссылка ВКонтакте).
- `src/components/Contacts/Contacts.js:156-163` — карточка контакта с иконкой `faTelegram` и текстом «Telegram» на странице `/contacts`. Удаляется целиком; неиспользуемый после этого импорт `faTelegram` из `@fortawesome/free-brands-svg-icons` тоже убирается (оставить `faVk`).
- `src/components/AboutRef/AboutRef.js` — проверено: этот компонент нигде не импортируется (`grep -rln "from.*AboutRef'" src` — пусто), т.е. мёртвый код; вдобавок содержит собственный баг — `aboutJsonLd` (строка 50) используется, но нигде не определён и не импортирован (вызвал бы `ReferenceError`, если бы компонент когда-либо реально рендерился). Решение с Томой (27.07.2026): удалить компонент целиком (`AboutRef.js` + `AboutRef.module.css`), а не чинить Telegram-упоминания внутри мёртвого файла.
- `src/lib/constants.js:52` — `BUSINESS.socials.telegram: 'https://t.me/Tomkka'`. Удаляется как поле объекта.
- `src/lib/seo-helpers.js:78` — `sameAs: [BUSINESS.socials.vk, BUSINESS.socials.telegram]` (JSON-LD структурированные данные `LocalBusiness`, используется в `layout.js`). Меняется на `sameAs: [BUSINESS.socials.vk]`.
- `src/app/api/ai/v1/business/route.js:53` — найдено в момент реализации (не поймано первым `grep`, т.к. первый проход искал только `t.me/Tomkka` в связке с уже известными файлами, а этот файл не проверялся отдельно): тот же паттерн `sameAs` с прямым URL `"https://t.me/Tomkka"` в JSON-LD `Organization`, отдаваемом ИИ-ассистентам/краулерам через этот API-эндпоинт. Та же категория «публичной ссылки» — удалена аналогично.
- `src/app/contacts/page.js:86` — найдено при браузерной проверке `/contacts` уже ПОСЛЕ удаления поля `BUSINESS.socials.telegram` (страница ссылалась на него через `href={BUSINESS.socials.telegram}`, из-за чего ссылка стала бы битой — `href={undefined}` — а не просто исчезла; исходный `grep` по литеральной строке `t.me/Tomkka` не находил обращение через константу). Важно: это ОТДЕЛЬНАЯ страница `/contacts` (`src/app/contacts/page.js`, инлайновая Tailwind-вёрстка), не связанная с компонентом `src/components/Contacts/Contacts.js` (который рендерится на главной внутри `Main.js`) — обе оказались реальными, независимыми местами использования.

**Отдельная находка — мёртвый компонент `TelegramChat`:** `src/components/TelegramChat/Chat.js` (+ `.module.css`) нигде не импортируется (`grep -rl "TelegramChat" src` не находит ни одного использования за пределами своей собственной директории) — это заброшенный компонент, оставшийся с этапа до переезда чата на CRM-инбокс (см. `docs/superpowers/plans/2026-07-14-website-chat-crm-inbox.md`). Он использует Telegram напрямую (`api/telegram/send`, `api/telegram/updates`) внутри себя, но поскольку никогда не рендерится — это не публичная ссылка, а чистый мёртвый код. Удаляется вместе с остальным как санитарная уборка, отдельным коммитом от смысловых изменений 1-5.

**Не трогается (внутренние уведомления, подтверждено с Томой):**
- `src/app/api/telegram/route.js`, `src/app/api/telegram/send/route.js`, `src/app/api/telegram/updates/route.js` — серверные роуты бота.
- Вызовы `axios.post('/api/telegram/send', ...)` в `src/components/Chat/Chat.js` (реально используемый, актуальный чат-виджет) и `src/components/BookingForm/BookingForm.js` — служебные уведомления владельцу о новых сообщениях/заявках.
- `src/app/api/bookings/route.js`, `src/app/api/bookings/track/[code]/route.js`, `src/app/api/contact/route.js`, `src/app/api/ai/v1/business/route.js` — используют Telegram только как внутренний канал уведомлений/данных, не как публичную ссылку.

## Тестирование

Ручная проверка в браузере (dev-сервер) — автотестов в проекте нет (см. прецедент в `docs/superpowers/plans/2026-07-25-turbo-pages-feed.md`):
- Кнопка VK в hero открывает правильный URL в новой вкладке.
- Клик по бейджу отзывов в hero плавно скроллит к секции отзывов.
- Клик по иконке категории в hero скроллит к калькулятору, который открывается уже на шаге выбора бренда для выбранной категории (не с нуля).
- Кнопка «Оставить свой отзыв» ведёт на `/reviews`, страница открывается и работает как раньше.
- На `/contacts` и в футере ссылок на Telegram больше нет; ссылка на VK осталась и работает.
- `npm run build` проходит без ошибок (проверяет в т.ч. отсутствие неиспользуемых импортов `faTelegram`, если линтер это ловит, — иначе проверить `grep -rn "faTelegram" src` вручную, ожидается пусто).
- Booking-форма и Chat по-прежнему шлют уведомление в Telegram-бота (служебный канал не сломан) — проверить оформлением тестовой заявки на dev-сервере и получением сообщения от бота.
- Мобильная адаптивность: новые элементы не ломают существующую верстку hero на 375/768px (тот же globals.css breakpoints).
