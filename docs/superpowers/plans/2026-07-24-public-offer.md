# Public Offer (Публичная оферта) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/oferta` public-offer legal page (covering repair services + retail sale of parts) and link it from the footer, matching the existing `/privacy-policy` pattern.

**Architecture:** Static Next.js App Router route (`src/app/oferta/{layout.js,page.js,Oferta.module.css}`), server component (no `'use client'`, no hooks), styled with a CSS module modeled on `PrivacyPolicy.module.css`. One-line addition to `src/components/Footer/Footer.js`.

**Tech Stack:** Next.js App Router, CSS Modules, no new dependencies.

## Global Constraints

- Reuse exact company details already published in `src/app/privacy-policy/page.js` (ООО «СЕРВИС БОКС», ОГРН 1213500018522, ИНН 3525475916, КПП 352501001, address, director, email) — the two legal pages must never disagree on entity data.
- No `'use client'`, no hooks, no download/PDF feature — this is a static server component, unlike `/consent`.
- No changes to `/checkout` or `/cart` — no new checkbox/gating (explicitly out of scope, per spec).
- Content must cover both repair services and retail sale of parts via `/shop` → `/cart` → `/checkout`.
- No test files — consistent with `/privacy-policy` and `/consent`, which have zero tests. "Testing" for this plan means a build check + manual visual/content verification against the spec section list.

Spec: `docs/superpowers/specs/2026-07-24-public-offer-design.md`

---

### Task 1: CSS module for the offer page

**Files:**
- Create: `src/app/oferta/Oferta.module.css`

**Interfaces:**
- Produces: CSS Modules class names consumed by Task 2's `page.js` — `container`, `content`, `header`, `title`, `meta`, `section`, `companyInfo`, `detailsList`, `list`, `contactInfo`, `footer`.

- [ ] **Step 1: Create the CSS module**

Copy `src/app/privacy-policy/PrivacyPolicy.module.css` structure, dropping the unused `.cookieBanner`/`.cookieContent`/`.cookieHeader`/`.typeHeader`/`.detailActions` rules at the bottom (those are dead leftovers in the privacy-policy file from an earlier copy-paste and are never referenced by `privacy-policy/page.js` — do not carry that dead code forward).

```css
/* app/oferta/Oferta.module.css */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.meta {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
}

.section p {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.companyInfo {
  background: var(--color-bg-elevated);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid var(--color-primary);
}

.companyInfo h3 {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.detailsList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detailsList li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.detailsList li:last-child {
  border-bottom: none;
}

.detailsList strong {
  color: var(--color-text-muted);
  min-width: 150px;
  display: inline-block;
}

.list {
  list-style-type: disc;
  margin-left: 1.5rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.list li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.contactInfo {
  background: var(--color-primary-bg);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.contactInfo p {
  margin: 0.5rem 0;
  color: var(--color-text-muted);
}

.footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.footer p {
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .content {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .detailsList li {
    padding: 0.75rem 0;
  }

  .detailsList strong {
    display: block;
    margin-bottom: 0.25rem;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/oferta/Oferta.module.css
git commit -m "feat: add CSS module for public offer page"
```

---

### Task 2: Offer page content (`page.js`)

**Files:**
- Create: `src/app/oferta/page.js`

**Interfaces:**
- Consumes: `styles` from `./Oferta.module.css` (Task 1) — class names `container`, `content`, `header`, `title`, `meta`, `section`, `companyInfo`, `detailsList`, `list`, `contactInfo`, `footer`.
- Produces: default-exported `Oferta` component, consumed by `layout.js` in Task 3 via Next.js file-based routing (no direct import needed).

- [ ] **Step 1: Create `page.js` with all 13 sections**

