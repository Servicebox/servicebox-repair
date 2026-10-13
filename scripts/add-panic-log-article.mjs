// scripts/add-panic-log-article.mjs
//
// Разовый скрипт: публикует справочную статью «Panic Log в iPhone» в коллекцию
// news напрямую через Mongo (минуя админку), по аналогии с другими скриптами
// в этой папке. Идемпотентен по slug — повторный запуск без --force обновит
// существующий документ вместо дублирования.
//
// Запуск:
//   node scripts/add-panic-log-article.mjs            # локально (.env.local)
//   node scripts/add-panic-log-article.mjs --prod      # против .env.production

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.argv.includes('--prod') ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '..', envFile), quiet: true });

const SLUG = 'panic-log-iphone';

// NewsDetail дословно заменяет "\n" на "<br>" в text-блоках (рассчитано на
// простой пользовательский текст, а не на HTML). Здесь контент — готовая
// HTML-разметка с собственными <br> там, где перенос нужен по смыслу, поэтому
// переносы строк исходника (используются только для читаемости кода) нужно
// схлопнуть в пробел — иначе абзацы ломаются принудительными <br> ровно по
// месту переноса в коде скрипта, а не по ширине контейнера в браузере.
const clean = (s) => s.replace(/\s*\n\s*/g, ' ').replace(/>\s+</g, '><').trim();

const cap = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

let position = 0;
const blocks = [];
const heading = (content) => blocks.push({ type: 'heading', content, position: position++ });
const text = (content) => blocks.push({ type: 'text', content: clean(content), position: position++ });
const image = (media, { description, alt } = {}) =>
  blocks.push({ type: 'image', media, description, alt, position: position++ });

text(`
  <p>Если iPhone в последнее время то и дело перезагружается сам по себе, зависает на экране с
  логотипом Apple или вообще уходит в циклическую перезагрузку — обычно это не случайность.
  Система уже зафиксировала критический сбой ядра (kernel panic) и сохранила отчёт о нём —
  файл <strong>panic-full</strong>. Внутри этого отчёта почти всегда спрятана подсказка, какой
  именно узел внутри телефона подвёл: шлейф, датчик, контроллер питания или сама плата.</p>
  <p>Ниже — пошаговая инструкция, как найти этот файл на самом iPhone, прочитать нужный маркер
  и сопоставить его с конкретной неисправностью. Таблицы ниже охватывают модели от iPhone 11
  до iPhone 17 — у разных поколений формат кода отличается.</p>
`);

heading('Где на iPhone искать panic-full');
text(`
  <ol>
    <li>Откройте приложение <strong>«Настройки»</strong>.</li>
    <li>Перейдите в раздел <strong>«Конфиденциальность и безопасность»</strong>.</li>
    <li>Прокрутите список до самого низа и откройте <strong>«Аналитика и улучшения»</strong>.</li>
    <li>Нажмите <strong>«Данные аналитики»</strong>.</li>
    <li>В списке файлов ищите те, что начинаются с <code>panic-full-</code>. Не путайте их с
      <code>JetsamEvent</code> — это отчёты о нехватке памяти, а не о перезагрузках.</li>
    <li>Откройте самый свежий (верхний) файл с этим префиксом.</li>
    <li>Зажмите текст, выделите всё содержимое и скопируйте. Лог длинный и неудобный для чтения
      на маленьком экране — лучше переслать его себе и открыть на компьютере.</li>
  </ol>
`);

heading('Как читать panic-full');
text(`
  <p>Файл забит технической информацией, но искать в нём нужно всего один маркер — тот, что
  указывает на конкретный неисправный узел. В зависимости от возраста iPhone этот маркер
  выглядит по-разному.</p>
  <p><strong>На iPhone 11, 12 и более старых моделях</strong> ошибка текстовая. Ищите фразу вида
  <code>Missing sensor(s):</code>, <code>AOP PANIC</code> или прямое название датчика —
  например, <code>mic2</code>, <code>Prs0</code>, <code>TG0B</code>.</p>
  <p><strong>На iPhone 13 и новее</strong> вместо текста используется числовой код. Ищите строку
  рядом со словами <code>SMC PANIC - ASSERTION FAILED</code> и <code>Sensor array</code> — она
  выглядит примерно так:</p>
  <blockquote><p><code>S.sensor array 0 - 3 is 0x0, 0x400000, 0x0, 0x0</code></p></blockquote>
  <p>Последнее ненулевое значение в этой строке (в примере выше — <code>0x400000</code>) и есть
  искомый код неисправности, который нужно сверить с таблицей для вашей модели.</p>
`);

