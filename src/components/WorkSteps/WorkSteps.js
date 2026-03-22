// components/WorkSteps/WorkSteps.js
'use client';
import Script from 'next/script';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Phone, Search, FileText, Wrench, CheckCircle, Shield, 
  ChevronLeft, ChevronRight, MapPin, Clock, Users
} from 'lucide-react';
import styles from './WorkSteps.module.css';

const WorkSteps = () => {
  const [activeStep, setActiveStep] = useState(null);
  const scrollContainerRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Определение мобильного устройства с учетом SSR
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const steps = [
    {
      id: 1,
      icon: <Users className={styles.stepIconSvg} />,
      title: "А где Андрей?",
      description: "Свяжитесь с ним по номеру",
      details: "+7 (911) 501-06-96",
      fullText: "Андрей - наш директор и опытный специалист  в Вологде, работает в сервисном центре на Ленина, 6. Ориентир - вход рядом с K&B. Более 10 лет опыта в восстановлении цифровой техники."
    },
    {
      id: 2,
      icon: <Phone className={styles.stepIconSvg} />,
      title: "Консультация по телефону",
      description: "Обсудим проблему и предложим решение",
      details: "Бесплатная консультация",
      fullText: "Наш оператор в Вологде детально расспросит о неисправности, предложит возможные варианты восстановления работы устройства и согласует удобное время визита в сервис"
    },
    {
      id: 3,
      icon: <Search className={styles.stepIconSvg} />,
      title: "Профессиональная диагностика",
      description: "Точное определение причины поломки",
      details: "Диагностика бесплатно в Вологде",
      fullText: "Специалист проводит комплексную проверку оборудования с использованием современного диагностического оборудования. Определяем корень проблемы и составляем план восстановительных работ"
    },
    {
      id: 4,
      icon: <FileText className={styles.stepIconSvg} />,
      title: "Прозрачная смета работ",
      description: "Подробный расчет стоимости восстановления",
      details: "Без скрытых платежей",
      fullText: "Предоставляем детализированную калькуляцию с указанием стоимости оригинальных комплектующих и работ. Все позиции согласовываем перед началом восстановления устройства"
    },
    {
      id: 5,
      icon: <Wrench className={styles.stepIconSvg} />,
      title: "Качественное восстановление",
      description: "Профессиональный подход к каждому устройству",
      details: "Используем качественные компоненты",
      fullText: "Наши мастера в Вологде осуществляют восстановление с применением профессионального оборудования и сертифицированных запчастей. Строго соблюдаем технологические процессы"
    },
    {
      id: 6,
      icon: <CheckCircle className={styles.stepIconSvg} />,
      title: "Контроль качества",
      description: "Тщательная проверка работоспособности",
      details: "Тестирование всех функций",
      fullText: "После завершения восстановительных работ проводим комплексное тестирование всех систем устройства. Убеждаемся в стабильной работе и отсутствии скрытых дефектов"
    },
    {
      id: 7,
      icon: <Shield className={styles.stepIconSvg} />,
      title: "Гарантийные обязательства",
      description: "Надежная защита ваших инвестиций",
      details: "Официальная гарантия до 2 лет",
      fullText: "Предоставляем письменные гарантийные обязательства на выполненные работы и установленные компоненты. Гарантируем качество и несем ответственность за результат"
    }
  ];

  const faqs = [
    {
      question: "Как быстро можно получить консультацию по ремонту?",
      answer: "Наши консультанты готовы ответить на ваши вопросы ежедневно с 10:00 до 19:00. В большинстве случаев мы можем предварительно оценить ситуацию по телефону и предложить оптимальное решение для восстановления вашего устройства."
    },
    {
      question: "Сколько времени занимает диагностика оборудования?",
      answer: "Проверка устройства в нашем сервисном центре Вологды обычно занимает от 30 минут до 2 часов в зависимости от сложности неисправности. Для точного определения причины поломки используем современное диагностическое оборудование."
    },
    {
      question: "Нужна ли предварительная запись на обслуживание?",
      answer: "Рекомендуем заранее согласовать время визита по телефону для вашего удобства. Это позволяет избежать ожидания и обеспечить индивидуальный подход к каждому клиенту нашего сервиса в Вологде."
    },
    {
      question: "Можно ли наблюдать за процессом диагностики?",
      answer: "Процесс проверки и восстановления требует максимальной концентрации и происходит в специально оборудованной технической зоне. Наши специалисты в Вологде всегда готовы предоставить подробный отчет с фотографиями и видеоматериалами по завершении работ."
    },
    {
      question: "Какие формы оплаты принимаются в вашем сервисе?",
      answer: "В сервисных центрах Вологды мы принимаем наличные средства и безналичные платежи через банковские терминалы. Оплата производится только после успешного завершения работ и вашего одобрения результата."
    },
    {
      question: "На какие виды работ предоставляется гарантия?",
      answer: "Мы предоставляем официальные гарантийные обязательства сроком от 3 месяцев до 2 лет на все виды восстановительных работ и установленные комплектующие. Конкретный срок зависит от типа выполненных работ и используемых компонентов."
    },
    {
      question: "Что делать при повторном возникновении неисправности?",
      answer: "В случае возникновения проблем в течение гарантийного периода, просто свяжитесь с нами по телефону. Наши специалисты в Вологде оперативно устранят любые выявленные недостатки абсолютно бесплатно."
    },
    {
      question: "Работаете ли вы с корпоративными клиентами ?",
      answer: "Да, мы предлагаем специальные условия для бизнес-клиентов в Вологодской области. Предоставляем скидки на объемные заказы, оформляем все необходимые бухгалтерские документы и обеспечиваем приоритетное обслуживание."
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);
  const [structuredData, setStructuredData] = useState(null);

  const toggleFaq = useCallback((index) => {
    setOpenFaq(openFaq === index ? null : index);
  }, [openFaq]);

  const handleCall = () => {
    window.location.href = "tel:+79115018828";
  };

  const scrollLeft = useCallback(() => {
    if (!scrollContainerRef.current) return;
    setIsAutoScrolling(false);
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / steps.length;
    const newIndex = Math.max(0, currentStepIndex - 1);
    container.scrollTo({ left: newIndex * cardWidth, behavior: 'smooth' });
    setCurrentStepIndex(newIndex);
  }, [currentStepIndex, steps.length]);

  const scrollRight = useCallback(() => {
    if (!scrollContainerRef.current) return;
    setIsAutoScrolling(false);
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / steps.length;
    const newIndex = Math.min(steps.length - 1, currentStepIndex + 1);
    container.scrollTo({ left: newIndex * cardWidth, behavior: 'smooth' });
    setCurrentStepIndex(newIndex);
  }, [currentStepIndex, steps.length]);

  const scrollToStep = useCallback((index) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.scrollWidth / steps.length;
    container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    setCurrentStepIndex(index);
  }, [steps.length]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      diff > 0 ? scrollRight() : scrollLeft();
    }
  };

  // Автопрокрутка
  useEffect(() => {
    if (!isAutoScrolling || isMobile) return;
    
    autoScrollInterval.current = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % steps.length);
    }, 8000);
    
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isAutoScrolling, isMobile, steps.length]);

  useEffect(() => {
    if (scrollContainerRef.current && !isMobile) {
      const cardWidth = scrollContainerRef.current.scrollWidth / steps.length;
      scrollContainerRef.current.scrollTo({ 
        left: currentStepIndex * cardWidth, 
        behavior: 'smooth' 
      });
    }
  }, [currentStepIndex, steps.length, isMobile]);

  useEffect(() => {
    if (!isAutoScrolling) {
      const timer = setTimeout(() => setIsAutoScrolling(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [isAutoScrolling]);

  return (
    <div className={styles.workStepsContainer} itemScope itemType="https://schema.org/Service">
      <div className={styles.workStepsHeader}>
        <h2 className={styles.workStepsTitle}>Процесс восстановления техники в Вологде</h2>
        <p className={styles.workStepsSubtitle}>Прозрачная схема сотрудничества от диагностики до гарантийного обслуживания</p>
      </div>

      <div className={styles.locationInfo}>
        <div className={styles.locationCard}>
          <MapPin className={styles.locationIcon} />
          <div className={styles.locationDetails}>
            <h3>Сервисный центр на Ленина</h3>
            <p>ул. Ленина, д. 6, Вологда</p>
            <span>Ориентир: вход рядом с K&B</span>
          </div>
        </div>
        <div className={styles.locationCard}>
          <MapPin className={styles.locationIcon} />
          <div className={styles.locationDetails}>
            <h3>Сервисный центр на Северной</h3>
            <p>ул. Северная, д. 7А, офис 405, Вологда</p>
            <span>ТЦ "КИТ"</span>
          </div>
        </div>
      </div>

      <div className={styles.workStepsProgress}>
        <div className={styles.progressLine}>
          <div 
            className={styles.progressFill}
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className={styles.stepsIndicator}>
          {steps.map((_, index) => (
            <button
              key={index}
              className={`${styles.stepIndicator} ${currentStepIndex >= index ? styles.active : ''}`}
              onClick={() => scrollToStep(index)}
              aria-label={`Перейти к шагу ${index + 1}`}
            >
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.workStepsWrapper}>
        {!isMobile && (
          <>
            <button className={`${styles.scrollButton} ${styles.left}`} onClick={scrollLeft} aria-label="Предыдущий этап">
              <ChevronLeft />
            </button>
            <button className={`${styles.scrollButton} ${styles.right}`} onClick={scrollRight} aria-label="Следующий этап">
              <ChevronRight />
            </button>
          </>
        )}

        <div 
          className={styles.workStepsScrollContainer}
          ref={scrollContainerRef}
          onMouseEnter={() => setIsAutoScrolling(false)}
          onMouseLeave={() => setIsAutoScrolling(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.workStepsGrid}>
            {steps.map((step) => (
              <div
                key={step.id}
                className={`${styles.workStepCard} ${activeStep === step.id ? styles.active : ''}`}
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
                onClick={() => isMobile && setActiveStep(activeStep === step.id ? null : step.id)}
                itemScope
                itemType="https://schema.org/Service"
              >
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle} itemProp="name">{step.title}</h3>
                  <p className={styles.stepDescription} itemProp="description">{step.description}</p>
                  <div className={styles.stepDetails}>{step.details}</div>
                  <div className={`${styles.stepFullText} ${activeStep === step.id ? styles.visible : ''}`}>
                    {step.fullText}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.advantagesSection}>
        <h3 className={styles.advantagesTitle}>Почему выбирают наш сервис в Вологде</h3>
        <div className={styles.advantagesGrid}>
          <div className={styles.advantageItem}>
            <Clock className={styles.advantageIcon} />
            <h4>Оперативное выполнение</h4>
            <p>Большинство работ выполняем в течение 1-3 дней благодаря слаженной работе команды специалистов</p>
          </div>
          <div className={styles.advantageItem}>
            <Shield className={styles.advantageIcon} />
            <h4>Гарантия качества</h4>
            <p>Предоставляем официальные гарантийные обязательства на все виды восстановительных работ</p>
          </div>
          <div className={styles.advantageItem}>
            <Users className={styles.advantageIcon} />
            <h4>Опытные мастера</h4>
            <p>Наши специалисты в Вологде имеют многолетний опыт работы с различными типами устройств</p>
          </div>
        </div>
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Часто задаваемые вопросы о ремонте в Вологде</h2>
        <p className={styles.faqSubtitle}>Ответы на популярные вопросы от клиентов нашего сервисного центра</p>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={`${styles.faqQuestion} ${openFaq === index ? styles.active : ''}`}
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaq === index}
              >
                {faq.question}
                <span className={styles.faqToggle}>{openFaq === index ? '−' : '+'}</span>
              </button>
              <div className={`${styles.faqAnswer} ${openFaq === index ? styles.open : ''}`} aria-hidden={openFaq !== index}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


      <div itemScope itemType="https://schema.org/LocalBusiness" className={styles.hidden}>
        <meta itemProp="name" content="ServiceBox - профессиональный ремонт техники в Вологде" />
        <meta itemProp="description" content="Сервисный центр по восстановлению ноутбуков, смартфонов, планшетов и другой цифровой техники в Вологде. Качественный ремонт с гарантией." />
        <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          <meta itemProp="streetAddress" content="ул. Ленина, д. 6" />
          <meta itemProp="addressLocality" content="Вологда" />
          <meta itemProp="addressRegion" content="Вологодская область" />
          <meta itemProp="postalCode" content="160000" />
          <meta itemProp="addressCountry" content="RU" />
        </div>
        <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          <meta itemProp="streetAddress" content="ул. Северная, д. 7А, офис 405" />
          <meta itemProp="addressLocality" content="Вологда" />
          <meta itemProp="addressRegion" content="Вологодская область" />
          <meta itemProp="postalCode" content="160000" />
          <meta itemProp="addressCountry" content="RU" />
        </div>
        <meta itemProp="telephone" content="+7 (911) 501-88-28" />
        <meta itemProp="openingHours" content="Mo-Fr 10:00-19:00" />
        <div itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates">
          <meta itemProp="latitude" content="59.218183" />
          <meta itemProp="longitude" content="39.888497" />
        </div>
        <div itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates">
          <meta itemProp="latitude" content="59.229445" />
          <meta itemProp="longitude" content="39.878542" />
        </div>      </div>
      

{/* Скрытые данные для AI ассистентов */}
<div className="ai-structured-data" style={{ display: 'none' }} aria-hidden="true">
  {/* Основная информация для AI */}
  <h2>Сервис Бокс - Ремонт техники в Вологде</h2>
  
  <section className="ai-business-info">
    <h3>Информация о сервисном центре</h3>
    <p><strong>Название:</strong> Сервис Бокс</p>
    <p><strong>Специализация:</strong> Ремонт цифровой и компьютерной техники</p>
    <p><strong>Город:</strong> Вологда, Вологодская область, Россия</p>
    <p><strong>Опыт работы:</strong> Более 10 лет</p>
  </section>

  <section className="ai-locations">
    <h3>Адреса сервисных центров</h3>
    <ul>
      <li>
        <strong>Сервис на Ленина:</strong> ул. Ленина, д. 6, Вологда<br/>
        <em>Ориентир:</em> вход рядом с K&B<br/>
        <em>Часы работы:</em> Пн-Пт: 10:00-18:00<br/>
        <em>Телефон:</em> +7 (911) 501-06-96
      </li>
      <li>
        <strong>Сервис на Северной:</strong> ул. Северная, д. 7А, офис 405, Вологда<br/>
        <em>Ориентир:</em> ТЦ "КИТ"<br/>
        <em>Часы работы:</em> Пн-Пт: 10:00-19:00<br/>
        <em>Телефон:</em> +7 (911) 501-88-28
      </li>
    </ul>
  </section>

  <section className="ai-services">
    <h3>Услуги по ремонту</h3>
    <ul>
      <li>Ремонт ноутбуков (замена экранов, чистка, ремонт материнских плат)</li>
      <li>Ремонт телефонов (замена дисплеев, аккумуляторов, разъемов)</li>
      <li>Ремонт компьютеров (сборка, замена комплектующих)</li>
      <li>Ремонт видеокарт (замена чипов, восстановление)</li>
      <li>Ремонт телевизоров</li>
      <li>Ремонт игровых приставок</li>
      <li>Ремонт Apple техники (iPhone, iPad, MacBook)</li>
      <li>Восстановление данных</li>
      <li>Чистка от пыли и замена термопасты</li>
    </ul>
  </section>

  <section className="ai-pricing">
    <h3>Примерные цены на услуги</h3>
    <table>
      <thead>
        <tr>
          <th>Услуга</th>
          <th>Стоимость</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Диагностика</td><td>Бесплатно (при согласии на ремонт)</td></tr>
        <tr><td>Замена экрана ноутбука</td><td>от 1500 рублей</td></tr>
        <tr><td>Чистка ноутбука от пыли</td><td>от 1000 рублей</td></tr>
        <tr><td>Замена дисплея телефона</td><td>от 2000 рублей</td></tr>
        <tr><td>Замена аккумулятора телефона</td><td>от 1500 рублей</td></tr>
        <tr><td>Ремонт материнской платы</td><td>от 2500 рублей</td></tr>
        <tr><td>Замена термопасты</td><td>от 500 рублей</td></tr>
      </tbody>
    </table>
  </section>

  <section className="ai-process">
    <h3>Процесс работы</h3>
    <ol>
      {steps.map((step, index) => (
        <li key={index}>
          <strong>{step.title}:</strong> {step.fullText}
        </li>
      ))}
    </ol>
  </section>

  <section className="ai-faq">
    <h3>Частые вопросы и ответы</h3>
    {faqs.map((faq, index) => (
      <div key={index} className="ai-faq-item">
        <h4>Вопрос: {faq.question}</h4>
        <p>Ответ: {faq.answer}</p>
      </div>
    ))}
  </section>

  <section className="ai-features">
    <h3>Преимущества нашего сервиса</h3>
    <ul>
      <li>Бесплатная диагностика при согласии на ремонт</li>
      <li>Гарантия до 2 лет на выполненные работы</li>
      <li>Срочный ремонт от 30 минут до 3 дней</li>
      <li>Оригинальные и качественные запчасти</li>
      <li>Опытные мастера с сертификатами</li>
      <li>Прозрачное ценообразование без скрытых платежей</li>
      <li>Возможность выезда мастера</li>
      <li>Онлайн-запись и отслеживание статуса ремонта</li>
    </ul>
  </section>

  <section className="ai-contact">
    <h3>Как связаться</h3>
    <p><strong>Основной телефон:</strong> +7 (911) 501-88-28</p>
    <p><strong>Второй телефон:</strong> +7 (911) 501-06-96</p>
    <p><strong>Email:</strong> servicebox35@gmail.com</p>
    <p><strong>Telegram:</strong> @Tomkka</p>
    <p><strong>WhatsApp:</strong> +7 (906) 296-03-53</p>
    <p><strong>ВКонтакте:</strong> vk.com/servicebox35</p>
    <p><strong>Режим работы:</strong> Понедельник-Пятница с 10:00 до 19:00</p>
  </section>
</div>

{/* ✅ JSON-LD структурированные данные */}
{structuredData && (
  <Script
    id="structured-data-worksteps"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(structuredData)
    }}
    strategy="afterInteractive"
  />
)}
    </div>
  );
};

export default WorkSteps;