```javascript
// app/oferta/page.jsx
import styles from './Oferta.module.css';

export default function Oferta() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Публичная оферта</h1>
          <div className={styles.meta}>
            <p>Утверждена: {new Date().toLocaleDateString('ru-RU')}</p>
            <p>Дата вступления в силу: {new Date().toLocaleDateString('ru-RU')}</p>
          </div>
        </header>

        <section className={styles.section}>
          <h2>1. Общие положения</h2>
          <p>
            Настоящий документ является официальным предложением (публичной офертой)
            Общества с ограниченной ответственностью «СЕРВИС БОКС» (далее — «Исполнитель»,
            «Продавец» или «Оператор») в адрес физических лиц (далее — «Заказчик»
            или «Покупатель») заключить договор оказания услуг по ремонту и диагностике
            цифровой техники и (или) договор розничной купли-продажи товаров дистанционным
            способом на условиях, изложенных ниже, в соответствии со статьёй 437
            Гражданского кодекса Российской Федерации.
          </p>
          <p>
            Совершение Заказчиком действий, предусмотренных разделом 4 настоящей оферты
            (акцепт), означает полное и безоговорочное принятие условий настоящей оферты
            в порядке статьи 438 Гражданского кодекса Российской Федерации.
          </p>
          <div className={styles.companyInfo}>
            <h3>Реквизиты Оператора:</h3>
            <ul className={styles.detailsList}>
              <li><strong>Полное наименование:</strong> Общество с ограниченной ответственностью «СЕРВИС БОКС»</li>
              <li><strong>Юридический адрес:</strong> 160029, Вологодская область, г Вологда, Северная ул, д. 7а, офис 405</li>
              <li><strong>Почтовый адрес:</strong> 160029, Вологодская область, г Вологда, Северная ул, д. 7а, 1 этаж, на против эскалатора</li>
              <li><strong>ОГРН:</strong> 1213500018522</li>
              <li><strong>ИНН:</strong> 3525475916</li>
              <li><strong>КПП:</strong> 352501001</li>
              <li><strong>Дата регистрации:</strong> 14.12.2021</li>
              <li><strong>Руководитель:</strong> Генеральный директор Кознов Андрей Викторович</li>
              <li><strong>Контактный email:</strong> 508828@bk.ru</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2>2. Термины и определения</h2>
          <ul className={styles.list}>
            <li><strong>Оператор / Исполнитель / Продавец</strong> — ООО «СЕРВИС БОКС», указанное в разделе 1 настоящей оферты;</li>
            <li><strong>Заказчик / Покупатель</strong> — физическое лицо, акцептовавшее настоящую оферту в порядке, предусмотренном разделом 4;</li>
            <li><strong>Сайт</strong> — интернет-сайт, расположенный по адресу servicebox35.ru;</li>
            <li><strong>Услуги</strong> — услуги по диагностике, ремонту и техническому обслуживанию цифровой техники и периферийного компьютерного оборудования, оказываемые Исполнителем;</li>
            <li><strong>Товар</strong> — запасные части, комплектующие и аксессуары, предлагаемые к продаже на Сайте через разделы «Каталог запчастей» и корзину заказа;</li>
            <li><strong>Заказ</strong> — надлежащим образом оформленный запрос Заказчика на оказание Услуг и (или) запрос Покупателя на приобретение Товара;</li>
            <li><strong>Акцепт оферты</strong> — полное и безоговорочное принятие условий настоящей оферты способом, указанным в разделе 4.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Предмет оферты</h2>
          <p>
            3.1. Исполнитель обязуется оказать Заказчику услуги по диагностике и ремонту
            цифровой техники (смартфонов, ноутбуков, планшетов, телевизоров, видеокарт,
            игровых приставок и иного периферийного компьютерного оборудования), а
            Заказчик обязуется принять и оплатить указанные услуги на условиях
            настоящей оферты.
          </p>
          <p>
            3.2. Продавец обязуется передать в собственность Покупателя Товар,
            заказанный дистанционным способом через Сайт (каталог запчастей,
            корзина, оформление заказа), а Покупатель обязуется принять и оплатить
            Товар на условиях настоящей оферты, в соответствии со статьёй 497
            Гражданского кодекса Российской Федерации и Правилами продажи товаров
            дистанционным способом.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Порядок заключения договора (акцепт оферты)</h2>
          <p>Договор считается заключённым и настоящая оферта — акцептованной с момента наступления одного из следующих событий:</p>
          <ul className={styles.list}>
            <li>оформления и оплаты Заказа Товара в корзине на Сайте;</li>
            <li>оформления заявки на ремонт через Сайт, по телефону или в офисе Исполнителя с последующей передачей техники Исполнителю и получением приёмной квитанции (наряд-заказа);</li>
            <li>внесения предоплаты или полной оплаты стоимости Услуг или Товара любым из способов, указанных в разделе 5.</li>
          </ul>
          <p>
            С момента акцепта Заказчик подтверждает, что ознакомлен и согласен со
            всеми условиями настоящей оферты в действующей на момент акцепта редакции.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Цена и порядок оплаты</h2>
          <p>
            5.1. Стоимость Услуг определяется прайс-листом, размещённым на Сайте, либо
            по результатам бесплатной диагностики — индивидуально, о чём Заказчик
            уведомляется до начала работ.
          </p>
          <p>
            5.2. Стоимость Товара указывается на Сайте на момент оформления Заказа и
            может быть изменена Продавцом в одностороннем порядке до момента оформления
            Заказа Покупателем. Стоимость уже оформленного Заказа изменению не подлежит.
          </p>
          <p>5.3. Оплата производится одним из следующих способов:</p>
          <ul className={styles.list}>
            <li>наличными денежными средствами в офисе Исполнителя;</li>
            <li>банковской картой при безналичном расчёте;</li>
            <li>через Систему быстрых платежей (СБП);</li>
            <li>оплата долями через сервис «Яндекс Сплит».</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Права и обязанности сторон</h2>
          <p><strong>Исполнитель / Продавец обязуется:</strong></p>
          <ul className={styles.list}>
            <li>оказать Услуги или передать Товар надлежащего качества в согласованные сроки;</li>
            <li>информировать Заказчика о ходе выполнения Услуг и статусе Заказа;</li>
            <li>предоставлять достоверную информацию о Товарах и Услугах, их стоимости и сроках.</li>
          </ul>
          <p><strong>Заказчик / Покупатель обязуется:</strong></p>
          <ul className={styles.list}>
            <li>предоставлять достоверные данные, необходимые для оформления Заказа;</li>
            <li>своевременно оплатить Услуги или Товар на условиях раздела 5;</li>
            <li>принять результат оказанных Услуг или Товар в разумный срок после уведомления о готовности.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>7. Порядок оказания услуг и передачи товара</h2>
          <p>
            7.1. Ориентировочные сроки ремонта сообщаются Заказчику при приёме техники
            и фиксируются в наряд-заказе; при выявлении дополнительных неисправностей
            в процессе диагностики сроки могут быть скорректированы по согласованию
            с Заказчиком.
          </p>
          <p>
            7.2. Товар передаётся Покупателю способом, выбранным при оформлении Заказа
            (самовывоз из офиса Исполнителя либо доставка курьерской службой).
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Гарантийные обязательства</h2>
          <p>
            Гарантия на выполненные работы и заменённые запасные части предоставляется
            в соответствии с наряд-заказом (гарантийным талоном), выдаваемым Заказчику
            при получении техники, а также в соответствии с Федеральным законом от
            07.02.1992 № 2300-1 «О защите прав потребителей». Гарантия не распространяется
            на неисправности, возникшие вследствие механических повреждений, попадания
            влаги или нарушения правил эксплуатации после выдачи техники Заказчику.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Ответственность сторон</h2>
          <p>
            За неисполнение или ненадлежащее исполнение обязательств по настоящей
            оферте стороны несут ответственность в соответствии с законодательством
            Российской Федерации. Исполнитель не несёт ответственности за данные,
            хранящиеся на технике Заказчика, и рекомендует создавать резервные копии
            перед сдачей техники в ремонт.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Обстоятельства непреодолимой силы</h2>
          <p>
            Стороны освобождаются от ответственности за полное или частичное
            неисполнение обязательств по настоящей оферте, если оно явилось следствием
            обстоятельств непреодолимой силы (форс-мажор), возникших после акцепта
            оферты и которые стороны не могли предвидеть или предотвратить разумными мерами.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Срок действия и изменение оферты</h2>
          <p>
            Настоящая оферта действует бессрочно с момента размещения на Сайте до
            момента её отзыва или замены новой редакцией. Оператор вправе в любой
            момент внести изменения в условия оферты; новая редакция применяется
            к Заказам, оформленным после её публикации на Сайте, и не имеет
            обратной силы для ранее заключённых договоров.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Порядок разрешения споров</h2>
          <p>
            Все споры и разногласия, возникающие в связи с исполнением настоящей
            оферты, разрешаются путём переговоров с обязательным соблюдением
            претензионного порядка. Срок рассмотрения претензии — 30 (тридцать)
            календарных дней с даты её получения Оператором. При недостижении
            согласия спор передаётся на рассмотрение суда по месту нахождения Оператора
            в порядке, установленном законодательством Российской Федерации.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Реквизиты сторон</h2>
          <div className={styles.contactInfo}>
            <p><strong>Общество с ограниченной ответственностью «СЕРВИС БОКС»</strong></p>
            <p><strong>Юридический адрес:</strong> 160029, Вологодская область, г Вологда, Северная ул, д. 7а, офис 405</p>
            <p><strong>ОГРН:</strong> 1213500018522</p>
            <p><strong>ИНН:</strong> 3525475916</p>
            <p><strong>КПП:</strong> 352501001</p>
            <p><strong>Электронная почта:</strong> 508828@bk.ru</p>
            <p><strong>Телефон:</strong> +7 (911) 501-88-28, +7 (911) 501-06-96</p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p><strong>Дата последнего обновления:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
          <p><strong>Руководитель ООО «СЕРВИС БОКС»:</strong> Кознов А.В.</p>
        </footer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/oferta/page.js
git commit -m "feat: add public offer page content"
```