image('/uploads/news/1791916123262-137b9bfc50.jpg', {
  alt: 'Реальный panic-full лог на экране iPhone со строкой sensor array и выделенным кодом 524288',
  description:
    'Так выглядит эта строка на реальном устройстве: «S.sensor array 0 - 7 is 0, 524288, 0, 0, 0, 0». ' +
    'Код 524288 — это 0x80000 в hex; по таблице для 16 Pro ниже это «нет ответа от гироскопа».',
});

heading('Таблицы кодов по моделям iPhone');
text(`
  <p>Ниже — коды и фразы, которые реально встречаются в логах iPhone 11–17 серии, и что за ними
  обычно стоит на практике. Это ориентир для первичной диагностики: окончательный диагноз всегда
  лучше подтверждать очным осмотром на столе мастера.</p>
`);

text(`
  <h3>iPhone 11, 11 Pro, 11 Pro Max</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Фраза в логе</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>mic2</td><td>Задний микрофон — находится на шлейфе кнопки питания вместе со вспышкой. Самая частая причина перезагрузок на iPhone 11.</td></tr>
      <tr><td>userspace watchdog timeout</td><td>Сторожевой таймер не дождался ответа от одного из датчиков или служб. Часто указывает на нижний шлейф зарядки или кнопку питания.</td></tr>
      <tr><td>Prs0</td><td>Барометр — находится на нижнем шлейфе зарядки.</td></tr>
      <tr><td>Mic1</td><td>Нижний левый микрофон — на нижнем шлейфе зарядки.</td></tr>
      <tr><td>TG0B / TG0V</td><td>Проблема с батареей: коннектор или контроллер Tigris на плате.</td></tr>
      <tr><td>Speaker Panic</td><td>Ошибка динамика — обрыв шлейфа или повреждение самого динамика.</td></tr>
      <tr><td>No Mic Detected</td><td>Система не видит микрофон — обрыв шлейфа или окисление контактов.</td></tr>
      <tr><td>Backlight Fault</td><td>Ошибка подсветки дисплея — обрыв шлейфа подсветки или сбой контроллера.</td></tr>
      <tr><td>Taptic Engine Failure</td><td>Ошибка вибромотора — обрыв шлейфа или повреждение мотора.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 12, 12 Pro, 12 Pro Max</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Фраза / код в логе</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>panic flag 0x882</td><td>Температурные датчики либо проблема с портом зарядки — требует уточнения при диагностике.</td></tr>
      <tr><td>mic1, mic2, mic3, mic4</td><td>Микрофоны: mic1 — нижний левый, mic2 — у вспышки, mic3 — фронтальный, mic4 — нижний правый.</td></tr>
      <tr><td>Proximity Mic Fault</td><td>Ошибка микрофона датчика приближения — возможно повреждение шлейфа фронтальной камеры.</td></tr>
      <tr><td>Audio CODEC Failure</td><td>Сбой аудиокодека — короткое замыкание или повреждение чипа.</td></tr>
    </tbody>
  </table></div>
`);

heading('iPhone 13–17: цифровые hex-коды');
text(`
  <p>Начиная с iPhone 13 вместо фраз используются шестнадцатеричные коды. У каждого поколения —
  своя раскладка, поэтому сверяйтесь строго с таблицей для своей модели.</p>
`);

