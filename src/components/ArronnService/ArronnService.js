// components/ArronService/ArronService.js
'use client';

import Image from "next/image";
import styles from "./ArronnService.module.css";

function ArronService() { 
    const brands = [
        { name: "Acer", image: "/images/acer.png.webp" },
        { name: "Apple", image: "/images/apple.png.webp" },
        { name: "Asus", image: "/images/asus.png.webp" },
        { name: "Dell", image: "/images/dell.png.webp" },
        { name: "HP", image: "/images/hp.png.webp" },
        { name: "Lenovo", image: "/images/lenovo.png.webp" },
        { name: "Samsung", image: "/images/samsung.png.webp" },
        { name: "Sony", image: "/images/sony.png.webp" },
        { name: "Toshiba", image: "/images/tosh.png.webp" },
        { name: "Xiaomi", image: "/images/xiaomi.png.webp" },
        { name: "Fujitsu", image: "/images/fujitsu.png.webp" },
        { name: "Gigabyte", image: "/images/gigabyte.png.webp" },
        { name: "Honor", image: "/images/honor.png.webp" },
        { name: "Huawei", image: "/images/huaw.png.webp" },
        { name: "Lg", image: "/images/lg.png.webp" },
        { name: "Msi", image: "/images/msi.png.webp" },
        { name: "BenQ", image: "/images/benq.png.webp" },
        { name: "ViewSonic", image: "/images/viewsonic.png.webp" },
        { name: "Philips", image: "/images/philips.png.webp" },
        { name: "Panasonic", image: "/images/panasonic.png.webp" },
    ];

    const advantages = [
        { icon: "/images/experienced.svg", text: "Опыт работы более 10 лет" },
        { icon: "/images/diagnostics.svg", text: "Бесплатная диагностика любой сложности" },
        { icon: "/images/expressrepair.svg", text: "Экспресс ремонт от 20 минут" },
        { icon: "/images/protection.svg", text: "Сохраним пыле- и влагозащиту" },
        { icon: "/images/original.svg", text: "Гарантия и оригинальные запчасти" },
        { icon: "/images/fixedprice.svg", text: "Фиксированная цена" },
        { icon: "/images/status1.svg", text: "Вы можете отслеживать статус ремонта на сайте" },
        { icon: "/images/availabilityparts.svg", text: "Всегда в наличии запчасти на популярные модели" },
        { icon: "/images/save.svg", text: "Ремонт без потери данных" },
        { icon: "/images/payment.svg", text: "Оплата после выполнения работы" }
    ];

    return (
        <section className={styles.arronService}>
            <div className={styles.arronServiceContent}>
                <h2 className="animated-title">Наши преимущества</h2>

                <ul className={styles.arronServiceList}>
                    {advantages.map((advantage, index) => (
                        <li key={index} className={styles.arronServiceListItem}>
                            <Image 
                                src={advantage.icon} 
                                className={styles.arronServiceImg} 
                                alt="" 
                                width={50}
                                height={50}
                                unoptimized // Добавляем для SVG
                            />
                            <p className={styles.arronServiceText}>{advantage.text}</p>
                        </li>
                    ))}
                </ul>

                <div className={styles.arronServiceBrands}>
                    <h2 className="animated-title">
                        Ремонтируем и обслуживаем<br />
                        все бренды в Вологде
                    </h2>
                    <p className={styles.brandsSubtitle}>
                        Если Вы не нашли свой бренд цифровой техники - не расстраивайтесь!<br />
                        Наши мастера обслужат технику любого бренда.
                    </p>
                    <p className={styles.brandsSubtitle}>
                        Независимо от того, что сломалось —
                        специалисты справятся с любой задачей.
                        Беремся за ремонт и замену матриц, экранов,
                        системных и материнских плат, блоков питания и управления, контроллеров и процессоров, различных разъемов от 
                        различной цифровой техники. И наконец, стоит отметить прозрачную ценовую политику и фирменную гарантию на все виды работ,
                        а также на установленные детали. Это значит, что вы можете быть уверены: ваше устройство будет работать как новенькое без лишних затрат.
                        Так что если ваша техника дала сбой — не паникуйте! Доверьтесь профессионалам из сервисного центра "Servicebox" и наслаждайтесь дальше эксплуатацией
                        своих гаджетов!
                    </p>
                    
                    <div className={styles.brandGrid}>
                        {brands.map((brand, index) => (
                            <div key={index} className={styles.brandItem}>
                                <div className={styles.brandImageContainer}>
                                    <Image 
                                        src={brand.image} 
                                        alt={brand.name}
                                        className={styles.brandLogo}
                                        width={80}
                                        height={60}
                                        unoptimized // для WebP
                                    />
                                </div>
                                <span className={styles.brandName}>{brand.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ArronService;