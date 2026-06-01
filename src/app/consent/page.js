// app/consent/page.jsx
// app/consent/page.jsx
'use client';

import { useState } from 'react';
import styles from './Consent.css';

export default function Consent() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Функция для генерации и скачивания PDF
  const handleDownloadPDF = () => {
    setIsGenerating(true);

    // Создаем HTML-содержимое для PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Согласие на обработку персональных данных - ООО "СЕРВИСБОКС"</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #2c3e50;
            text-align: center;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          h2 {
            color: #2c3e50;
            margin-top: 30px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          .company-info {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .contact-info {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin-bottom: 8px;
          }
          .signature {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #333;
          }
          .print-only {
            display: none;
          }
          @media print {
            body {
              font-size: 12pt;
            }
            .no-print {
              display: none;
            }
            .print-only {
              display: block;
              text-align: center;
              font-size: 10pt;
              color: #666;
              margin-top: 30px;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-only">
          Документ сгенерирован с сайта servicebox35.ru<br>
          Дата: ${new Date().toLocaleDateString('ru-RU')}
        </div>
        
        <h1>Согласие на обработку персональных данных</h1>
        
        <div class="company-info">
          <h2>Оператор персональных данных</h2>
          <p><strong>ООО "СЕРВИСБОКС"</strong></p>
          <p><strong>ОГРН:</strong> 1213500018522 от 14 декабря 2021 г.</p>
          <p><strong>ИНН/КПП:</strong> 3525475916 / 352501001</p>
          <p><strong>Дата регистрации:</strong> 14.12.2021</p>
          <p><strong>Юридический адрес:</strong> 160029, Вологодская область, г. Вологда, Северная ул., д. 7а, офис 405</p>
          <p><strong>Фактический адрес:</strong> 160029, Вологодская область, г. Вологда, Северная ул., д. 7а, 1 этаж на против эскалатора</p>
          <p><strong>Руководитель:</strong> Генеральный директор Кознов Андрей Викторович</p>
          
          <div class="contact-info">
            <p><strong>Телефоны:</strong> +7 (911) 501-88-28, +7 (911) 501-06-96</p>
            <p><strong>Электронная почта:</strong> 508828@bk.ru</p>
          </div>
        </div>
        
        <div class="section">
          <p>Настоящим я даю согласие Обществу с ограниченной ответственностью "СЕРВИСБОКС" на обработку моих персональных данных в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».</p>
        </div>
        
        <div class="section">
          <h2>1. Перечень персональных данных</h2>
          <p>Я даю согласие на обработку следующих персональных данных:</p>
          <ul>
            <li>Фамилия, имя, отчество;</li>
            <li>Контактный телефон;</li>
            <li>Адрес электронной почты;</li>
            <li>Иная информация, предоставляемая мной при заполнении форм на сайте.</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>2. Цели обработки</h2>
          <p>Обработка осуществляется в следующих целях:</p>
          <ul>
            <li>Обработка моих заявок и обращений;</li>
            <li>Оказание услуг и выполнение обязательств;</li>
            <li>Информирование о новых услугах и акциях;</li>
            <li>Проведение маркетинговых исследований.</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>3. Способы обработки</h2>
          <p>Обработка может осуществляться как автоматизированными, так и неавтоматизированными способами.</p>
        </div>
        
        <div class="section">
          <h2>4. Срок действия согласия</h2>
          <p>Согласие действует в течение <strong>5 лет</strong> с момента его предоставления. По истечении указанного срока действие согласия считается продленным на каждые следующие 5 лет при отсутствии моего отзыва.</p>
        </div>
        
        <div class="section">
          <h2>5. Отзыв согласия</h2>
          <p>Я имею право отозвать настоящее согласие путем направления письменного заявления по адресу: 160029, Вологодская область, г. Вологда, Северная ул., д. 7а, 1 этаж напротив эскалатора или на email: 508828@bk.ru</p>
        </div>
        
        <div class="signature">
          <p><strong>Подпись субъекта персональных данных:</strong> ____________________</p>
          <p><strong>ФИО полностью:</strong> _________________________________________</p>
          <p><strong>Дата:</strong> «___» ___________ 20___ г.</p>
        </div>
        
        <div class="print-only">
          <p>Страница 1 из 1</p>
        </div>
      </body>
      </html>
    `;

    // Создаем Blob из HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = `Согласие_на_обработку_ПДн_ООО_СЕРВИСБОКС_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Освобождаем ресурсы
    URL.revokeObjectURL(url);
    setIsGenerating(false);
  };

  // Функция для печати страницы
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.headerActions}>
          <div className={styles.actions}>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className={`${styles.downloadBtn} ${isGenerating ? styles.disabled : ''}`}
            >
              {isGenerating ? (
                <>
                  <span className={styles.spinner}></span>
                  Генерация...
                </>
              ) : (
                <>
                  <svg className={styles.icon} viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19,9H15V3H9V9H5L12,16L19,9M5,18V20H19V18H5Z" />
                  </svg>
                  Скачать согласие (HTML)
                </>
              )}
            </button>


          </div>
        </div>

        <h1 className={styles.title}>Согласие на обработку персональных данных</h1>

        <div className={styles.consentForm}>
          <div className={styles.companyInfo}>
            <h2 className={styles.companyTitle}>Оператор персональных данных</h2>
            <div className={styles.companyDetails}>
              <p><strong>ООО "СЕРВИСБОКС"</strong></p>
              <p><strong>ОГРН:</strong> 1213500018522 от 14 декабря 2021 г.</p>
              <p><strong>ИНН/КПП:</strong> 3525475916 / 352501001</p>
              <p><strong>Дата регистрации:</strong> 14.12.2021</p>
              <p><strong>Уставный капитал:</strong> 10 000 руб.</p>
              <p><strong>Юридический адрес:</strong> 160029, Вологодская область, г. Вологда, Северная ул., д. 7а, офис 405</p>
              <p><strong>Фактический адрес:</strong> 160029, Вологодская область, г. Вологда, Северная ул., д. 7а, 1 этаж, на против эскалатора</p>
              <p><strong>Руководитель:</strong> Генеральный директор Кознов Андрей Викторович (с 14 декабря 2021 г.)</p>
              <p><strong>Статус МСП:</strong> Микропредприятие (присвоен 10 января 2022 г.)</p>
              <p><strong>Основной вид деятельности:</strong> 95.11 - Ремонт компьютеров и периферийного компьютерного оборудования</p>
              <p><strong>Налоговый орган:</strong> Управление ФНС России по Вологодской области (с 18 сентября 2023 г.)</p>
            </div>

            <div className={styles.contactInfo}>
              <h3>Контактная информация:</h3>
              <p><strong>Телефоны:</strong> +7 (911) 501-88-28, +7 (911) 501-06-96</p>
              <p><strong>Электронная почта:</strong> 508828@bk.ru</p>
              <p><strong>Сайт:</strong> servicebox35.ru</p>
            </div>
          </div>

          <p className={styles.intro}>
            Настоящим я даю согласие Обществу с ограниченной ответственностью "СЕРВИСБОКС"
            на обработку моих персональных данных в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
            «О персональных данных».
          </p>

          <section className={styles.section}>
            <h2>1. Перечень персональных данных</h2>
            <p>Я даю согласие на обработку следующих персональных данных:</p>
            <ul className={styles.list}>
              <li>Фамилия, имя, отчество;</li>
              <li>Контактный телефон;</li>
              <li>Адрес электронной почты;</li>
              <li>Иная информация, предоставляемая мной при заполнении форм на сайте.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. Цели обработки</h2>
            <p>Обработка осуществляется в следующих целях:</p>
            <ul className={styles.list}>
              <li>Обработка моих заявок и обращений;</li>
              <li>Оказание услуг и выполнение обязательств;</li>
              <li>Информирование о новых услугах и акциях;</li>
              <li>Проведение маркетинговых исследований.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Способы обработки</h2>
            <p>
              Обработка может осуществляться как автоматизированными,
              так и неавтоматизированными способами.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Срок действия согласия</h2>
            <p>
              Согласие действует в течение <strong>5 лет</strong> с момента его предоставления.
              По истечении указанного срока действие согласия считается продленным
              на каждые следующие 5 лет при отсутствии моего отзыва.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Отзыв согласия</h2>
            <p>
              Я имею право отозвать настоящее согласие путем направления
              письменного заявления по адресу: 160029, Вологодская область, г. Вологда, Северная ул., д. 7а<br />
              или на email: 508828@bk.ru
            </p>
          </section>

          <div className={styles.signatureBlock}>
            <div className={styles.signatureField}>
              <p><strong>Подпись субъекта персональных данных:</strong></p>
              <div className={styles.signatureLine}>____________________</div>
            </div>

            <div className={styles.signatureField}>
              <p><strong>ФИО полностью:</strong></p>
              <div className={styles.signatureLine}>_________________________________________</div>
            </div>

            <div className={styles.signatureField}>
              <p><strong>Дата:</strong></p>
              <div className={styles.signatureLine}>«___» ___________ 20___ г.</div>
            </div>
          </div>

          <div className={styles.acknowledgment}>
            <p>
              Нажимая кнопку «Согласиться» в формах на сайте,
              я подтверждаю, что ознакомлен(а) с текстом настоящего согласия
              и даю согласие на обработку моих персональных данных.
            </p>
          </div>


          <div className={styles.revisionInfo}>
            <p><strong>Дата последнего обновления:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
            <p><strong>Версия документа:</strong> 2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}