text(`
  <h3>iPhone 13 mini, 13, 13 Pro, 13 Pro Max</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>0x1000</td><td>Шлейф датчиков на дисплее (Front Sensor Assembly).</td></tr>
      <tr><td>0x800</td><td>Нижний шлейф зарядки (Charge Port Assembly).</td></tr>
      <tr><td>0x40000</td><td>Проблема с линией передачи данных аккумулятора.</td></tr>
      <tr><td>0x400</td><td>Только iPhone 13 mini — гироскоп на нижней плате.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 14, 14 Plus</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>0x100000</td><td>Нижний шлейф зарядки.</td></tr>
      <tr><td>0x200000</td><td>Шлейф датчиков на дисплее.</td></tr>
      <tr><td>0x400000</td><td>Шлейф катушки беспроводной зарядки.</td></tr>
      <tr><td>0x500000</td><td>Составной код: аккумулятор, либо одновременно нижний шлейф + беспроводная зарядка — см. метод вычитания ниже.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 14 Pro, 14 Pro Max</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>0x41</td><td>Датчик аккумулятора.</td></tr>
      <tr><td>0x20000</td><td>Гироскоп на нижней плате.</td></tr>
      <tr><td>0x40000</td><td>Нижний шлейф зарядки.</td></tr>
      <tr><td>0x80000</td><td>Шлейф датчиков на дисплее.</td></tr>
      <tr><td>0x100000</td><td>Шлейф кнопки питания.</td></tr>
      <tr><td>0x140000</td><td>Составной код: кнопка питания + нижний шлейф.</td></tr>
      <tr><td>0xC0000</td><td>Составной код: нижний шлейф + шлейф дисплея.</td></tr>
      <tr><td>0x1C0000</td><td>Составной код: кнопка питания + нижний шлейф + шлейф дисплея.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 15, 15 Plus</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>0x80000</td><td>Нижний шлейф зарядки.</td></tr>
      <tr><td>0x100000</td><td>Шлейф датчиков на дисплее.</td></tr>
      <tr><td>0x200000</td><td>Шлейф беспроводной зарядки.</td></tr>
      <tr><td>0x280000</td><td>Составной код: нижний шлейф + беспроводная зарядка.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 15 Pro, 15 Pro Max</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>0xa1</td><td>Датчик аккумулятора.</td></tr>
      <tr><td>0x300000</td><td>Нижний шлейф зарядки.</td></tr>
      <tr><td>0x400000</td><td>Шлейф беспроводной зарядки.</td></tr>
      <tr><td>0x600000</td><td>Не одиночный код — скорее всего сумма нескольких известных кодов этой модели. Раскладывайте методом вычитания ниже.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 16, 16 Plus</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (DEC)</th><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>169</td><td>0xA9</td><td>Проблема с определением данных аккумулятора.</td></tr>
      <tr><td>524288</td><td>0x80000</td><td>Нет ответа от барометра.</td></tr>
      <tr><td>1048576</td><td>0x100000</td><td>Нет ответа от компаса.</td></tr>
      <tr><td>1572864</td><td>0x180000</td><td>Нет ответа от барометра и компаса — обычно отключённый нижний шлейф.</td></tr>
      <tr><td>2097152</td><td>0x200000</td><td>Повреждён шлейф беспроводной зарядки.</td></tr>
      <tr><td>2621440</td><td>0x280000</td><td>Составной код: шлейф зарядки + нет барометра.</td></tr>
      <tr><td>3145728</td><td>0x300000</td><td>Составной код: шлейф зарядки + нет компаса.</td></tr>
      <tr><td>3670016</td><td>0x380000</td><td>Составной код: шлейф зарядки + нет барометра и компаса.</td></tr>
      <tr><td colspan="2">apcie[0:wlan]::handleCompletionTimeoutInterrupt</td><td>Проблема с модулем Wi-Fi.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 16 Pro, 16 Pro Max</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (DEC)</th><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>169</td><td>0xA9</td><td>Проблема с определением данных аккумулятора.</td></tr>
      <tr><td>524288</td><td>0x80000</td><td>Нет ответа от гироскопа.</td></tr>
      <tr><td>1048576</td><td>0x100000</td><td>Нет ответа от барометра.</td></tr>
      <tr><td>2097152</td><td>0x200000</td><td>Нет ответа от компаса.</td></tr>
      <tr><td>3145728</td><td>0x300000</td><td>Составной код: нет ответа от барометра и компаса.</td></tr>
      <tr><td>4194304</td><td>0x400000</td><td>Микросхема беспроводной зарядки под SIM-лотком.</td></tr>
    </tbody>
  </table></div>
`);