---

### Task 3: Metadata (`layout.js`)

**Files:**
- Create: `src/app/oferta/layout.js`

**Interfaces:**
- Consumes: `BASE_URL`, `BUSINESS` from `@/lib/constants` (same import used by `src/app/privacy-policy/layout.js`).
- Produces: `metadata` export consumed by Next.js App Router; `OfertaLayout` default export wrapping `page.js` from Task 2.

- [ ] **Step 1: Create `layout.js`**

```javascript
import { BASE_URL, BUSINESS } from '@/lib/constants';

export const metadata = {
  title: 'Публичная оферта | ServiceBox35',
  description: 'Публичная оферта сервисного центра ServiceBox35 в Вологде: условия оказания услуг по ремонту техники и дистанционной продажи запчастей.',
  alternates: {
    canonical: `${BASE_URL}/oferta`,
  },
  openGraph: {
    title: 'Публичная оферта — ServiceBox35',
    description: 'Публичная оферта сервисного центра ServiceBox35.',
    type: 'website',
    url: `${BASE_URL}/oferta`,
    siteName: BUSINESS.shortName,
  },
};

export default function OfertaLayout({ children }) {
  return children;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/oferta/layout.js
git commit -m "feat: add metadata for public offer page"
```

---

### Task 4: Footer link

