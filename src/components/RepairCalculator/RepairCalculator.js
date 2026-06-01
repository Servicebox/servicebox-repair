'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';


const PRICING = {
    phone: {
        label: 'Смартфон',
        icon: '📱',
        services: {
            screen: { name: 'Замена экрана', basePrice: 2000, minTime: '30 мин', maxTime: '2 часа', desc: 'Работа без учёта дисплея' },
            battery: { name: 'Замена аккумулятора', basePrice: 1400, minTime: '20 мин', maxTime: '1 час', desc: 'Работа без учёта батареи' },
            charging: { name: 'Ремонт разъёма', basePrice: 1500, minTime: '40 мин', maxTime: '2 часа', desc: 'Type-C / Lightning' },
            water: { name: 'Восстановление после воды', basePrice: 2500, minTime: '1 день', maxTime: '5 дней', desc: 'Ультразвуковая чистка' },
            camera: { name: 'Замена камеры', basePrice: 1500, minTime: '30 мин', maxTime: '1.5 часа', desc: 'Основная или фронтальная' },
            glass: { name: 'Замена стекла', basePrice: 2000, minTime: '2 часа', maxTime: '4 часа', desc: 'Переклейка без замены дисплея' },
            speaker: { name: 'Ремонт динамика', basePrice: 1000, minTime: '30 мин', maxTime: '1 час', desc: 'Слуховой / полифонический' },
            buttons: { name: 'Ремонт кнопок', basePrice: 900, minTime: '30 мин', maxTime: '1 час', desc: 'Питание, громкость, Home' },
        },
        brands: {
            apple: {
                multiplier: 1.3,
                name: 'Apple iPhone',
                models: [
                    { id: 'iphone_8', name: 'iPhone 8 / 8 Plus', gen: 0.6 },
                    { id: 'iphone_x', name: 'iPhone X / XR / XS', gen: 0.7 },
                    { id: 'iphone_11', name: 'iPhone 11 / 11 Pro', gen: 0.85 },
                    { id: 'iphone_12', name: 'iPhone 12 / 12 Pro', gen: 0.95 },
                    { id: 'iphone_13', name: 'iPhone 13 / 13 Pro', gen: 1.0 },
                    { id: 'iphone_14', name: 'iPhone 14 / 14 Plus', gen: 1.1 },
                    { id: 'iphone_15', name: 'iPhone 15 / 15 Plus', gen: 1.2 },
                    {
                        id: 'iphone_15_pro', name: 'iPhone 15 Pro / Pro Max', gen: 1.5,
                        specificPrices: { screen: 4500, glass: 3500 }
                    },
                    { id: 'iphone_16', name: 'iPhone 16 / 16 Plus', gen: 1.4 },
                    {
                        id: 'iphone_16_pro', name: 'iPhone 16 Pro / Pro Max', gen: 1.7,
                        specificPrices: { screen: 5500, glass: 4000 }
                    },
                    { id: 'iphone_se', name: 'iPhone SE (2020/2022)', gen: 0.6 },
                ]
            },
            samsung: {
                multiplier: 1.1,
                name: 'Samsung Galaxy',
                models: [
                    { id: 'galaxy_a_old', name: 'Galaxy A50 / A51 / A52', gen: 0.6 },
                    { id: 'galaxy_a_mid', name: 'Galaxy A53 / A54', gen: 0.8 },
                    { id: 'galaxy_a_new', name: 'Galaxy A55 / A56', gen: 0.95 },
                    { id: 'galaxy_s_old', name: 'Galaxy S10 / S20', gen: 0.8 },
                    { id: 'galaxy_s21', name: 'Galaxy S21 / S21 FE', gen: 0.9 },
                    { id: 'galaxy_s22', name: 'Galaxy S22 / S22 Ultra', gen: 1.0 },
                    {
                        id: 'galaxy_s23', name: 'Galaxy S23 / S23 Ultra', gen: 1.15,
                        specificPrices: { screen: 3500 }
                    },
                    {
                        id: 'galaxy_s24', name: 'Galaxy S24 / S24 Ultra', gen: 1.3,
                        specificPrices: { screen: 4500 }
                    },
                    {
                        id: 'galaxy_flip', name: 'Galaxy Z Flip 3/4/5', gen: 1.4,
                        specificPrices: { screen: 4500, glass: 3500 }
                    },
                    {
                        id: 'galaxy_fold', name: 'Galaxy Z Fold 3/4/5', gen: 1.7,
                        specificPrices: { screen: 8500, glass: 6000 }
                    },
                ]
            },
            xiaomi: {
                multiplier: 0.9,
                name: 'Xiaomi / Redmi / POCO',
                models: [
                    { id: 'redmi_note_old', name: 'Redmi Note 10 / 11', gen: 0.6 },
                    { id: 'redmi_note_mid', name: 'Redmi Note 12', gen: 0.8 },
                    { id: 'redmi_note_new', name: 'Redmi Note 13 / 13 Pro', gen: 1.0 },
                    { id: 'xiaomi_flagship', name: 'Xiaomi 13 / 14 / Pro', gen: 1.2 },
                    { id: 'poco_x', name: 'POCO X5 / X6 / F5', gen: 0.9 },
                ]
            },
            huawei: {
                multiplier: 1.0,
                name: 'Huawei / Honor',
                models: [
                    { id: 'huawei_p_old', name: 'Huawei P30 / P40', gen: 0.7 },
                    { id: 'huawei_p_new', name: 'Huawei P50 / P60', gen: 1.1 },
                    { id: 'honor_mid', name: 'Honor 70 / 80 / 90', gen: 0.9 },
                    { id: 'honor_magic', name: 'Honor Magic 5 / 6 Pro', gen: 1.3 },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд',
                models: [
                    { id: 'other_old', name: 'Старая модель (до 2019)', gen: 0.6 },
                    { id: 'other_mid', name: 'Средняя модель (2020-2022)', gen: 0.9 },
                    { id: 'other_new', name: 'Новая модель (2023+)', gen: 1.1 },
                ]
            },
        },
    },

    laptop: {
        label: 'Ноутбук',
        icon: '💻',
        services: {
            screen: { name: 'Замена матрицы', basePrice: 2500, minTime: '1 час', maxTime: '3 часа', desc: 'Работа без учёта матрицы' },
            cleaning: { name: 'Чистка + термопаста', basePrice: 2000, minTime: '1 час', maxTime: '2 часа', desc: 'Полная разборка' },
            keyboard: { name: 'Замена клавиатуры', basePrice: 1800, minTime: '1 час', maxTime: '3 часа', desc: 'Работа без учёта клавиатуры' },
            motherboard: { name: 'Ремонт мат. платы', basePrice: 4000, minTime: '3 дня', maxTime: '7 дней', desc: 'BGA-пайка, замена чипов' },
            water: { name: 'После залития', basePrice: 3000, minTime: '2 дня', maxTime: '7 дней', desc: 'Ультразвуковая чистка' },
            battery: { name: 'Замена аккумулятора', basePrice: 1800, minTime: '1 час', maxTime: '2 часа', desc: 'Работа без учёта батареи' },
            ssd: { name: 'Установка SSD', basePrice: 1200, minTime: '30 мин', maxTime: '1 час', desc: 'Без стоимости накопителя' },
        },
        brands: {
            apple: {
                multiplier: 1.8,
                name: 'Apple MacBook',
                models: [
                    { id: 'mba_old', name: 'MacBook Air (Intel 2018-2019)', gen: 0.8 },
                    { id: 'mba_m1', name: 'MacBook Air M1 (2020)', gen: 1.0 },
                    {
                        id: 'mba_m2', name: 'MacBook Air M2/M3 (2022-2024)', gen: 1.3,
                        specificPrices: { screen: 9000, keyboard: 5000 }
                    },
                    { id: 'mbp_old', name: 'MacBook Pro (Intel 2016-2019)', gen: 0.9 },
                    { id: 'mbp_m1', name: 'MacBook Pro M1/M2 (2020-2022)', gen: 1.2 },
                    {
                        id: 'mbp_m3', name: 'MacBook Pro M3/M4 (2023-2024)', gen: 1.5,
                        specificPrices: { screen: 12000, keyboard: 6500 }
                    },
                ]
            },
            asus: {
                multiplier: 1.0,
                name: 'ASUS',
                models: [
                    { id: 'asus_vivobook', name: 'VivoBook 14/15/16', gen: 0.8 },
                    { id: 'asus_zenbook', name: 'ZenBook 13/14', gen: 1.1 },
                    { id: 'asus_rog', name: 'ROG Strix / Zephyrus', gen: 1.2 },
                    { id: 'asus_tuf', name: 'TUF Gaming', gen: 1.0 },
                ]
            },
            lenovo: {
                multiplier: 1.0,
                name: 'Lenovo',
                models: [
                    { id: 'lenovo_ideapad', name: 'IdeaPad 3/5', gen: 0.8 },
                    { id: 'lenovo_thinkpad', name: 'ThinkPad E/T/X1', gen: 1.1 },
                    { id: 'lenovo_legion', name: 'Legion 5/7', gen: 1.2 },
                    { id: 'lenovo_yoga', name: 'Yoga Slim / 9i', gen: 1.1 },
                ]
            },
            hp: {
                multiplier: 1.0,
                name: 'HP',
                models: [
                    { id: 'hp_pavilion', name: 'Pavilion 14/15', gen: 0.8 },
                    { id: 'hp_envy', name: 'Envy 13/15', gen: 1.0 },
                    { id: 'hp_omen', name: 'Omen 15/16', gen: 1.2 },
                    { id: 'hp_elitebook', name: 'EliteBook / Spectre', gen: 1.3 },
                ]
            },
            dell: {
                multiplier: 1.1,
                name: 'Dell',
                models: [
                    { id: 'dell_inspiron', name: 'Inspiron 14/15', gen: 0.8 },
                    { id: 'dell_xps', name: 'XPS 13/15/17', gen: 1.4 },
                    { id: 'dell_latitude', name: 'Latitude / Precision', gen: 1.1 },
                    { id: 'dell_alienware', name: 'Alienware m15/m17', gen: 1.3 },
                ]
            },
            acer: {
                multiplier: 1.0,
                name: 'Acer',
                models: [
                    { id: 'acer_aspire', name: 'Aspire 3/5', gen: 0.8 },
                    { id: 'acer_swift', name: 'Swift 3/5', gen: 1.0 },
                    { id: 'acer_predator', name: 'Predator Helios / Triton', gen: 1.2 },
                    { id: 'acer_nitro', name: 'Nitro 5/16', gen: 1.0 },
                ]
            },
            msi: {
                multiplier: 1.1,
                name: 'MSI',
                models: [
                    { id: 'msi_gf', name: 'GF63 / GF75 Thin', gen: 0.9 },
                    { id: 'msi_katana', name: 'Katana 15/17', gen: 1.0 },
                    { id: 'msi_pulse', name: 'Pulse GL66/GL76', gen: 1.1 },
                    { id: 'msi_raider', name: 'Raider GE66/GE78', gen: 1.3 },
                    { id: 'msi_stealth', name: 'Stealth 15M / 16/17', gen: 1.4 },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд',
                models: [
                    { id: 'laptop_office', name: 'Офисный (бюджетный)', gen: 0.8 },
                    { id: 'laptop_gaming', name: 'Игровой', gen: 1.2 },
                    { id: 'laptop_ultra', name: 'Ультрабук (премиум)', gen: 1.3 },
                ]
            },
        },
    },

    tablet: {
        label: 'Планшет',
        icon: '📲',
        services: {
            screen: { name: 'Замена дисплея', basePrice: 2500, minTime: '1 час', maxTime: '3 часа', desc: 'Работа без учёта дисплея' },
            glass: { name: 'Замена тачскрина', basePrice: 2000, minTime: '2 часа', maxTime: '4 часа', desc: 'Переклейка стекла' },
            battery: { name: 'Замена аккумулятора', basePrice: 1800, minTime: '1 час', maxTime: '2 часа', desc: 'Работа без учёта батареи' },
            charging: { name: 'Ремонт разъёма', basePrice: 1500, minTime: '1 час', maxTime: '2 часа', desc: 'Type-C / Lightning' },
        },
        brands: {
            apple: {
                multiplier: 1.5,
                name: 'Apple iPad',
                models: [
                    { id: 'ipad_old', name: 'iPad 9 / 10 (2021-2022)', gen: 0.8 },
                    { id: 'ipad_air', name: 'iPad Air 4 / 5 (2020-2022)', gen: 1.0 },
                    { id: 'ipad_pro_11', name: 'iPad Pro 11" (2020-2024)', gen: 1.2 },
                    {
                        id: 'ipad_pro_12', name: 'iPad Pro 12.9" / 13" (2020-2024)', gen: 1.4,
                        specificPrices: { screen: 7500 }
                    },
                    { id: 'ipad_mini', name: 'iPad mini 6 (2021)', gen: 1.0 },
                ]
            },
            samsung: {
                multiplier: 1.1,
                name: 'Samsung Galaxy Tab',
                models: [
                    { id: 'tab_a', name: 'Galaxy Tab A7 / A8 (2020-2022)', gen: 0.7 },
                    { id: 'tab_s7', name: 'Galaxy Tab S7 / S7+ (2020)', gen: 0.9 },
                    { id: 'tab_s8', name: 'Galaxy Tab S8 / S8+ / S8 Ultra (2022)', gen: 1.1 },
                    { id: 'tab_s9', name: 'Galaxy Tab S9 / S9+ / S9 Ultra (2023)', gen: 1.3 },
                ]
            },
            xiaomi: {
                multiplier: 0.9,
                name: 'Xiaomi Pad',
                models: [
                    { id: 'xiaomi_pad', name: 'Xiaomi Pad 5 / 6', gen: 0.9 },
                    { id: 'xiaomi_pad_pro', name: 'Xiaomi Pad 6 Pro / S Pro', gen: 1.1 },
                    { id: 'redmi_pad', name: 'Redmi Pad / Redmi Pad SE', gen: 0.8 },
                ]
            },
            huawei: {
                multiplier: 1.0,
                name: 'Huawei MatePad',
                models: [
                    { id: 'matepad_old', name: 'MatePad 11 / 11.5 (2021-2022)', gen: 0.9 },
                    { id: 'matepad_pro', name: 'MatePad Pro 12.6 (2021-2023)', gen: 1.2 },
                    { id: 'matepad_t', name: 'MatePad T10 / T10s', gen: 0.7 },
                ]
            },
            lenovo: {
                multiplier: 1.0,
                name: 'Lenovo Tab',
                models: [
                    { id: 'lenovo_m', name: 'Lenovo Tab M10 / M11', gen: 0.8 },
                    { id: 'lenovo_p', name: 'Lenovo Tab P11 / P12', gen: 1.0 },
                    { id: 'lenovo_extreme', name: 'Lenovo Tab Extreme', gen: 1.3 },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд',
                models: [
                    { id: 'tablet_budget', name: 'Бюджетный планшет', gen: 0.7 },
                    { id: 'tablet_mid', name: 'Средний класс', gen: 0.9 },
                    { id: 'tablet_premium', name: 'Премиум', gen: 1.2 },
                ]
            },
        },
    },

    tv: {
        label: 'Телевизор',
        icon: '📺',
        services: {
            backlight_small: {
                name: 'Замена подсветки 32-43"',
                basePrice: 4500,
                minTime: '1 день',
                maxTime: '2 дня',
                desc: 'LED телевизоры малой диагонали'
            },
            backlight_medium: {
                name: 'Замена подсветки 49-55"',
                basePrice: 6500,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: 'LED телевизоры средней диагонали'
            },
            backlight_large: {
                name: 'Замена подсветки 58-65"',
                basePrice: 9000,
                minTime: '2 дня',
                maxTime: '4 дня',
                desc: 'LED телевизоры большой диагонали'
            },
            backlight_xlarge: {
                name: 'Замена подсветки 70"+',
                basePrice: 14000,
                minTime: '2 дня',
                maxTime: '5 дней',
                desc: 'LED телевизоры 70-85 дюймов'
            },
            backlight_qled: {
                name: 'Замена подсветки QLED',
                basePrice: 10000,
                minTime: '2 дня',
                maxTime: '4 дня',
                desc: 'QLED Samsung / TCL / Hisense'
            },
            backlight_oled: {
                name: 'Ремонт подсветки OLED',
                basePrice: 18000,
                minTime: '3 дня',
                maxTime: '7 дней',
                desc: 'OLED LG / Sony / Philips (сложный ремонт)'
            },
            power: {
                name: 'Ремонт блока питания',
                basePrice: 3000,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: 'Замена конденсаторов, MOSFET'
            },
            tcon: {
                name: 'Ремонт T-Con платы',
                basePrice: 3500,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: 'Восстановление изображения'
            },
            mainboard: {
                name: 'Ремонт основной платы',
                basePrice: 4500,
                minTime: '2 дня',
                maxTime: '5 дней',
                desc: 'Smart TV, Wi-Fi, HDMI'
            },
            matrix: {
                name: 'Замена матрицы',
                basePrice: 8000,
                minTime: '2 дня',
                maxTime: '7 дней',
                desc: 'LCD / OLED / QLED (работа без матрицы)'
            },
        },
        brands: {
            samsung: {
                multiplier: 1.2,
                name: 'Samsung',
                models: [
                    {
                        id: 'samsung_uhd',
                        name: 'Crystal UHD 43-55"',
                        gen: 0.9,
                        specificPrices: {
                            backlight_small: 5000,
                            backlight_medium: 7500
                        }
                    },
                    {
                        id: 'samsung_uhd_large',
                        name: 'Crystal UHD 58-75"',
                        gen: 1.1,
                        specificPrices: {
                            backlight_large: 10000,
                            backlight_xlarge: 15000
                        }
                    },
                    {
                        id: 'samsung_qled',
                        name: 'QLED 43-65"',
                        gen: 1.2,
                        specificPrices: {
                            backlight_qled: 11000
                        }
                    },
                    {
                        id: 'samsung_neo_qled',
                        name: 'Neo QLED 55-75"',
                        gen: 1.4,
                        specificPrices: {
                            backlight_qled: 14000
                        }
                    },
                    {
                        id: 'samsung_frame',
                        name: 'The Frame 43-65"',
                        gen: 1.3,
                        specificPrices: {
                            backlight_small: 6000,
                            backlight_medium: 8500
                        }
                    },
                ]
            },
            lg: {
                multiplier: 1.2,
                name: 'LG',
                models: [
                    {
                        id: 'lg_uhd',
                        name: 'UHD 43-55"',
                        gen: 0.9,
                        specificPrices: {
                            backlight_small: 5000,
                            backlight_medium: 7500
                        }
                    },
                    {
                        id: 'lg_uhd_large',
                        name: 'UHD 58-75"',
                        gen: 1.1,
                        specificPrices: {
                            backlight_large: 10000,
                            backlight_xlarge: 15000
                        }
                    },
                    {
                        id: 'lg_nanocell',
                        name: 'NanoCell 49-65"',
                        gen: 1.1,
                        specificPrices: {
                            backlight_medium: 8000,
                            backlight_large: 10500
                        }
                    },
                    {
                        id: 'lg_oled',
                        name: 'OLED 48-65"',
                        gen: 1.4,
                        specificPrices: {
                            backlight_oled: 20000
                        }
                    },
                    {
                        id: 'lg_oled_large',
                        name: 'OLED 65-83"',
                        gen: 1.6,
                        specificPrices: {
                            backlight_oled: 25000
                        }
                    },
                    {
                        id: 'lg_qned',
                        name: 'QNED 55-75"',
                        gen: 1.3,
                        specificPrices: {
                            backlight_medium: 8500,
                            backlight_large: 11000
                        }
                    },
                ]
            },
            sony: {
                multiplier: 1.3,
                name: 'Sony',
                models: [
                    {
                        id: 'sony_x75',
                        name: 'Bravia X75/X80 43-55"',
                        gen: 0.9,
                        specificPrices: {
                            backlight_small: 5500,
                            backlight_medium: 8000
                        }
                    },
                    {
                        id: 'sony_x85',
                        name: 'Bravia X85/X90 55-75"',
                        gen: 1.1,
                        specificPrices: {
                            backlight_medium: 9000,
                            backlight_large: 12000
                        }
                    },
                    {
                        id: 'sony_oled',
                        name: 'Bravia XR A80/A90 OLED',
                        gen: 1.4,
                        specificPrices: {
                            backlight_oled: 22000
                        }
                    },
                    {
                        id: 'sony_x95',
                        name: 'Bravia XR X95/X98',
                        gen: 1.3,
                        specificPrices: {
                            backlight_large: 13000
                        }
                    },
                ]
            },
            philips: {
                multiplier: 1.1,
                name: 'Philips',
                models: [
                    {
                        id: 'philips_performance',
                        name: 'Performance 43-55"',
                        gen: 0.9,
                        specificPrices: {
                            backlight_small: 4800,
                            backlight_medium: 7000
                        }
                    },
                    {
                        id: 'philips_pus',
                        name: 'PUS 58-75"',
                        gen: 1.0,
                        specificPrices: {
                            backlight_large: 9500,
                            backlight_xlarge: 14500
                        }
                    },
                    {
                        id: 'philips_oled',
                        name: 'OLED 55-65"',
                        gen: 1.4,
                        specificPrices: {
                            backlight_oled: 19000
                        }
                    },
                ]
            },
            tcl: {
                multiplier: 1.0,
                name: 'TCL',
                models: [
                    {
                        id: 'tcl_p',
                        name: 'P-series 43-55"',
                        gen: 0.8,
                        specificPrices: {
                            backlight_small: 4200,
                            backlight_medium: 6000
                        }
                    },
                    {
                        id: 'tcl_c',
                        name: 'C-series 55-75"',
                        gen: 1.0,
                        specificPrices: {
                            backlight_medium: 7000,
                            backlight_large: 9500
                        }
                    },
                    {
                        id: 'tcl_qled',
                        name: 'QLED 55-65"',
                        gen: 1.1,
                        specificPrices: {
                            backlight_qled: 9500
                        }
                    },
                ]
            },
            xiaomi: {
                multiplier: 0.9,
                name: 'Xiaomi',
                models: [
                    {
                        id: 'xiaomi_a2',
                        name: 'TV A2 32-43"',
                        gen: 0.8,
                        specificPrices: {
                            backlight_small: 4000
                        }
                    },
                    {
                        id: 'xiaomi_q1',
                        name: 'TV Q1 55-75"',
                        gen: 1.0,
                        specificPrices: {
                            backlight_medium: 6500,
                            backlight_large: 9000
                        }
                    },
                    {
                        id: 'xiaomi_p1',
                        name: 'TV P1 43-55"',
                        gen: 0.9,
                        specificPrices: {
                            backlight_small: 4300,
                            backlight_medium: 6500
                        }
                    },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд',
                models: [
                    {
                        id: 'tv_small',
                        name: 'LED 32-43 дюйма',
                        gen: 0.8,
                        specificPrices: {
                            backlight_small: 4500
                        }
                    },
                    {
                        id: 'tv_medium',
                        name: 'LED 49-55 дюймов',
                        gen: 1.0,
                        specificPrices: {
                            backlight_medium: 6500
                        }
                    },
                    {
                        id: 'tv_large',
                        name: 'LED 58-75 дюймов',
                        gen: 1.2,
                        specificPrices: {
                            backlight_large: 9500,
                            backlight_xlarge: 14000
                        }
                    },
                    {
                        id: 'tv_oled',
                        name: 'OLED / QLED',
                        gen: 1.4,
                        specificPrices: {
                            backlight_qled: 10000,
                            backlight_oled: 18000
                        }
                    },
                ]
            },
        },
    },

    console: {
        label: 'Игровая приставка',
        icon: '🎮',
        services: {
            // ОБНОВЛЕНО: разделение по типам чистки
            cleaning_basic: {
                name: 'Чистка от пыли (базовая)',
                basePrice: 1500,
                minTime: '1 час',
                maxTime: '2 часа',
                desc: 'Полная разборка, чистка радиатора и вентилятора'
            },
            cleaning_ps5: {
                name: 'Чистка PlayStation 5',
                basePrice: 3500,
                minTime: '1.5 часа',
                maxTime: '2.5 часа',
                desc: 'Полная разборка PS5 с чисткой системы охлаждения'
            },
            liquid_metal: {
                name: '🔥 Замена жидкого металла (PS5)',
                basePrice: 5000,
                minTime: '2 часа',
                maxTime: '3 часа',
                desc: 'Обновление Liquid Metal на APU. Премиум-услуга'
            },
            thermal: {
                name: 'Замена термопасты',
                basePrice: 2000,
                minTime: '1 час',
                maxTime: '2 часа',
                desc: 'Качественная термопаста (для PS4/Xbox/Switch)'
            },
            hdmi: {
                name: 'Ремонт HDMI порта',
                basePrice: 3500,
                minTime: '1 день',
                maxTime: '2 дня',
                desc: 'BGA-пайка разъёма'
            },
            controller: {
                name: 'Ремонт геймпада',
                basePrice: 1800,
                minTime: '1 час',
                maxTime: '3 часа',
                desc: 'Стики, кнопки, триггеры, Bluetooth'
            },
            controller_dualsense: {
                name: 'Ремонт DualSense (PS5)',
                basePrice: 2800,
                minTime: '1.5 часа',
                maxTime: '3 часа',
                desc: 'Дрифт стиков, адаптивные триггеры, тачпад'
            },
            drive: {
                name: 'Ремонт привода',
                basePrice: 3000,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: 'Лазер, шлейф, механика'
            },
            drive_ps5: {
                name: 'Ремонт Blu-ray привода PS5',
                basePrice: 5500,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: '4K UHD Blu-ray привод'
            },
            power: {
                name: 'Ремонт блока питания',
                basePrice: 3000,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: 'Замена компонентов БП'
            },
            power_ps5: {
                name: 'Ремонт БП PlayStation 5',
                basePrice: 5000,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: 'Оригинальный БП 350W'
            },
            ssd_upgrade: {
                name: 'Установка SSD M.2 (PS5)',
                basePrice: 2500,
                minTime: '30 мин',
                maxTime: '1 час',
                desc: 'Без стоимости SSD. Установка + настройка'
            },
            motherboard: {
                name: 'Ремонт материнской платы',
                basePrice: 6000,
                minTime: '3 дня',
                maxTime: '7 дней',
                desc: 'BGA-пайка, замена чипов'
            },
            motherboard_ps5: {
                name: 'Ремонт мат. платы PS5',
                basePrice: 9000,
                minTime: '3 дня',
                maxTime: '7 дней',
                desc: 'Сложный ремонт с BGA-пайкой'
            },
        },
        brands: {
            playstation: {
                multiplier: 1.0,
                name: 'PlayStation',
                models: [
                    {
                        id: 'ps3',
                        name: 'PlayStation 3 (Fat/Slim/Super Slim)',
                        gen: 0.7,
                        specificPrices: {
                            cleaning_basic: 1500,
                            thermal: 2000,
                            hdmi: 3000,
                            drive: 2500,
                            power: 2800
                        }
                    },
                    {
                        id: 'ps4_slim',
                        name: 'PlayStation 4 Slim',
                        gen: 0.9,
                        specificPrices: {
                            cleaning_basic: 1800,
                            thermal: 2200,
                            hdmi: 3500,
                            drive: 3000,
                            power: 3200
                        }
                    },
                    {
                        id: 'ps4_pro',
                        name: 'PlayStation 4 Pro',
                        gen: 1.0,
                        specificPrices: {
                            cleaning_basic: 2000,
                            thermal: 2500,
                            hdmi: 4000,
                            drive: 3500,
                            power: 3500
                        }
                    },
                    // PS5 Standard — с жидким металлом
                    {
                        id: 'ps5_standard',
                        name: 'PlayStation 5 Standard',
                        gen: 1.2,
                        specificPrices: {
                            cleaning_ps5: 3500,
                            liquid_metal: 5000,
                            hdmi: 5500,
                            controller_dualsense: 2800,
                            drive_ps5: 5500,
                            power_ps5: 5000,
                            ssd_upgrade: 2500,
                            motherboard_ps5: 9000
                        }
                    },
                    //  PS5 Digital
                    {
                        id: 'ps5_digital',
                        name: 'PlayStation 5 Digital Edition',
                        gen: 1.2,
                        specificPrices: {
                            cleaning_ps5: 3500,
                            liquid_metal: 5000,
                            hdmi: 5500,
                            controller_dualsense: 2800,
                            power_ps5: 5000,
                            ssd_upgrade: 2500,
                            motherboard_ps5: 9000
                        }
                    },
                    // PS5 Slim
                    {
                        id: 'ps5_slim',
                        name: 'PlayStation 5 Slim',
                        gen: 1.3,
                        specificPrices: {
                            cleaning_ps5: 3800,
                            liquid_metal: 5500,
                            hdmi: 6000,
                            controller_dualsense: 2800,
                            drive_ps5: 5800,
                            power_ps5: 5200,
                            ssd_upgrade: 2500,
                            motherboard_ps5: 9500
                        }
                    },
                ]
            },
            xbox: {
                multiplier: 1.1,
                name: 'Xbox',
                models: [
                    {
                        id: 'xbox_one_s',
                        name: 'Xbox One S',
                        gen: 0.8,
                        specificPrices: {
                            cleaning_basic: 1700,
                            thermal: 2200,
                            hdmi: 3500,
                            drive: 3000,
                            power: 3200
                        }
                    },
                    {
                        id: 'xbox_one_x',
                        name: 'Xbox One X',
                        gen: 0.9,
                        specificPrices: {
                            cleaning_basic: 2000,
                            thermal: 2500,
                            hdmi: 4000,
                            drive: 3500,
                            power: 3500
                        }
                    },
                    {
                        id: 'xbox_series_s',
                        name: 'Xbox Series S',
                        gen: 1.1,
                        specificPrices: {
                            cleaning_basic: 2500,
                            thermal: 2800,
                            hdmi: 4500,
                            power: 4000,
                            ssd_upgrade: 2800
                        }
                    },
                    {
                        id: 'xbox_series_x',
                        name: 'Xbox Series X',
                        gen: 1.3,
                        specificPrices: {
                            cleaning_basic: 3000,
                            thermal: 3200,
                            hdmi: 5500,
                            drive: 5000,
                            power: 5000,
                            ssd_upgrade: 3000,
                            motherboard: 8500
                        }
                    },
                ]
            },
            nintendo: {
                multiplier: 1.0,
                name: 'Nintendo Switch',
                models: [
                    {
                        id: 'switch',
                        name: 'Nintendo Switch (2017-2019)',
                        gen: 0.9,
                        specificPrices: {
                            cleaning_basic: 1500,
                            thermal: 1800,
                            controller: 2000,
                            power: 2500
                        }
                    },
                    {
                        id: 'switch_v2',
                        name: 'Nintendo Switch V2 (2019+)',
                        gen: 1.0,
                        specificPrices: {
                            cleaning_basic: 1600,
                            thermal: 2000,
                            controller: 2000,
                            power: 2700
                        }
                    },
                    {
                        id: 'switch_lite',
                        name: 'Nintendo Switch Lite',
                        gen: 1.0,
                        specificPrices: {
                            cleaning_basic: 1500,
                            thermal: 1800,
                            power: 2500
                        }
                    },
                    {
                        id: 'switch_oled',
                        name: 'Nintendo Switch OLED',
                        gen: 1.2,
                        specificPrices: {
                            cleaning_basic: 1800,
                            thermal: 2200,
                            controller: 2200,
                            power: 3000
                        }
                    },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другая приставка',
                models: [
                    { id: 'console_old', name: 'Старая модель (до 2015)', gen: 0.7 },
                    { id: 'console_mid', name: 'Средняя модель (2016-2020)', gen: 0.9 },
                    { id: 'console_new', name: 'Новая модель (2021+)', gen: 1.1 },
                ]
            },
        },
    },
    // ═══════════════════════════════════════════════════
    // ВИДЕОКАРТЫ (эксклюзивные услуги)
    // ═══════════════════════════════════════════════════
    videocard: {
        label: 'Видеокарта',
        icon: '🔥',
        services: {
            cleaning: {
                name: 'Чистка + термопаста',
                basePrice: 1800,
                minTime: '1 час',
                maxTime: '2 часа',
                desc: 'Полная разборка, замена термоинтерфейса'
            },
            thermal: {
                name: 'Замена термопрокладок',
                basePrice: 2200,
                minTime: '1 час',
                maxTime: '3 часа',
                desc: 'Качественные термопрокладки'
            },
            fans: {
                name: 'Ремонт/замена вентиляторов',
                basePrice: 1500,
                minTime: '1 час',
                maxTime: '2 часа',
                desc: 'Работа без учёта вентиляторов'
            },
            reball: {
                name: 'Реболл GPU',
                basePrice: 4500,
                minTime: '2 дня',
                maxTime: '5 дней',
                desc: 'BGA-пайка графического чипа'
            },
            gpu_replace: {
                name: 'Замена GPU (видеочипа)',
                basePrice: 6000,
                minTime: '3 дня',
                maxTime: '7 дней',
                desc: 'Работа без учёта чипа'
            },
            vram_replace: {
                name: 'Замена видеопамяти (VRAM)',
                basePrice: 4000,
                minTime: '2 дня',
                maxTime: '5 дней',
                desc: 'Работа без учёта памяти'
            },
            power: {
                name: 'Ремонт цепи питания',
                basePrice: 3500,
                minTime: '2 дня',
                maxTime: '5 дней',
                desc: 'MOSFET, конденсаторы, дроссели'
            },
            hdmi: {
                name: 'Ремонт видеовыходов',
                basePrice: 2000,
                minTime: '1 день',
                maxTime: '3 дня',
                desc: 'HDMI, DisplayPort, DVI'
            },
            bios: {
                name: 'Прошивка BIOS',
                basePrice: 1200,
                minTime: '1 час',
                maxTime: '1 день',
                desc: 'Восстановление, откат, модификация'
            },
        },
        brands: {
            nvidia_gtx_old: {
                multiplier: 0.8,
                name: 'NVIDIA GTX 10xx / 16xx',
                models: [
                    { id: 'gtx_1050', name: 'GTX 1050 / 1050 Ti', gen: 0.6 },
                    { id: 'gtx_1060', name: 'GTX 1060 (3/6 GB)', gen: 0.7 },
                    { id: 'gtx_1070', name: 'GTX 1070 / 1070 Ti', gen: 0.8 },
                    {
                        id: 'gtx_1080', name: 'GTX 1080 / 1080 Ti', gen: 0.9,
                        specificPrices: { reball: 4000, gpu_replace: 5500 }
                    },
                    { id: 'gtx_1650', name: 'GTX 1650 / 1650 Super', gen: 0.7 },
                    { id: 'gtx_1660', name: 'GTX 1660 / 1660 Super / Ti', gen: 0.8 },
                ]
            },
            nvidia_rtx_20: {
                multiplier: 1.0,
                name: 'NVIDIA RTX 20xx',
                models: [
                    { id: 'rtx_2060', name: 'RTX 2060 / 2060 Super', gen: 0.9 },
                    { id: 'rtx_2070', name: 'RTX 2070 / 2070 Super', gen: 1.0 },
                    {
                        id: 'rtx_2080', name: 'RTX 2080 / 2080 Super', gen: 1.1,
                        specificPrices: { reball: 5000, gpu_replace: 7000 }
                    },
                    {
                        id: 'rtx_2080ti', name: 'RTX 2080 Ti', gen: 1.3,
                        specificPrices: { reball: 6000, gpu_replace: 8500, vram_replace: 5000 }
                    },
                ]
            },
            nvidia_rtx_30: {
                multiplier: 1.2,
                name: 'NVIDIA RTX 30xx',
                models: [
                    { id: 'rtx_3060', name: 'RTX 3060 / 3060 Ti', gen: 1.0 },
                    {
                        id: 'rtx_3070', name: 'RTX 3070 / 3070 Ti', gen: 1.2,
                        specificPrices: { reball: 5500, gpu_replace: 8000 }
                    },
                    {
                        id: 'rtx_3080', name: 'RTX 3080 / 3080 Ti', gen: 1.4,
                        specificPrices: { reball: 7000, gpu_replace: 10000, vram_replace: 5500 }
                    },
                    {
                        id: 'rtx_3090', name: 'RTX 3090 / 3090 Ti', gen: 1.6,
                        specificPrices: { reball: 8500, gpu_replace: 12500, vram_replace: 6500 }
                    },
                ]
            },
            nvidia_rtx_40: {
                multiplier: 1.5,
                name: 'NVIDIA RTX 40xx',
                models: [
                    { id: 'rtx_4060', name: 'RTX 4060 / 4060 Ti', gen: 1.2 },
                    {
                        id: 'rtx_4070', name: 'RTX 4070 / 4070 Super / Ti', gen: 1.4,
                        specificPrices: { reball: 7500, gpu_replace: 11000 }
                    },
                    {
                        id: 'rtx_4080', name: 'RTX 4080 / 4080 Super', gen: 1.6,
                        specificPrices: { reball: 9000, gpu_replace: 14000, vram_replace: 7000 }
                    },
                    {
                        id: 'rtx_4090', name: 'RTX 4090', gen: 1.8,
                        specificPrices: { reball: 11000, gpu_replace: 18000, vram_replace: 8000, cleaning: 3000 }
                    },
                ]
            },
            amd_rx_old: {
                multiplier: 0.9,
                name: 'AMD Radeon RX 5xx / Vega',
                models: [
                    {
                        id: 'rx_580', name: 'RX 570 / 580 / 590', gen: 0.6,
                        specificPrices: { reball: 3800 }
                    },
                    {
                        id: 'rx_vega', name: 'RX Vega 56 / 64', gen: 0.8,
                        specificPrices: { reball: 4500, thermal: 2500 }
                    },
                ]
            },
            amd_rx_5000: {
                multiplier: 1.0,
                name: 'AMD Radeon RX 5xxx',
                models: [
                    { id: 'rx_5600', name: 'RX 5600 XT', gen: 0.9 },
                    {
                        id: 'rx_5700', name: 'RX 5700 / 5700 XT', gen: 1.0,
                        specificPrices: { reball: 5000 }
                    },
                ]
            },
            amd_rx_6000: {
                multiplier: 1.2,
                name: 'AMD Radeon RX 6xxx',
                models: [
                    { id: 'rx_6600', name: 'RX 6600 / 6600 XT', gen: 1.0 },
                    { id: 'rx_6700', name: 'RX 6700 XT', gen: 1.1 },
                    {
                        id: 'rx_6800', name: 'RX 6800 / 6800 XT', gen: 1.3,
                        specificPrices: { reball: 6500, gpu_replace: 9000 }
                    },
                    {
                        id: 'rx_6900', name: 'RX 6900 XT / 6950 XT', gen: 1.5,
                        specificPrices: { reball: 8000, gpu_replace: 12000, vram_replace: 6000 }
                    },
                ]
            },
            amd_rx_7000: {
                multiplier: 1.4,
                name: 'AMD Radeon RX 7xxx',
                models: [
                    { id: 'rx_7600', name: 'RX 7600 / 7600 XT', gen: 1.2 },
                    { id: 'rx_7700', name: 'RX 7700 XT', gen: 1.3 },
                    {
                        id: 'rx_7800', name: 'RX 7800 XT', gen: 1.4,
                        specificPrices: { reball: 8000, gpu_replace: 11500 }
                    },
                    {
                        id: 'rx_7900', name: 'RX 7900 XT / XTX', gen: 1.7,
                        specificPrices: { reball: 10000, gpu_replace: 15500, vram_replace: 7500 }
                    },
                ]
            },
            intel_arc: {
                multiplier: 1.1,
                name: 'Intel Arc',
                models: [
                    { id: 'arc_a580', name: 'Arc A580', gen: 1.0 },
                    { id: 'arc_a750', name: 'Arc A750', gen: 1.1 },
                    { id: 'arc_a770', name: 'Arc A770', gen: 1.2 },
                    { id: 'arc_b580', name: 'Arc B580 (Battlemage)', gen: 1.3 },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другая видеокарта',
                models: [
                    { id: 'gpu_office', name: 'Офисная (GT 710/1030)', gen: 0.6 },
                    { id: 'gpu_mid_old', name: 'Средняя (до 2018)', gen: 0.8 },
                    { id: 'gpu_mid_new', name: 'Средняя (2019-2022)', gen: 1.0 },
                    { id: 'gpu_top', name: 'Топовая (2023+)', gen: 1.3 },
                ]
            },
        },
    },
};

export default function RepairCalculator({ initialDeviceType = null }) {
    const [deviceType, setDeviceType] = useState(null);
    const [brand, setBrand] = useState(null);
    const [modelId, setModelId] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);


    const toggleService = (key) => {
        setSelectedServices(prev =>
            prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
        );
    };

    const reset = () => {
        setDeviceType(null);
        setBrand(null);
        setModelId(null);
        setSelectedServices([]);
    };

    const calculatePrice = useMemo(() => {
        if (!deviceType || !brand || !modelId || selectedServices.length === 0) return null;

        const category = PRICING[deviceType];
        const brandData = category.brands[brand];
        const modelData = brandData.models.find(m => m.id === modelId);

        if (!modelData) return null;

        let minTotal = 0;
        let maxTotal = 0;

        const details = selectedServices.map(serviceKey => {
            const service = category.services[serviceKey];

            let price = modelData.specificPrices?.[serviceKey];

            if (price === undefined) {
                price = Math.round(
                    service.basePrice *
                    (modelData.gen || 1.0) *
                    (brandData.multiplier || 1.0)
                );
            }

            const minPrice = Math.round(price * 0.85);
            const maxPrice = Math.round(price * 1.15);

            minTotal += minPrice;
            maxTotal += maxPrice;

            return { ...service, minPrice, maxPrice };
        });

        return { minTotal, maxTotal, details, modelName: modelData.name };
    }, [deviceType, brand, modelId, selectedServices]);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
            `}} />

            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#002147' }}>
                        🧮 Калькулятор стоимости ремонта
                    </h2>
                    <p className="text-gray-600 text-lg">Точный расчёт с учётом вашей модели</p>
                </div>

                <div className="rounded-3xl p-6 md:p-8 shadow-2xl border-2" style={{
                    background: 'rgba(255,255,255,0.95)', borderColor: '#002147', backdropFilter: 'blur(10px)'
                }}>

                    {/* Шаг 1: Тип устройства */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>1</div>
                            <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Что ремонтируем?</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {Object.entries(PRICING).map(([key, cat]) => (
                                <button key={key} onClick={() => { setDeviceType(key); setBrand(null); setModelId(null); setSelectedServices([]); }}
                                    className="group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border-2 hover:scale-105"
                                    style={{ background: deviceType === key ? 'linear-gradient(135deg, #002147 0%, #003d7a 100%)' : 'white', borderColor: deviceType === key ? '#002147' : '#e2e8f0', color: deviceType === key ? 'white' : '#002147' }}>
                                    <div className="text-4xl mb-2">{cat.icon}</div>
                                    <div className="font-bold text-sm">{cat.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Шаг 2: Бренд */}
                    {deviceType && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>2</div>
                                <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Выберите бренд / серию</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(PRICING[deviceType].brands).map(([key, b]) => (
                                    <button key={key} onClick={() => { setBrand(key); setModelId(null); setSelectedServices([]); }}
                                        className="rounded-xl p-4 transition-all duration-300 border-2 hover:scale-105 text-left"
                                        style={{ background: brand === key ? 'linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)' : 'white', borderColor: brand === key ? '#ff8c00' : '#e2e8f0', color: brand === key ? 'white' : '#002147' }}>
                                        <div className="font-bold text-sm mb-1">{b.name}</div>
                                        <div className="text-xs opacity-80">{b.models.length} {b.models.length === 1 ? 'модель' : b.models.length < 5 ? 'модели' : 'моделей'}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Шаг 3: Модель */}
                    {brand && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>3</div>
                                <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Выберите точную модель</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {PRICING[deviceType].brands[brand].models.map((m) => (
                                        <button key={m.id} onClick={() => { setModelId(m.id); setSelectedServices([]); }}
                                            className="rounded-xl p-4 transition-all duration-300 border-2 text-left hover:scale-[1.02]"
                                            style={{ background: modelId === m.id ? 'linear-gradient(135deg, #002147 0%, #003d7a 100%)' : 'white', borderColor: modelId === m.id ? '#002147' : '#e2e8f0', color: modelId === m.id ? 'white' : '#002147' }}>
                                            <div className="font-semibold">{m.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Шаг 4: Услуги */}
                    {modelId && (
                        <div className="mb-8 animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#002147' }}>4</div>
                                <h3 className="text-xl font-bold" style={{ color: '#002147' }}>Какие работы нужны?</h3>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(PRICING[deviceType].services).map(([key, svc]) => {
                                    const modelData = PRICING[deviceType].brands[brand].models.find(m => m.id === modelId);
                                    const brandData = PRICING[deviceType].brands[brand];

                                    let price = modelData.specificPrices?.[key];
                                    if (price === undefined) {
                                        price = Math.round(svc.basePrice * (modelData.gen || 1) * (brandData.multiplier || 1));
                                    }

                                    const isSelected = selectedServices.includes(key);
                                    return (
                                        <button key={key} onClick={() => toggleService(key)}
                                            className="w-full rounded-2xl p-5 transition-all duration-300 border-2 hover:scale-[1.02] text-left"
                                            style={{ background: isSelected ? 'linear-gradient(135deg, #fff4e6 0%, #ffe8cc 100%)' : 'white', borderColor: isSelected ? '#ff8c00' : '#e2e8f0' }}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {isSelected && <span style={{ color: '#ff8c00' }}>✓</span>}
                                                        <h4 className="font-bold text-lg" style={{ color: '#002147' }}>{svc.name}</h4>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-1">{svc.desc}</p>
                                                    <div className="text-xs text-gray-500">⏱️ {svc.minTime} — {svc.maxTime}</div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-bold text-lg" style={{ color: '#ff8c00' }}>~{price.toLocaleString('ru-RU')}₽</div>
                                                    <div className="text-xs text-gray-500">работа</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Результат */}
                    {calculatePrice && (
                        <div className="animate-fadeIn">
                            <div className="rounded-3xl p-6 md:p-8 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #002147 0%, #003d7a 100%)' }}>
                                <div className="text-center mb-6">
                                    <div className="text-sm opacity-80 mb-2">Для {calculatePrice.modelName}</div>
                                    <h3 className="text-2xl font-bold mb-2">💰 Стоимость работ</h3>
                                    <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ff8c00' }}>
                                        {calculatePrice.minTotal.toLocaleString('ru-RU')} – {calculatePrice.maxTotal.toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>

                                <div className="bg-white/10 rounded-2xl p-4 mb-6 space-y-2">
                                    {calculatePrice.details.map((d, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="opacity-90">{d.name}</span>
                                            <span className="font-semibold">{d.minPrice.toLocaleString()} – {d.maxPrice.toLocaleString()} ₽</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white/10 rounded-xl p-3 mb-6 text-center text-sm opacity-90">
                                    ⚡ *Цена указана только за работу мастера<br />Стоимость запчастей рассчитывается отдельно
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <a href="tel:+79115018828" className="flex items-center justify-center py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform" style={{ background: '#28a745', color: 'white' }}>📞 Позвонить</a>
                                    <Link href="/contacts" className="flex items-center justify-center py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform" style={{ background: 'white', color: '#002147' }}>📍 Приехать</Link>
                                </div>
                                <button onClick={reset} className="w-full py-3 rounded-xl font-semibold hover:scale-105 transition-transform" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>🔄 Рассчитать заново</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}