text(`
  <h3>iPhone 17, 17 Pro, 17 Pro Max</h3>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Код (DEC)</th><th>Код (HEX)</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>2097152</td><td>0x200000</td><td>Верхний шлейф (датчики дисплея).</td></tr>
      <tr><td>4194304</td><td>0x400000</td><td>Вибромотор (Taptic Engine).</td></tr>
      <tr><td>6291456</td><td>0x600000</td><td>Нижний шлейф зарядки.</td></tr>
      <tr><td>8388608</td><td>0x800000</td><td>Беспроводная зарядка.</td></tr>
      <tr><td>10485760</td><td>0xA00000</td><td>Составной код: верхний шлейф + беспроводная зарядка.</td></tr>
      <tr><td>14680064</td><td>0xE00000</td><td>Составной код: нижний шлейф + беспроводная зарядка.</td></tr>
      <tr><td colspan="2">AOP PANIC - UBSAN</td><td>Сбой Always-On Processor — новый тип паники именно для 17-й серии.</td></tr>
    </tbody>
  </table></div>
`);

heading('Составной код: как разложить его на компоненты');
text(`
  <p>Если число в массиве не совпадает ни с одной строкой таблицы один в один — это сумма
  нескольких кодов сразу, то есть неисправны сразу два (а иногда и больше) узла. Разложить такую
  сумму на составляющие помогает обычный метод вычитания с hex-калькулятором под рукой.</p>
  <ol>
    <li>Переключите калькулятор в инженерный режим / режим программиста (HEX).</li>
    <li>Найдите в таблице для своей модели самый большой код, который меньше либо равен итоговому значению.</li>
    <li>Вычтите его из итогового значения.</li>
    <li>С остатком повторите шаг 2 — и так, пока остаток не станет равен нулю.</li>
    <li>Все найденные таким образом коды — это и есть список подозреваемых узлов.</li>
  </ol>
  <blockquote>
    <p><strong>Пример 1. iPhone 14 Pro, код 0x140000.</strong><br>
    Самый большой подходящий код — <code>0x100000</code> (кнопка питания). Вычитаем:
    <code>0x140000 − 0x100000 = 0x40000</code> — это нижний шлейф зарядки.<br>
    Итог: неисправны <strong>кнопка питания</strong> и <strong>нижний шлейф</strong> одновременно.</p>
  </blockquote>
  <blockquote>
    <p><strong>Пример 2. iPhone 13, код 0x1800.</strong><br>
    Самый большой подходящий код — <code>0x1000</code> (шлейф датчиков дисплея). Вычитаем:
    <code>0x1800 − 0x1000 = 0x800</code> — это нижний шлейф зарядки.<br>
    Итог: неисправны <strong>шлейф датчиков дисплея</strong> и <strong>нижний шлейф</strong> одновременно.</p>
  </blockquote>
  <p>Так же стоит действовать с кодом <code>0x600000</code> на iPhone 15 Pro — он не встречается
  как одиночное значение и почти всегда оказывается суммой нескольких известных кодов. Если
  остаток после вычитания не сходится ни с одним кодом из таблицы — не гадайте, а отдайте телефон
  на аппаратную диагностику.</p>
`);

