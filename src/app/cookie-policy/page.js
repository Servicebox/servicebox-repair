// app/cookie-policy/page.js
import Link from 'next/link';
import styles from '@/app/privacy-policy/PrivacyPolicy.module.css';

export const metadata = {
  title: 'Политика использования файлов Cookie — СЕРВИС БОКС',
  description: 'Информация о файлах cookie, используемых на сайте ООО «СЕРВИС БОКС».',
};

export default function CookiePolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Политика использования файлов Cookie</h1>
          <div className={styles.meta}>
            <p>ООО «СЕРВИС БОКС»</p>
            <p>Дата последнего обновления: июнь 2025 г.</p>
          </div>
        </header>

        {/* 1. Что такое cookie */}
        <section className={styles.section}>
          <h2>1. Что такое файлы cookie</h2>
          <p>
            Файлы cookie — это небольшие текстовые файлы, которые сохраняются на вашем
            устройстве (компьютере, смартфоне или планшете) при посещении веб-сайтов.
            Они помогают сайту запоминать ваши настройки и предпочтения, обеспечивают
            корректную работу функций авторизации и позволяют анализировать трафик.
          </p>
          <p>
            Файлы cookie не содержат вирусов и не могут самостоятельно запускать программы
            на вашем устройстве. Подробнее об обработке персональных данных читайте в нашей{' '}
            <Link href="/privacy-policy" style={{ color: '#2563eb' }}>
              Политике конфиденциальности
            </Link>.
          </p>
        </section>

        {/* 2. Какие cookie мы используем */}
        <section className={styles.section}>
          <h2>2. Какие файлы cookie мы используем</h2>
          <p>
            На нашем сайте используются следующие категории файлов cookie:
          </p>

          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
              color: '#374151',
            }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={thStyle}>Тип</th>
                  <th style={thStyle}>Название</th>
                  <th style={thStyle}>Цель</th>
                  <th style={thStyle}>Срок хранения</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Необходимые</td>
                  <td style={tdStyle}><code>token</code></td>
                  <td style={tdStyle}>Хранит JWT-токен для аутентификации пользователя</td>
                  <td style={tdStyle}>До выхода из системы / 30 дней</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={tdStyle}>Необходимые</td>
                  <td style={tdStyle}><code>yandex_oauth_state</code></td>
                  <td style={tdStyle}>Защита OAuth-потока при авторизации через Яндекс (CSRF-защита)</td>
                  <td style={tdStyle}>Сессия (удаляется после завершения авторизации)</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Аналитические</td>
                  <td style={tdStyle}>Анонимные идентификаторы</td>
                  <td style={tdStyle}>Подсчёт анонимного трафика, анализ посещаемости страниц</td>
                  <td style={tdStyle}>До 1 года</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className={styles.companyInfo}>
              <h3>Необходимые файлы cookie</h3>
              <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                Эти файлы cookie необходимы для работы сайта и не могут быть отключены.
                Они устанавливаются только в ответ на ваши действия (вход в систему,
                авторизация через Яндекс). Они не содержат персональных данных,
                позволяющих вас идентифицировать без авторизации.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div className={styles.companyInfo} style={{ borderLeftColor: '#0ea5e9' }}>
              <h3>Аналитические файлы cookie</h3>
              <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                Используются для подсчёта числа посетителей и анализа источников трафика.
                Все данные обрабатываются анонимно. Вы можете отказаться от аналитических
                cookie в баннере согласия на сайте.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Управление cookie */}
        <section className={styles.section}>
          <h2>3. Как управлять файлами cookie</h2>
          <p>
            Вы можете управлять своими предпочтениями по cookie следующими способами:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Баннер согласия на сайте</strong> — при первом посещении
              отображается баннер, в котором вы можете принять все cookie, выбрать
              только необходимые или настроить каждую категорию отдельно.
            </li>
            <li>
              <strong>Настройки браузера</strong> — большинство браузеров позволяют
              блокировать или удалять файлы cookie. Обратите внимание: отключение
              необходимых cookie может нарушить работу функций авторизации на сайте.
            </li>
            <li>
              <strong>Инструменты браузеров:</strong>
              Chrome: <em>Настройки → Конфиденциальность → Файлы cookie</em>;
              Firefox: <em>Настройки → Приватность и защита → Куки</em>;
              Safari: <em>Настройки → Конфиденциальность</em>.
            </li>
          </ul>
          <p>
            Отзыв согласия на аналитические cookie не влияет на законность обработки
            данных, осуществлённой до отзыва.
          </p>
        </section>

        {/* 4. Изменения */}
        <section className={styles.section}>
          <h2>4. Изменения в политике</h2>
          <p>
            ООО «СЕРВИС БОКС» оставляет за собой право вносить изменения в настоящую
            Политику использования файлов cookie. При существенных изменениях мы
            уведомим вас путём размещения обновлённой версии на сайте с указанием
            новой даты вступления в силу. Продолжение использования сайта после
            публикации изменений означает ваше согласие с обновлённой политикой.
          </p>
        </section>

        {/* 5. Контакты */}
        <section className={styles.section}>
          <h2>5. Контакты</h2>
          <p>
            Если у вас возникли вопросы, связанные с использованием файлов cookie,
            вы можете обратиться к нам:
          </p>
          <div className={styles.contactInfo}>
            <p><strong>ООО «СЕРВИС БОКС»</strong></p>
            <p>160029, Вологодская область, г. Вологда, Северная ул., д. 7а, офис 405</p>
            <p>
              Email:{' '}
              <a href="mailto:info@servicebox35.ru" style={{ color: '#2563eb' }}>
                info@servicebox35.ru
              </a>
            </p>
            <p>
              Также см.{' '}
              <Link href="/privacy-policy" style={{ color: '#2563eb' }}>
                Политику конфиденциальности
              </Link>{' '}
              для получения дополнительной информации об обработке персональных данных.
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} ООО «СЕРВИС БОКС». Все права защищены.</p>
          <p>
            <Link href="/privacy-policy" style={{ color: '#2563eb' }}>
              Политика конфиденциальности
            </Link>
            {' · '}
            <Link href="/" style={{ color: '#2563eb' }}>
              На главную
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#374151',
  borderBottom: '2px solid #e2e8f0',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 14px',
  borderBottom: '1px solid #e2e8f0',
  color: '#6b7280',
  verticalAlign: 'top',
};