**Files:**
- Modify: `src/components/Footer/Footer.js:117-119`

**Interfaces:**
- Consumes: nothing new — reuses existing `styles.footerLink` / `styles.privacyLink` classes already defined in `src/components/Footer/Footer.module.css` (lines 44 and 112).

- [ ] **Step 1: Add the offer link after the privacy-policy link**

In `src/components/Footer/Footer.js`, change:

```javascript
          <Link href="/privacy-policy" className={`${styles.footerLink} ${styles.privacyLink}`}>
            Политика конфиденциальности
          </Link>
```

to:

```javascript
          <Link href="/privacy-policy" className={`${styles.footerLink} ${styles.privacyLink}`}>
            Политика конфиденциальности
          </Link>
          <Link href="/oferta" className={`${styles.footerLink} ${styles.privacyLink}`}>
            Публичная оферта
          </Link>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer/Footer.js
git commit -m "feat: link public offer page from footer"
```

---

### Task 5: Build and manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the production build to catch any JSX/import errors**

Run: `npm run build`
Expected: build completes with no errors related to `src/app/oferta/*` or `src/components/Footer/Footer.js`.

- [ ] **Step 2: Start the dev server and visually verify**

Run: `npm run dev`

Open `http://localhost:3000/oferta` and confirm:
- All 13 sections render in order with headings matching the spec's section list (`docs/superpowers/specs/2026-07-24-public-offer-design.md`).
- Company details (ОГРН, ИНН, КПП, address, director, email) match what's shown on `http://localhost:3000/privacy-policy`.
- Page title tab shows "Публичная оферта | ServiceBox35".

Open `http://localhost:3000/` (any page with the footer) and confirm:
- "Публичная оферта" link appears directly under "Политика конфиденциальности" in the "О компании" footer column.
- Clicking it navigates to `/oferta`.

- [ ] **Step 3: Stop the dev server**

No commit needed for this task — it's verification only.