heading('Справочник текстовых ошибок panic-full');
text(`
  <p>Полная подборка текстовых маркеров, которые встречаются в логах iPhone 11–12 и более старых
  моделей, и что за ними обычно стоит на практике.</p>
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Фраза в логе</th><th>На что указывает</th></tr></thead>
    <tbody>
      <tr><td>AOP PANIC-Pressure Controller</td><td>Барометр. Обычно решается заменой нижнего шлейфа.</td></tr>
      <tr><td>ANS/ANS2</td><td>NAND-память. Требует перепрошивки с удалением данных.</td></tr>
      <tr><td>ANS/ANS2, recovarable</td><td>NAND-память. Решается перепрошивкой.</td></tr>
      <tr><td>SD: 0 Missing sensor(s): TG0B / TG0V</td><td>Батарея: коннектор платы или контроллер Tigris.</td></tr>
      <tr><td>AOP PANIC-SCMto:0-prox</td><td>Датчик приближения.</td></tr>
      <tr><td>AOP PANIC - No pulse on 0x11678a0 - power(2)</td><td>Кнопка питания или верхний шлейф.</td></tr>
      <tr><td>AOP PANIC - No pulse on 0x11678a0 - main(5)</td><td>Шлейф кнопок громкости или датчик приближения.</td></tr>
      <tr><td>AOP PANIC - SCMto:1 - prox(7)</td><td>Датчик приближения.</td></tr>
      <tr><td>AOP PANIC - SCMto:2 - pearl(6)</td><td>Питание датчика приближения.</td></tr>
      <tr><td>Kernel data abort</td><td>Процессор.</td></tr>
      <tr><td>Missing sensor(s): mic1</td><td>Нижний левый микрофон.</td></tr>
      <tr><td>Missing sensor(s): mic2</td><td>Микрофон у вспышки (задний).</td></tr>
      <tr><td>Missing sensor(s): mic3</td><td>Микрофон у фронтальной камеры.</td></tr>
      <tr><td>Missing sensor(s): mic4</td><td>Нижний правый микрофон.</td></tr>
      <tr><td>SD: 1 Missing sensor(s): Prs0</td><td>Барометр.</td></tr>
      <tr><td>AppleSocHot: hot hot hot</td><td>Процессор или контроллер питания — перегрев.</td></tr>
      <tr><td>L2C/LLC</td><td>Усилитель. Замена верхнего шлейфа или аудиокодека.</td></tr>
      <tr><td>Prev-next/LSU</td><td>Кварцевый генератор часов.</td></tr>
      <tr><td>NO pulse on</td><td>Вибромотор или нижний шлейф.</td></tr>
      <tr><td>nvme</td><td>Проблема с памятью.</td></tr>
      <tr><td>Lm3539</td><td>Драйвер подсветки. Обычно требует замены экрана.</td></tr>
      <tr><td>mic-temp-sens2</td><td>Микрофон у вспышки. Замена шлейфа вспышки.</td></tr>
      <tr><td>Kernel instruction fetch Abort</td><td>Процессор.</td></tr>
      <tr><td>SCL display PMU</td><td>Драйвер дисплея. Замена экрана.</td></tr>
      <tr><td>GFX GPU</td><td>Процессор.</td></tr>
      <tr><td>H3K5 Tglon</td><td>Аудиокодек или усилители.</td></tr>
      <tr><td>SMC PANIC ASSERTION</td><td>Верхний шлейф или процессор.</td></tr>
      <tr><td>SEP ROM to glon SMC DATA ABORT</td><td>Процессор, память или арбитратор.</td></tr>
      <tr><td>CP_COM_NORM REQUEST</td><td>Процессор, память или камера.</td></tr>
      <tr><td>Dart-disp SMMU error</td><td>Основная камера.</td></tr>
      <tr><td>Firmware fatal</td><td>Программный сбой.</td></tr>
      <tr><td>Initproc exited</td><td>Кварцевый генератор.</td></tr>
      <tr><td>Invalid queue element linkage</td><td>NAND-память.</td></tr>
      <tr><td>AGXG10P BONMI</td><td>Сбой на уровне слоёв платы.</td></tr>
      <tr><td>Apple tristar2</td><td>Контроллер Tristar (порт зарядки).</td></tr>
      <tr><td>PMP NMI FIQ power(1)-failed</td><td>Процессор, катушки или контроллер питания.</td></tr>
      <tr><td>Void applesynopsysMIPID SIC glontroller</td><td>Передний шлейф. Замена верхнего шлейфа.</td></tr>
      <tr><td>AppleBCMWLAN</td><td>Wi-Fi или Bluetooth.</td></tr>
      <tr><td>AOP PANIC</td><td>Неоднозначная ошибка — требует очной диагностики.</td></tr>
      <tr><td>Ememory</td><td>Память.</td></tr>
      <tr><td>Anc-postnand.c1260 asser failed link</td><td>Память.</td></tr>
      <tr><td>Stacks routined</td><td>Аккумулятор. Обычно решается заменой батареи.</td></tr>
      <tr><td>AGXK AGXAcceletor</td><td>Гироскоп или акселерометр.</td></tr>
      <tr><td>apcie(0)</td><td>Память.</td></tr>
      <tr><td>apcie(wlan)</td><td>Wi-Fi.</td></tr>
      <tr><td>apcie(bt)</td><td>Bluetooth.</td></tr>
      <tr><td>Protection Module error</td><td>Память или арбитратор.</td></tr>
      <tr><td>@AppleMultiFunction Manager</td><td>Модем.</td></tr>
      <tr><td>@AppleOLYHALPortinterface</td><td>Wi-Fi.</td></tr>
      <tr><td>@zalloc</td><td>Отвал процессора.</td></tr>
      <tr><td>@kalloc</td><td>Отвал процессора.</td></tr>
      <tr><td>DCP PANIC ASSERT!AppleDCPSynopsys MIPIDSIControlle</td><td>Дисплей или микросхема на нём.</td></tr>
      <tr><td>smc-charger (a, 4020001), portmicro (a.4020001)</td><td>Нижний шлейф.</td></tr>
      <tr><td>AOP Panic - [Eiger.cpp:6221]</td><td>Барометр.</td></tr>
      <tr><td>i2c2 ... for device audio-speaker-top</td><td>Верхний шлейф или усилитель.</td></tr>
      <tr><td>i2c3 ... for device Roswell</td><td>Экран: шлейф тача или сам дисплей.</td></tr>
      <tr><td>i2c3 ... for display-eeprom</td><td>Микросхема дисплея или сам дисплей.</td></tr>
      <tr><td>@AppleCS42L77Audio</td><td>Аудиокодек.</td></tr>
      <tr><td>@AppleCS42L75Audio</td><td>Аудиокодек.</td></tr>
      <tr><td>AOP Panic - unexpected i2c timeout- repair ap 12c worker(2)</td><td>Верхний шлейф.</td></tr>
      <tr><td>Dart-USB (0xffffffe495a38000)</td><td>Нижний шлейф или контроллеры питания.</td></tr>
      <tr><td>dxioVizc</td><td>Арбитратор.</td></tr>
      <tr><td>AOP Panic - Pressure queue blocked</td><td>Развал платы либо гироскоп.</td></tr>
      <tr><td>pmap_remove_pv</td><td>Аккумулятор или контроллер питания.</td></tr>
      <tr><td>Invalid kernel stack pointer</td><td>Видеоядро — иногда помогает реболл BGA.</td></tr>
      <tr><td>BAPES TREE LOOKUP ZONE</td><td>Память.</td></tr>
      <tr><td>Initproc failed to start</td><td>Разрыв связи между контроллером и процессором.</td></tr>
      <tr><td>AOP Panic Systick Watchog</td><td>Кнопка Home. Решается заменой кнопки.</td></tr>
      <tr><td>device ad5860-AppleS518940xi2c</td><td>Аудиопроцессор или аудиокодек.</td></tr>
      <tr><td>@vfs_cluster.c: 1061</td><td>Файловая система — требует перепрошивки.</td></tr>
      <tr><td>File Radar to: [launchd]</td><td>Системная ошибка. Перепрошивка с потерей данных.</td></tr>
      <tr><td>SIGNAL, code 9</td><td>Сбой прошивки или развал платы.</td></tr>
      <tr><td>Moly</td><td>Нижний шлейф или развал половинок платы.</td></tr>
      <tr><td>SpringBoard</td><td>Обычно решается перепрошивкой; если рядом SIGNAL — проблема с Wi-Fi.</td></tr>
      <tr><td>Stonehenge</td><td>Короткое замыкание. Требует замены нижней части платы.</td></tr>
      <tr><td>AOP PANIC - K2 - Bosch control channel write failure</td><td>Повреждение шлейфа динамика.</td></tr>
      <tr><td>AOP PANIC - UBSAN</td><td>Always-On Processor (встречается на iPhone 17).</td></tr>
      <tr><td>apcie[0:wlan]::handleCompletionTimeoutInterrupt</td><td>Проблема с модулем Wi-Fi (встречается на iPhone 16).</td></tr>
    </tbody>
  </table></div>
`);

