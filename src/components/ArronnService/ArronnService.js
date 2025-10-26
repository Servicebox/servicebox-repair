// components/ArronService/ArronService.js
'use client';

import Image from "next/image";
import styles from "./ArronnService.module.css";

// Импорт изображений преимуществ
import Experienced from "../../../public/images/experienced.svg";
import Diagnostics from "../../../public/images/diagnostics.svg";
import ExpressRepair from "../../../public/images/expressrepair.svg";
import Protection from "../../../public/images/protection.svg";
import Original from "../../../public/images/original.svg";
import FixedPrice from "../../../public/images/fixedprice.svg";
import Status from "../../../public/images/status1.svg";
import AvailabilityParts from "../../../public/images/availabilityparts.svg";
import Save from "../../../public/images/save.svg";
import Payment from "../../../public/images/payment.svg";

// Импорт брендов
import Acer from "../../../public/images/acer.png.webp";
import Apple from "../../../public/images/apple.png.webp";
import Asus from "../../../public/images/asus.png.webp";
import Dell from "../../../public/images/dell.png.webp";
import Hp from "../../../public/images/hp.png.webp";
import Lenovo from "../../../public/images/lenovo.png.webp";
import Samsung from "../../../public/images/samsung.png.webp";
import Sony from "../../../public/images/sony.png.webp";
import Toshiba from "../../../public/images/tosh.png.webp";
import Xiaomi from "../../../public/images/xiaomi.png.webp";
import Fujitsu from "../../../public/images/fujitsu.png.webp";
import Gigabyte from "../../../public/images/gigabyte.png.webp";
import Honor from "../../../public/images/honor.png.webp";
import Huawei from "../../../public/images/huaw.png.webp";
import Lg from "../../../public/images/lg.png.webp";
import Msi from "../../../public/images/msi.png.webp";
import BenQ from "../../../public/images/benq.png.webp";
import ViewSonic from "../../../public/images/viewsonic.png.webp";
import Philips from "../../../public/images/philips.png.webp";
import Panasonic from "../../../public/images/panasonic.png.webp";

function ArronService() { 
    const brands = [
        { name: "Acer", image: Acer },
        { name: "Apple", image: Apple },
        { name: "Asus", image: Asus },
        { name: "Dell", image: Dell },
        { name: "HP", image: Hp },
        { name: "Huawei", image: Huawei },
        { name: "Lenovo", image: Lenovo },
        { name: "Xiaomi", image: Xiaomi },
        { name: "MSI", image: Msi },
        { name: "Samsung", image: Samsung },
        { name: "Sony", image: Sony },
        { name: "Toshiba", image: Toshiba },
        { name: "LG", image: Lg },
        { name: "Philips", image: Philips },
        { name: "Panasonic", image: Panasonic },
        { name: "BenQ", image: BenQ },
        { name: "ViewSonic", image: ViewSonic },
        { name: "Gigabyte", image: Gigabyte },
        { name: "Fujitsu", image: Fujitsu },
        { name: "Honor", image: Honor },
    ];

    const advantages = [
        { icon: Experienced, text: "Опыт работы более 10 лет" },
        { icon: Diagnostics, text: "Бесплатная диагностика любой сложности" },
        { icon: ExpressRepair, text: "Экспресс ремонт от 20 минут" },
        { icon: Protection, text: "Сохраним пыле- и влагозащиту" },
        { icon: Original, text: "Гарантия и оригинальные запчасти" },
        { icon: FixedPrice, text: "Фиксированная цена" },
        { icon: Status, text: "Вы можете отслеживать статус ремонта на сайте" },
        { icon: AvailabilityParts, text: "Всегда в наличии запчасти на популярные модели" },
        { icon: Save, text: "Ремонт без потери данных" },
        { icon: Payment, text: "Оплата после выполнения работы" }
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