heading('Редкие типы паник');
text(`
  <div class="panic-table-scroll"><table>
    <thead><tr><th>Тип паники</th><th>Причина и что обычно требуется</th></tr></thead>
    <tbody>
      <tr><td>AP Watchdog timeout</td><td>Система не дождалась ответа от процессора. Причины: перегрев, неисправность NAND, проблемы питания.</td></tr>
      <tr><td>Baseband Panic / modem fault</td><td>Сбой прошивки модема. Часто — окисление антенного модуля после попадания влаги.</td></tr>
      <tr><td>Display TCON Panic</td><td>Сбой контроллера дисплея. Неоригинальный экран или повреждённый шлейф.</td></tr>
      <tr><td>PMU Panic / Power Manager Timeout</td><td>Сбой контроллера питания: короткое замыкание либо выход из строя PMIC.</td></tr>
      <tr><td>USB PANIC: overcurrent detected</td><td>Перегрузка по току на порту зарядки — окисление Lightning или сгоревший Tristar.</td></tr>
      <tr><td>SEP Panic</td><td>Ошибка Secure Enclave Processor — критический сбой безопасности, как правило требует замены платы.</td></tr>
    </tbody>
  </table></div>
`);

heading('Что делать с результатом');
text(`
  <ol>
    <li><strong>Нашли цифровой код —</strong> сверьте его с таблицей для своей модели. В
      подавляющем большинстве случаев проблема в соответствующем шлейфе или компоненте, и его
      замена снимает проблему.</li>
    <li><strong>Нашли текстовую ошибку —</strong> действуйте так же, сверяясь со справочником
      текстовых ошибок выше.</li>
    <li><strong>Код составной —</strong> разложите его методом вычитания, чтобы понять, сколько
      узлов неисправно одновременно.</li>
    <li><strong>Замена шлейфа не помогла —</strong> вероятно, дело в самом разъёме на плате или в
      её повреждении, особенно после попадания влаги. На этом этапе без мультиметра и прогрева уже не
      обойтись.</li>
    <li><strong>SEP Panic или критическая ошибка процессора —</strong> велика вероятность, что
      потребуется замена всей логической платы.</li>
  </ol>
  <blockquote><p><strong>Важно:</strong> не спешите сразу перепрошивать телефон. Если причина
  аппаратная, перепрошивка не поможет, зато сотрёт данные — а заодно и сам лог, который так
  пригодился бы для диагностики.</p></blockquote>
  <p>Если после всех таблиц и вычитаний всё ещё непонятно, что конкретно сломалось — это
  нормально: часть кодов пересекается между узлами, а составные коды иногда маскируют третью
  неисправность. В сервисном центре «Сервис Бокс» в Вологде мы снимаем panic-full на
  оборудовании для диагностики плат и подтверждаем причину без замены деталей «на удачу».
  Можно записаться на бесплатную диагностику по телефону
  <a href="tel:+79115018828">+7 (911) 501-88-28</a> или посмотреть условия ремонта iPhone на
  <a href="/services/phones">странице услуг</a> — мастерская находится по адресу ул. Северная,
  7А, ТЦ «КИТ».</p>
`);

const newsDoc = {
  title: 'Panic Log на iPhone: как расшифровать panic-full и понять, что сломалось внутри телефона',
  slug: SLUG,
  contentBlocks: blocks,
  excerpt: cap(
    'Если iPhone внезапно перезагружается или зависает на яблоке — скорее всего, система уже ' +
    'зафиксировала причину в файле panic-full. Разбираем, как найти этот лог, прочитать код ' +
    'ошибки и понять, какой узел внутри телефона вышел из строя — от iPhone 11 до iPhone 17.',
    300
  ),
  metaTitle: cap('Panic Log iPhone: расшифровка кодов ошибок — Сервис Бокс', 70),
  metaDescription: cap(
    'Как найти panic-full в iPhone и понять причину сбоя по коду в логе. Таблицы по моделям ' +
    '11–17 и разбор составных кодов. Диагностика и ремонт в Вологде.',
    160
  ),
  keywords: [
    'panic log iphone',
    'kernel panic iphone',
    'panic-full',
    'коды ошибок iphone',
    'диагностика iphone',
    'ремонт iphone вологда',
  ],
  isPublished: true,
  author: 'СЕРВИС БОКС',
  allowVideos: true,
};

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не задан — проверь', envFile);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('news');

  const existing = await collection.findOne({ slug: SLUG });
  const now = new Date();

  if (existing) {
    await collection.updateOne(
      { slug: SLUG },
      {
        $set: {
          ...newsDoc,
          publishedAt: existing.publishedAt || now,
          updatedAt: now,
        },
      }
    );
    console.log(`✅ Статья обновлена: /news/${SLUG} (_id=${existing._id})`);
  } else {
    const result = await collection.insertOne({
      ...newsDoc,
      views: 0,
      likesCount: 0,
      likedBy: [],
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✅ Статья создана: /news/${SLUG} (_id=${result.insertedId})`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
