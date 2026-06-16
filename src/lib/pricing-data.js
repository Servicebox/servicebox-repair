export const PRICING = {
    phone: {
        label: 'Смартфон',
        icon: '📱',
        services: {
            diagnostics: {
                name: 'Диагностика',
                basePrice: 0,
                minTime: '15 мин',
                maxTime: '30 мин',
                desc: '⚡ БЕСПЛАТНО. Точное определение неисправности за 15 минут'
            },
            screen: { name: 'Замена экрана (модуль)', basePrice: 3500, minTime: '30 мин', maxTime: '2 часа', desc: 'Замена дисплейного модуля целиком' },
            battery: { name: 'Замена аккумулятора', basePrice: 2500, minTime: '20 мин', maxTime: '1 час', desc: 'Работа без учёта батареи' },
            glass: { name: 'Переклейка внешнего стекла (OLED)', basePrice: 3500, minTime: '2 часа', maxTime: '4 часа', desc: 'Только для OLED/AMOLED с раздельным стеклом', requiresSeparateGlass: true, appleOnly: true },
            back_glass: { name: 'Замена задней крышки/стекла', basePrice: 4000, minTime: '1 час', maxTime: '3 часа', desc: 'Замена задней панели корпуса' },
            charging_type_c: { name: 'Замена разъёма Type-C', basePrice: 2800, minTime: '40 мин', maxTime: '2 часа', desc: 'USB Type-C порт (работа)', portType: 'type_c' },
            charging_lightning: { name: 'Замена разъёма Lightning', basePrice: 3200, minTime: '40 мин', maxTime: '2 часа', desc: 'Apple Lightning порт (работа)', portType: 'lightning', appleOnly: true },
            charging_micro_usb: { name: 'Замена разъёма Micro-USB', basePrice: 1800, minTime: '40 мин', maxTime: '2 часа', desc: 'Micro-USB порт (работа)', portType: 'micro_usb' },
            charging_30pin: { name: 'Замена разъёма 30-pin', basePrice: 2000, minTime: '40 мин', maxTime: '2 часа', desc: 'Старый Apple 30-pin', portType: '30pin', appleOnly: true },
            back_camera: { name: 'Замена задней камеры', basePrice: 2500, minTime: '30 мин', maxTime: '1.5 часа', desc: 'Основная камера' },
            front_camera: { name: 'Замена передней камеры', basePrice: 2800, minTime: '30 мин', maxTime: '1 час', desc: 'Фронтальная камера' },
            camera_glass: { name: 'Замена стекла камеры', basePrice: 1800, minTime: '20 мин', maxTime: '40 мин', desc: 'Защитное стекло камеры' },
            speaker: { name: 'Замена динамика', basePrice: 2200, minTime: '30 мин', maxTime: '1 час', desc: 'Слуховой / полифонический' },
            speaker_cleaning: { name: 'Чистка динамиков/микрофонов', basePrice: 800, minTime: '15 мин', maxTime: '30 мин', desc: 'Удаление пыли и грязи' },
            microphone: { name: 'Замена микрофона', basePrice: 2200, minTime: '30 мин', maxTime: '1 час', desc: 'Ремонт/замена микрофона' },
            buttons: { name: 'Ремонт кнопок', basePrice: 1500, minTime: '30 мин', maxTime: '1 час', desc: 'Питание, громкость, Home' },
            volume_buttons: { name: 'Замена кнопок громкости', basePrice: 2000, minTime: '30 мин', maxTime: '1 час', desc: 'Кнопки +/- громкости' },
            power_button: { name: 'Замена кнопки включения', basePrice: 2200, minTime: '30 мин', maxTime: '1 час', desc: 'Кнопка питания' },
            silent_switch: { name: 'Замена переключателя вибро', basePrice: 2200, minTime: '30 мин', maxTime: '1 час', desc: 'Переключатель беззвучного режима', appleOnly: true },
            vibration_motor: { name: 'Замена вибромотора', basePrice: 1800, minTime: '30 мин', maxTime: '1 час', desc: 'Taptic Engine / вибромотор' },
            antenna: { name: 'Замена антенны', basePrice: 1800, minTime: '40 мин', maxTime: '1.5 часа', desc: 'Антенна связи/Wi-Fi' },
            proximity_sensor: { name: 'Замена датчика приближения', basePrice: 1500, minTime: '30 мин', maxTime: '1 час', desc: 'Датчик приближения/освещения' },
            wifi_module: { name: 'Замена Wi-Fi модуля', basePrice: 3500, minTime: '1 час', maxTime: '3 часа', desc: 'Ремонт/замена Wi-Fi чипа' },
            face_id: { name: 'Ремонт Face ID / Touch ID', basePrice: 4500, minTime: '1 день', maxTime: '3 дня', desc: 'Восстановление биометрии', requiresFaceId: true, appleOnly: true },
            water: { name: 'Восстановление после воды', basePrice: 4500, minTime: '1 день', maxTime: '5 дней', desc: 'Ультразвуковая чистка платы' },
            motherboard: { name: 'Ремонт материнской платы', basePrice: 5000, minTime: '2 дня', maxTime: '5 дней', desc: 'BGA-пайка, восстановление цепей' },
            power_controller: { name: 'Замена контроллера питания', basePrice: 3500, minTime: '1 день', maxTime: '3 дня', desc: 'Ремонт цепи питания' },
            housing: { name: 'Замена корпуса', basePrice: 5000, minTime: '2 часа', maxTime: '4 часа', desc: 'Полная замена корпуса' },
            hydrogel: { name: 'Гидрогелевая защита', basePrice: 800, minTime: '10 мин', maxTime: '20 мин', desc: 'Установка защитной плёнки' },
            software_update: { name: 'Обновление ПО', basePrice: 990, minTime: '20 мин', maxTime: '1 час', desc: 'Обновление iOS/Android' },
            data_transfer: { name: 'Перенос данных', basePrice: 990, minTime: '30 мин', maxTime: '2 часа', desc: 'Перенос фото, контактов, приложений' },
            apple_id_setup: { name: 'Настройка Apple ID', basePrice: 990, minTime: '15 мин', maxTime: '30 мин', desc: 'Активация и настройка учётной записи', appleOnly: true },
            password_reset: { name: 'Сброс пароля', basePrice: 990, minTime: '15 мин', maxTime: '30 мин', desc: 'Восстановление доступа' },
        },
        brands: {
            apple: {
                multiplier: 1.3,
                name: 'Apple iPhone',
                models: [
                    { id: 'iphone_7_8', name: 'iPhone 7 / 8', gen: 0.5, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2000, screen: 3000, glass: 2500, back_glass: 2500, charging_lightning: 2000, speaker: 1000, microphone: 2000, back_camera: 2500, front_camera: 1500, camera_glass: 1000, volume_buttons: 1500, power_button: 1500, silent_switch: 1500, antenna: 1500, proximity_sensor: 1500, vibration_motor: 1500, water: 1500, motherboard: 1500, power_controller: 1500, face_id: 1500, wifi_module: 1500 } },
                    { id: 'iphone_7_8_plus', name: 'iPhone 7 Plus / 8 Plus', gen: 0.5, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2300, screen: 3500, glass: 3000, back_glass: 2800, charging_lightning: 2300, speaker: 1300, microphone: 2200, back_camera: 2800, front_camera: 1800, camera_glass: 1200, volume_buttons: 1800, power_button: 1800, silent_switch: 1800, antenna: 1800, proximity_sensor: 1800, vibration_motor: 1800, water: 1800, motherboard: 1800, power_controller: 1800, face_id: 1800, wifi_module: 1800 } },
                    { id: 'iphone_x_xs', name: 'iPhone X / XS', gen: 0.7, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 1990, screen: 2490, glass: 2990, face_id: 1490, back_glass: 1990, charging_lightning: 1990, speaker: 990, microphone: 1990, back_camera: 2490, front_camera: 1490, camera_glass: 990, volume_buttons: 1490, power_button: 1490, silent_switch: 1490, antenna: 1490, proximity_sensor: 1490, vibration_motor: 1490, water: 1490, motherboard: 1490, power_controller: 1490, wifi_module: 1490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_xr', name: 'iPhone XR / 11', gen: 0.8, portType: 'lightning', specificPrices: { diagnostics: 0, battery: 1990, screen: 2490, face_id: 1490, back_glass: 2490, charging_lightning: 1990, speaker: 990, microphone: 1990, back_camera: 2490, front_camera: 1490, camera_glass: 990, volume_buttons: 1490, power_button: 1490, silent_switch: 1490, antenna: 1490, proximity_sensor: 1490, vibration_motor: 1490, water: 1490, motherboard: 1490, power_controller: 1490, wifi_module: 1490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_xs_max', name: 'iPhone XS Max', gen: 0.7, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 1990, screen: 2690, glass: 2990, face_id: 1490, back_glass: 1990, charging_lightning: 1990, speaker: 990, microphone: 1990, back_camera: 2490, front_camera: 1490, camera_glass: 990, volume_buttons: 1490, power_button: 1490, silent_switch: 1490, antenna: 1490, proximity_sensor: 1490, vibration_motor: 1490, water: 1490, motherboard: 1490, power_controller: 1490, wifi_module: 1490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_11_pro', name: 'iPhone 11 Pro', gen: 0.85, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2490, screen: 2990, glass: 3990, face_id: 2490, back_glass: 2990, charging_lightning: 3990, speaker: 1490, microphone: 1990, back_camera: 4490, front_camera: 1990, camera_glass: 1490, volume_buttons: 2490, power_button: 2090, silent_switch: 2090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_11_pro_max', name: 'iPhone 11 Pro Max', gen: 0.85, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2490, screen: 2990, glass: 4990, face_id: 2490, back_glass: 3490, charging_lightning: 3990, speaker: 1490, microphone: 1990, back_camera: 4490, front_camera: 1990, camera_glass: 1490, volume_buttons: 2490, power_button: 2090, silent_switch: 2090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_se', name: 'iPhone SE (2020/2022)', gen: 0.6, portType: 'lightning', specificPrices: { diagnostics: 0, battery: 2200, screen: 3500 } },
                    { id: 'iphone_12_mini', name: 'iPhone 12 Mini', gen: 0.95, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3490, screen: 3690, glass: 4990, face_id: 2490, back_glass: 3490, charging_lightning: 3490, speaker: 1990, microphone: 2990, back_camera: 3990, front_camera: 2490, camera_glass: 1490, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_12', name: 'iPhone 12 / 12 Pro', gen: 0.95, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3490, screen: 3690, glass: 5990, face_id: 2490, back_glass: 3990, charging_lightning: 2990, speaker: 1990, microphone: 2990, back_camera: 2490, front_camera: 2490, camera_glass: 1490, volume_buttons: 2490, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_12_pro_max', name: 'iPhone 12 Pro Max', gen: 0.95, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3990, screen: 4690, glass: 6990, face_id: 2490, back_glass: 5490, charging_lightning: 3490, speaker: 1990, microphone: 2990, back_camera: 6990, front_camera: 2490, camera_glass: 1990, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_13_mini', name: 'iPhone 13 Mini', gen: 1.0, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2990, screen: 4990, glass: 10990, face_id: 2490, back_glass: 4490, charging_lightning: 2990, speaker: 1990, microphone: 2990, back_camera: 2990, front_camera: 2490, camera_glass: 1990, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_13', name: 'iPhone 13', gen: 1.0, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3490, screen: 5490, glass: 10990, face_id: 2490, back_glass: 4990, charging_lightning: 2990, speaker: 1990, microphone: 2990, back_camera: 3990, front_camera: 2490, camera_glass: 1990, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_13_pro', name: 'iPhone 13 Pro', gen: 1.0, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3990, screen: 6490, glass: 11990, face_id: 2490, back_glass: 5490, charging_lightning: 2990, speaker: 1990, microphone: 2990, back_camera: 4990, front_camera: 2490, camera_glass: 1990, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_13_pro_max', name: 'iPhone 13 Pro Max', gen: 1.0, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4490, screen: 7490, glass: 12990, face_id: 2490, back_glass: 5990, charging_lightning: 2990, speaker: 1990, microphone: 2990, back_camera: 5490, front_camera: 2490, camera_glass: 1990, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_14', name: 'iPhone 14', gen: 1.1, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4490, screen: 4490, glass: 7990, face_id: 2490, back_glass: 4490, charging_lightning: 3990, speaker: 2490, microphone: 2990, back_camera: 4990, front_camera: 3490, camera_glass: 2990, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_14_plus', name: 'iPhone 14 Plus', gen: 1.1, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4490, screen: 4990, glass: 8990, face_id: 2490, back_glass: 6490, charging_lightning: 3990, speaker: 2490, microphone: 2990, back_camera: 5990, front_camera: 3490, camera_glass: 2990, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_14_pro', name: 'iPhone 14 Pro', gen: 1.1, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4990, screen: 4990, glass: 11990, face_id: 2490, back_glass: 6490, charging_lightning: 3990, speaker: 2490, microphone: 2990, back_camera: 6490, front_camera: 3490, camera_glass: 2490, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_14_pro_max', name: 'iPhone 14 Pro Max', gen: 1.1, portType: 'lightning', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4990, screen: 4990, glass: 11990, face_id: 2490, back_glass: 7490, charging_lightning: 3990, speaker: 2490, microphone: 2990, back_camera: 6490, front_camera: 3490, camera_glass: 2490, volume_buttons: 2990, power_button: 3090, silent_switch: 3090, antenna: 2390, proximity_sensor: 1990, vibration_motor: 2390, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_15', name: 'iPhone 15 / 15 Plus', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4500, screen: 5490, glass: 9990, face_id: 7490, back_glass: 8990, charging_type_c: 4990, back_camera: 6990, front_camera: 3990, camera_glass: 3490, speaker: 3490, microphone: 3490, volume_buttons: 3490, power_button: 3590, silent_switch: 3590, antenna: 2890, proximity_sensor: 2490, vibration_motor: 2890, water: 2990, motherboard: 2990, power_controller: 2990, wifi_module: 2990, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_15_pro', name: 'iPhone 15 Pro', gen: 0.9, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 5990, screen: 5990, glass: 13990, face_id: 8490, back_glass: 8990, charging_type_c: 4990, back_camera: 6990, front_camera: 3990, camera_glass: 3490, speaker: 3490, microphone: 3490, volume_buttons: 3490, power_button: 3590, silent_switch: 3590, antenna: 2890, proximity_sensor: 2490, vibration_motor: 2890, water: 2990, motherboard: 2990, power_controller: 2990, wifi_module: 2990, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_15_pro_max', name: 'iPhone 15 Pro Max', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 6490, screen: 6990, glass: 15990, face_id: 8990, back_glass: 8990, charging_type_c: 5490, back_camera: 7990, front_camera: 4490, camera_glass: 3990, speaker: 3990, microphone: 3990, volume_buttons: 3990, power_button: 4090, silent_switch: 4090, antenna: 3390, proximity_sensor: 2990, vibration_motor: 3390, water: 3490, motherboard: 3490, power_controller: 3490, wifi_module: 3490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_16', name: 'iPhone 16 / 16 Plus', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4990, screen: 6490, glass: 10990, face_id: 8990, back_glass: 8990, charging_type_c: 4990, back_camera: 6990, front_camera: 4990, camera_glass: 3490, speaker: 3490, microphone: 3490, volume_buttons: 3490, power_button: 3590, silent_switch: 3590, antenna: 2890, proximity_sensor: 2490, vibration_motor: 2890, water: 2990, motherboard: 2990, power_controller: 2990, wifi_module: 2990, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_16_pro', name: 'iPhone 16 Pro', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 6990, screen: 6990, glass: 18990, face_id: 9990, back_glass: 8990, charging_type_c: 4990, back_camera: 6990, front_camera: 4990, camera_glass: 3490, speaker: 3490, microphone: 3490, volume_buttons: 3490, power_button: 3590, silent_switch: 3590, antenna: 2890, proximity_sensor: 2490, vibration_motor: 2890, water: 2990, motherboard: 2990, power_controller: 2990, wifi_module: 2990, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_16_pro_max', name: 'iPhone 16 Pro Max', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 7990, screen: 6990, glass: 20990, face_id: 10490, back_glass: 8990, charging_type_c: 4990, back_camera: 6990, front_camera: 4990, camera_glass: 3490, speaker: 3490, microphone: 3490, volume_buttons: 3490, power_button: 3590, silent_switch: 3590, antenna: 2890, proximity_sensor: 2490, vibration_motor: 2890, water: 2990, motherboard: 2990, power_controller: 2990, wifi_module: 2990, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990 } },
                    { id: 'iphone_17', name: 'iPhone 17 / 17 Plus', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 5490, screen: 7990, glass: 24390, face_id: 10000, back_glass: 8990, charging_type_c: 7490, back_camera: 9490, front_camera: 5490, camera_glass: 1990, speaker: 2990, microphone: 2990, volume_buttons: 3990, power_button: 4090, silent_switch: 4090, antenna: 2390, proximity_sensor: 2990, vibration_motor: 2390, housing: 7490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990, water: 2490, motherboard: 2490, power_controller: 2490, wifi_module: 2490 } },
                    { id: 'iphone_17_air', name: 'iPhone Air (тонкий)', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 8490, screen: 9490, glass: 26490, face_id: 12000, back_glass: 8990, charging_type_c: 7490, back_camera: 9490, front_camera: 6490, camera_glass: 2990, speaker: 3990, microphone: 2990, volume_buttons: 3990, power_button: 4090, silent_switch: 4090, antenna: 2390, proximity_sensor: 2990, vibration_motor: 2390, housing: 9490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990, water: 3490, motherboard: 2490, power_controller: 2490, wifi_module: 2490 } },
                    { id: 'iphone_17_pro', name: 'iPhone 17 Pro', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 5490, screen: 8990, glass: 24900, face_id: 11500, back_glass: 8990, charging_type_c: 7490, back_camera: 9490, front_camera: 5490, camera_glass: 2990, speaker: 3990, microphone: 2990, volume_buttons: 3990, power_button: 4090, silent_switch: 4090, antenna: 2390, proximity_sensor: 2990, vibration_motor: 2390, housing: 7490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990, water: 3490, motherboard: 2490, power_controller: 2490, wifi_module: 2490 } },
                    { id: 'iphone_17_pro_max', name: 'iPhone 17 Pro Max', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 8490, screen: 9490, glass: 28490, face_id: 12500, back_glass: 8990, charging_type_c: 7490, back_camera: 9490, front_camera: 6490, camera_glass: 2990, speaker: 3990, microphone: 2990, volume_buttons: 3990, power_button: 4090, silent_switch: 4090, antenna: 2390, proximity_sensor: 2990, vibration_motor: 2390, housing: 7490, hydrogel: 800, software_update: 990, data_transfer: 990, apple_id_setup: 990, password_reset: 990, water: 3490, motherboard: 2490, power_controller: 2490, wifi_module: 2490 } },
                ]
            },
            samsung: {
                multiplier: 1.1,
                name: 'Samsung Galaxy',
                models: [
                    { id: 'galaxy_a_old_micro', name: 'Galaxy A3/A5/A7/J3/J5/J7 (2016-2018)', gen: 0.5, portType: 'micro_usb', specificPrices: { diagnostics: 0, battery: 1500, screen: 2500, glass: 2000, back_glass: 1500, charging_micro_usb: 1500, speaker: 1000, microphone: 1000, back_camera: 1000, front_camera: 1000, camera_glass: 800, power_button: 1000, volume_buttons: 1000, antenna: 1000, vibration_motor: 1000, proximity_sensor: 1000, fingerprint: 1000, software_update: 990, password_reset: 990 } },
                    { id: 'galaxy_a_mid', name: 'Galaxy A10-A54 / M-series', gen: 0.7, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 1800, screen: 3500, glass: 2500, back_glass: 2000, charging_type_c: 1800, speaker: 1200, microphone: 1200, back_camera: 1200, front_camera: 1200, camera_glass: 900, power_button: 1200, volume_buttons: 1200, antenna: 1200, vibration_motor: 1200, proximity_sensor: 1200, nfc: 1200, fingerprint: 1200, software_update: 990, password_reset: 990 } },
                    { id: 'galaxy_s_old', name: 'Galaxy S8/S9/S10/S20 / Note 8-10', gen: 0.8, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2000, screen: 4500, glass: 3000, back_glass: 2500, charging_type_c: 2000, speaker: 1500, microphone: 1500, back_camera: 1500, front_camera: 1500, camera_glass: 1000, power_button: 1500, volume_buttons: 1500, antenna: 1500, vibration_motor: 1500, proximity_sensor: 1500, nfc: 1500, fingerprint: 1500, software_update: 990, password_reset: 990 } },
                    { id: 'galaxy_s21', name: 'Galaxy S21/S21+/S21 Ultra', gen: 1.0, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2500, screen: 5000, glass: 3500, back_glass: 3000, charging_type_c: 2200, speaker: 1800, microphone: 1800, back_camera: 1800, front_camera: 1800, camera_glass: 1200, volume_buttons: 1800, power_button: 1800, silent_switch: 1800, antenna: 1800, vibration_motor: 1800, proximity_sensor: 1800, nfc: 1800, fingerprint: 1800, software_update: 990, data_transfer: 990, password_reset: 990, water: 1800, motherboard: 1800, power_controller: 1800, wifi_module: 1800 } },
                    { id: 'galaxy_s22', name: 'Galaxy S22/S22+/S22 Ultra', gen: 1.1, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2800, screen: 5500, glass: 4000, back_glass: 3500, charging_type_c: 2500, speaker: 2000, microphone: 2000, back_camera: 2000, front_camera: 2000, camera_glass: 1500, volume_buttons: 2000, power_button: 2000, silent_switch: 2000, antenna: 2000, vibration_motor: 2000, proximity_sensor: 2000, nfc: 2000, fingerprint: 2000, software_update: 990, data_transfer: 990, password_reset: 990, water: 2000, motherboard: 2000, power_controller: 2000, wifi_module: 2000 } },
                    { id: 'galaxy_s23', name: 'Galaxy S23/S23+/S23 Ultra', gen: 1.2, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3000, screen: 6500, glass: 4500, back_glass: 4000, charging_type_c: 2800, speaker: 2200, microphone: 2200, back_camera: 2200, front_camera: 2200, camera_glass: 1800, volume_buttons: 2200, power_button: 2200, silent_switch: 2200, antenna: 2200, vibration_motor: 2200, proximity_sensor: 2200, nfc: 2200, fingerprint: 2200, software_update: 990, data_transfer: 990, password_reset: 990, water: 2200, motherboard: 2200, power_controller: 2200, wifi_module: 2200 } },
                    { id: 'galaxy_s24', name: 'Galaxy S24/S24+/S24 Ultra', gen: 1.4, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3500, screen: 8000, glass: 5000, back_glass: 4500, charging_type_c: 3000, speaker: 2500, microphone: 2500, back_camera: 2500, front_camera: 2500, camera_glass: 2000, volume_buttons: 2500, power_button: 2500, silent_switch: 2500, antenna: 2500, vibration_motor: 2500, proximity_sensor: 2500, nfc: 2500, fingerprint: 2500, software_update: 990, data_transfer: 990, password_reset: 990, water: 2500, motherboard: 2500, power_controller: 2500, wifi_module: 2500 } },
                    { id: 'galaxy_a_new', name: 'Galaxy A55/A56', gen: 0.95, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3500, screen: 4500 } },
                    { id: 'galaxy_s25', name: 'Galaxy S25 / S25+', gen: 1.5, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4000, screen: 9500, glass: 5500, back_glass: 5000, charging_type_c: 3200, speaker: 2800, microphone: 2800, back_camera: 2800, front_camera: 2800, camera_glass: 2200, volume_buttons: 2800, power_button: 2800, silent_switch: 2800, antenna: 2800, vibration_motor: 2800, proximity_sensor: 2800, nfc: 2800, fingerprint: 2800, software_update: 990, data_transfer: 990, password_reset: 990, water: 2800, motherboard: 2800, power_controller: 2800, wifi_module: 2800 } },
                    { id: 'galaxy_s25_ultra', name: 'Galaxy S25 Ultra', gen: 1.6, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4500, screen: 12000, glass: 6500, back_glass: 5500, charging_type_c: 3500, speaker: 3000, microphone: 3000, back_camera: 3000, front_camera: 3000, camera_glass: 2500, volume_buttons: 3000, power_button: 3000, silent_switch: 3000, antenna: 3000, vibration_motor: 3000, proximity_sensor: 3000, nfc: 3000, fingerprint: 3000, software_update: 990, data_transfer: 990, password_reset: 990, water: 3000, motherboard: 3000, power_controller: 3000, wifi_module: 3000 } },
                    { id: 'galaxy_s25_fe', name: 'Galaxy S25 FE', gen: 1.3, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 5000, screen: 7500, glass: 6000, back_glass: 5000, charging_type_c: 3000, speaker: 2800, microphone: 2800, back_camera: 2800, front_camera: 2800, camera_glass: 2200, volume_buttons: 2800, power_button: 2800, silent_switch: 2800, antenna: 2800, vibration_motor: 2800, proximity_sensor: 2800, nfc: 2800, fingerprint: 2800, software_update: 990, data_transfer: 990, password_reset: 990, water: 2800, motherboard: 2800, power_controller: 2800, wifi_module: 2800 } },
                    // Z Flip / Z Fold
                    { id: 'galaxy_flip', name: 'Galaxy Z Flip 3/4/5/6', gen: 1.5, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3500, screen: 9000, glass: 2500, back_glass: 3000, charging_type_c: 3000, speaker: 2500, microphone: 2500, back_camera: 2500, front_camera: 2500, camera_glass: 2000, volume_buttons: 2500, power_button: 2500, silent_switch: 2500, antenna: 2500, vibration_motor: 2500, proximity_sensor: 2500, nfc: 2500, fingerprint: 2500, software_update: 990, data_transfer: 990, password_reset: 990, water: 2500, motherboard: 2500, power_controller: 2500, wifi_module: 2500 } },
                    { id: 'galaxy_flip7', name: 'Galaxy Z Flip 7', gen: 1.8, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4000, screen: 11000, glass: 3000, back_glass: 3500, charging_type_c: 3200, speaker: 2800, microphone: 2800, back_camera: 2800, front_camera: 2800, camera_glass: 2200, volume_buttons: 2800, power_button: 2800, silent_switch: 2800, antenna: 2800, vibration_motor: 2800, proximity_sensor: 2800, nfc: 2800, fingerprint: 2800, software_update: 990, data_transfer: 990, password_reset: 990, water: 2800, motherboard: 2800, power_controller: 2800, wifi_module: 2800 } },
                    { id: 'galaxy_fold', name: 'Galaxy Z Fold 3/4/5/6', gen: 1.8, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4500, screen: 16000, glass: 3500, back_glass: 4000, charging_type_c: 3500, speaker: 3000, microphone: 3000, back_camera: 3000, front_camera: 3000, camera_glass: 2500, volume_buttons: 3000, power_button: 3000, silent_switch: 3000, antenna: 3000, vibration_motor: 3000, proximity_sensor: 3000, nfc: 3000, fingerprint: 3000, software_update: 990, data_transfer: 990, password_reset: 990, water: 3000, motherboard: 3000, power_controller: 3000, wifi_module: 3000 } },
                    { id: 'galaxy_fold7', name: 'Galaxy Z Fold 7', gen: 2.0, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 5000, screen: 20000, glass: 4000, back_glass: 5000, charging_type_c: 3800, speaker: 3200, microphone: 3200, back_camera: 3200, front_camera: 3200, camera_glass: 2800, volume_buttons: 3200, power_button: 3200, silent_switch: 3200, antenna: 3200, vibration_motor: 3200, proximity_sensor: 3200, nfc: 3200, fingerprint: 3200, software_update: 990, data_transfer: 990, password_reset: 990, water: 3200, motherboard: 3200, power_controller: 3200, wifi_module: 3200 } },
                ]
            },
            xiaomi: {
                multiplier: 0.9,
                name: 'Xiaomi / Redmi / POCO',
                models: [
                    { id: 'redmi_7_8_9', name: 'Redmi 7/8/9/9A/9C', gen: 0.4, portType: 'micro_usb', specificPrices: { diagnostics: 0, battery: 1290, screen: 2490, back_glass: 890, charging_micro_usb: 1290, speaker: 890, microphone: 890, back_camera: 890, front_camera: 890, camera_glass: 690, power_button: 890, volume_buttons: 890, antenna: 890, vibration_motor: 890, proximity_sensor: 890, fingerprint: 890, software_update: 990, password_reset: 990 } },
                    { id: 'redmi_note_7_8', name: 'Redmi Note 7/8/8 Pro', gen: 0.5, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 1390, screen: 2690, back_glass: 990, charging_type_c: 1390, speaker: 990, microphone: 990, back_camera: 990, front_camera: 990, camera_glass: 790, power_button: 990, volume_buttons: 990, antenna: 990, vibration_motor: 990, proximity_sensor: 990, fingerprint: 990, software_update: 990, password_reset: 990 } },
                    { id: 'redmi_note_9_10', name: 'Redmi Note 9/10/10 Pro', gen: 0.7, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 1590, screen: 2990, back_glass: 1190, charging_type_c: 1590, speaker: 1190, microphone: 1190, back_camera: 1190, front_camera: 1190, camera_glass: 890, power_button: 1190, volume_buttons: 1190, antenna: 1190, vibration_motor: 1190, proximity_sensor: 1190, nfc: 1190, fingerprint: 1190, software_update: 990, password_reset: 990 } },
                    { id: 'redmi_note_11_12', name: 'Redmi Note 11/12/12 Pro', gen: 0.9, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 1790, screen: 3290, glass: 1790, back_glass: 1390, charging_type_c: 1790, speaker: 1390, microphone: 1390, back_camera: 1390, front_camera: 1390, camera_glass: 990, power_button: 1390, volume_buttons: 1390, antenna: 1390, vibration_motor: 1390, proximity_sensor: 1390, nfc: 1390, fingerprint: 1390, software_update: 990, password_reset: 990 } },
                    { id: 'poco_x3_x5', name: 'POCO X3/X4/X5/X6/F3/F4/F5', gen: 0.8, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 1690, screen: 3190, back_glass: 1290, charging_type_c: 1690, speaker: 1290, microphone: 1290, back_camera: 1290, front_camera: 1290, camera_glass: 990, power_button: 1290, volume_buttons: 1290, antenna: 1290, vibration_motor: 1290, proximity_sensor: 1290, nfc: 1290, fingerprint: 1290, software_update: 990, password_reset: 990 } },
                    { id: 'xiaomi_flagship', name: 'Xiaomi 11/12/13/14', gen: 1.0, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 1990, screen: 3490, glass: 1990, back_glass: 1590, charging_type_c: 1990, speaker: 1490, microphone: 1490, back_camera: 1490, front_camera: 1490, camera_glass: 1090, power_button: 1490, volume_buttons: 1490, antenna: 1490, vibration_motor: 1490, proximity_sensor: 1490, nfc: 1490, fingerprint: 1490, software_update: 990, password_reset: 990 } },
                    { id: 'redmi_note_new', name: 'Redmi Note 13/13 Pro', gen: 1.0, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3000, screen: 4000 } },
                    { id: 'redmi_note14', name: 'Redmi Note 14 / 14 Pro', gen: 1.0, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3200, screen: 4200 } },
                    { id: 'redmi_note14_pro_plus', name: 'Redmi Note 14 Pro+', gen: 1.2, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3500, screen: 5000, glass: 4500 } },
                    { id: 'xiaomi_15', name: 'Xiaomi 15', gen: 1.5, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4500, screen: 7500, glass: 5000 } },
                    { id: 'xiaomi_15_pro', name: 'Xiaomi 15 Pro', gen: 1.7, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 5000, screen: 9000, glass: 6500 } },
                    { id: 'xiaomi_15_ultra', name: 'Xiaomi 15 Ultra', gen: 2.0, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 6000, screen: 11000, glass: 8500 } },
                    { id: 'xiaomi_14t', name: 'Xiaomi 14T / 14T Pro', gen: 1.3, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 4000, screen: 6500, glass: 5500 } },
                    { id: 'poco_f7', name: 'POCO F7 / F7 Pro', gen: 1.2, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 3800, screen: 5800, glass: 5000 } },
                    { id: 'poco_x7', name: 'POCO X7 / X7 Pro', gen: 1.0, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3000, screen: 4000 } },
                ]
            },
            huawei: {
                multiplier: 1.0,
                name: 'Huawei / Honor',
                models: [
                    { id: 'huawei_p20_p30_lite', name: 'Huawei P20 Lite/P30 Lite', gen: 0.5, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 1490, screen: 2490, back_glass: 990, charging_type_c: 1490, speaker: 990, microphone: 990, back_camera: 990, front_camera: 990, camera_glass: 790, power_button: 990, volume_buttons: 990, antenna: 990, vibration_motor: 990, proximity_sensor: 990, nfc: 990, fingerprint: 990, software_update: 1090, password_reset: 1090 } },
                    { id: 'honor_old_micro', name: 'Honor 6/7/8/9/10 Lite', gen: 0.6, portType: 'micro_usb', specificPrices: { diagnostics: 0, battery: 1390, screen: 2490, back_glass: 990, charging_type_c: 1390, speaker: 990, microphone: 990, back_camera: 990, front_camera: 990, camera_glass: 790, power_button: 990, volume_buttons: 990, antenna: 990, vibration_motor: 990, proximity_sensor: 990, fingerprint: 990, software_update: 990, password_reset: 990 } },
                    { id: 'honor_mid', name: 'Honor 50/60/70/80/90', gen: 0.8, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 1690, screen: 2990, glass: 1790, back_glass: 1190, charging_type_c: 1690, speaker: 1190, microphone: 1190, back_camera: 1190, front_camera: 1190, camera_glass: 890, power_button: 1190, volume_buttons: 1190, antenna: 1190, vibration_motor: 1190, proximity_sensor: 1190, nfc: 1190, fingerprint: 1190, software_update: 990, password_reset: 990 } },
                    { id: 'huawei_p_new', name: 'Huawei P30/P40/P50/P60 Pro', gen: 1.0, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2190, screen: 3990, glass: 2490, back_glass: 1690, charging_type_c: 2190, speaker: 1590, microphone: 1590, back_camera: 1590, front_camera: 1590, camera_glass: 1190, power_button: 1590, volume_buttons: 1590, antenna: 1590, vibration_motor: 1590, proximity_sensor: 1590, nfc: 1590, fingerprint: 1590, software_update: 1090, password_reset: 1090 } },
                    { id: 'honor_magic', name: 'Honor Magic 3/4/5 Pro', gen: 1.2, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2290, screen: 3990, glass: 2490, back_glass: 1790, charging_type_c: 2290, speaker: 1690, microphone: 1690, back_camera: 1690, front_camera: 1690, camera_glass: 1290, power_button: 1690, volume_buttons: 1690, antenna: 1690, vibration_motor: 1690, proximity_sensor: 1690, nfc: 1690, fingerprint: 1690, software_update: 1090, password_reset: 1090 } },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд (Realme, Vivo, Oppo, Motorola)',
                models: [
                    { id: 'other_budget', name: 'Бюджетная модель (до 15000₽)', gen: 0.5, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 1390, screen: 2490, back_glass: 990, charging_type_c: 1390, speaker: 990, microphone: 990, back_camera: 990, front_camera: 990, camera_glass: 790, power_button: 990, volume_buttons: 990, antenna: 990, vibration_motor: 990, proximity_sensor: 990, fingerprint: 990, software_update: 990, password_reset: 990 } },
                    { id: 'other_mid', name: 'Средняя модель (15000-30000₽)', gen: 0.8, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 1690, screen: 2990, glass: 1790, back_glass: 1190, charging_type_c: 1690, speaker: 1190, microphone: 1190, back_camera: 1190, front_camera: 1190, camera_glass: 890, power_button: 1190, volume_buttons: 1190, antenna: 1190, vibration_motor: 1190, proximity_sensor: 1190, nfc: 1190, fingerprint: 1190, software_update: 990, password_reset: 990 } },
                    { id: 'other_flagship', name: 'Флагман (от 30000₽)', gen: 1.2, portType: 'type_c', hasSeparateGlass: true, specificPrices: { diagnostics: 0, battery: 2190, screen: 3990, glass: 2490, back_glass: 1690, charging_type_c: 2190, speaker: 1590, microphone: 1590, back_camera: 1590, front_camera: 1590, camera_glass: 1190, power_button: 1590, volume_buttons: 1590, antenna: 1590, vibration_motor: 1590, proximity_sensor: 1590, nfc: 1590, fingerprint: 1590, software_update: 1090, password_reset: 1090 } },
                ]
            },
        },
    },
    laptop: {
        label: 'Ноутбук',
        icon: '💻',
        services: {
            diagnostics: {
                name: 'Диагностика',
                basePrice: 700,
                minTime: '30 мин',
                maxTime: '2 часа',
                desc: '⚠️ БЕСПЛАТНО при согласии на ремонт. При отказе — от 500 до 1500₽ (зависит от сложности: восстановление цепей питания, замена компонентов для тестирования, поиск микротрещин)'
            },
            screen: { name: 'Замена матрицы', basePrice: 3500, minTime: '1 час', maxTime: '3 часа', desc: 'Работа без учёта матрицы' },
            cleaning: { name: 'Чистка + термопаста', basePrice: 2800, minTime: '1 час', maxTime: '2 часа', desc: 'Полная разборка, замена термопасты' },
            thermal_pads: { name: 'Замена термопрокладок', basePrice: 4500, minTime: '1.5 часа', maxTime: '3 часа', desc: 'Подбор толщины, качественные прокладки (0.5–2.0mm)', requiresThermalPads: true },
            keyboard: { name: 'Замена клавиатуры', basePrice: 3000, minTime: '1 час', maxTime: '3 часа', desc: 'Работа без учёта клавиатуры' },
            motherboard: { name: 'Ремонт мат. платы', basePrice: 6500, minTime: '3 дня', maxTime: '7 дней', desc: 'BGA-пайка, замена чипов' },
            water: { name: 'После залития', basePrice: 5500, minTime: '2 дня', maxTime: '7 дней', desc: 'Ультразвуковая чистка' },
            battery: { name: 'Замена аккумулятора', basePrice: 3000, minTime: '1 час', maxTime: '2 часа', desc: 'Работа без учёта батареи' },
            ssd: { name: 'Установка SSD', basePrice: 1800, minTime: '30 мин', maxTime: '1 час', desc: 'Без стоимости накопителя' },
            reball_cpu: { name: 'Реболл процессора (CPU)', basePrice: 9000, minTime: '3 дня', maxTime: '7 дней', desc: 'BGA-пайка центрального процессора', requiresBga: true },
            reball_gpu: { name: 'Реболл видеочипа (GPU)', basePrice: 8000, minTime: '3 дня', maxTime: '7 дней', desc: 'BGA-пайка графического чипа', requiresBga: true },
            replace_cpu: { name: 'Замена процессора (CPU)', basePrice: 12000, minTime: '5 дней', maxTime: '10 дней', desc: 'Работа без учёта процессора', requiresBga: true },
            replace_gpu: { name: 'Замена видеочипа (GPU)', basePrice: 10000, minTime: '5 дней', maxTime: '10 дней', desc: 'Работа без учёта чипа', requiresBga: true },
            reball_bridge: { name: 'Реболл моста/хаба', basePrice: 6000, minTime: '2 дня', maxTime: '5 дней', desc: 'BGA-пайка южного/северного моста', requiresBga: true },
            ram_replace: { name: 'Замена чипа RAM', basePrice: 5000, minTime: '2 дня', maxTime: '5 дней', desc: 'BGA-пайка оперативной памяти', requiresBga: true },
            power_repair: { name: 'Ремонт цепей питания', basePrice: 6000, minTime: '2 дня', maxTime: '5 дней', desc: 'Восстановление ШИМ, MOSFET' },
        },
        brands: {
            apple: {
                multiplier: 1.8,
                name: 'Apple MacBook',
                models: [
                    { id: 'mba_old', name: 'MacBook Air (Intel 2015-2019)', gen: 0.8, hasBga: true, specificPrices: { screen: 6500, battery: 5500, keyboard: 5000, cleaning: 3500, ssd: 2500, motherboard: 9000, water: 7500, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 14000 } },
                    { id: 'mbp_old', name: 'MacBook Pro (Intel 2016-2019)', gen: 0.9, hasBga: true, specificPrices: { screen: 7500, battery: 6000, keyboard: 6000, cleaning: 4000, ssd: 2500, motherboard: 10000, water: 8500, reball_cpu: 13000, reball_gpu: 12000, replace_cpu: 16000, replace_gpu: 15000 } },
                    { id: 'mba_m1', name: 'MacBook Air M1 (2020)', gen: 1.0, hasBga: true, specificPrices: { screen: 7500, battery: 6000, keyboard: 5500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 14000, reball_gpu: 13000, replace_cpu: 18000, replace_gpu: 16000 } },
                    { id: 'mba_m2', name: 'MacBook Air M2 (2022-2023)', gen: 1.3, hasThermalPads: true, hasBga: true, specificPrices: { screen: 14000, battery: 7000, keyboard: 8000, thermal_pads: 6000, cleaning: 4200, ssd: 2800, motherboard: 12000, water: 9500, reball_cpu: 15000, reball_gpu: 14000, replace_cpu: 20000, replace_gpu: 18000 } },
                    { id: 'mbp_m1', name: 'MacBook Pro M1/M2 (2020-2022)', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 9500, battery: 7500, keyboard: 7000, thermal_pads: 6500, cleaning: 4200, ssd: 2800, motherboard: 11000, water: 9000, reball_cpu: 14000, reball_gpu: 13000, replace_cpu: 18000, replace_gpu: 16000 } },
                    { id: 'mbp_m3', name: 'MacBook Pro M3 (2023-2024)', gen: 1.5, hasThermalPads: true, hasBga: true, specificPrices: { screen: 17000, battery: 9000, keyboard: 9500, thermal_pads: 7500, cleaning: 4500, ssd: 3000, motherboard: 14000, water: 11000, reball_cpu: 16000, reball_gpu: 15000, replace_cpu: 22000, replace_gpu: 20000 } },
                    { id: 'mba_m4_13', name: 'MacBook Air 13" M4 (2025)', gen: 1.6, hasThermalPads: true, hasBga: true, specificPrices: { screen: 16000, battery: 7500, keyboard: 9000, thermal_pads: 7000, cleaning: 4500, ssd: 3000, motherboard: 13000, water: 10500, reball_cpu: 16000, reball_gpu: 15000, replace_cpu: 22000, replace_gpu: 20000 } },
                    { id: 'mba_m4_15', name: 'MacBook Air 15" M4 (2025)', gen: 1.7, hasThermalPads: true, hasBga: true, specificPrices: { screen: 18000, battery: 8000, keyboard: 10000, thermal_pads: 7500, cleaning: 4800, ssd: 3000, motherboard: 14000, water: 11000, reball_cpu: 17000, reball_gpu: 16000, replace_cpu: 23000, replace_gpu: 21000 } },
                    { id: 'mbp_m4_14', name: 'MacBook Pro 14" M4 (2024)', gen: 1.7, hasThermalPads: true, hasBga: true, specificPrices: { screen: 19000, battery: 9500, keyboard: 10500, thermal_pads: 8000, cleaning: 4800, ssd: 3200, motherboard: 15000, water: 12000, reball_cpu: 17000, reball_gpu: 16000, replace_cpu: 24000, replace_gpu: 22000 } },
                    { id: 'mbp_m4_pro_14', name: 'MacBook Pro 14" M4 Pro (2024)', gen: 1.9, hasThermalPads: true, hasBga: true, specificPrices: { screen: 21000, battery: 10500, keyboard: 11500, thermal_pads: 8500, cleaning: 5000, ssd: 3200, motherboard: 17000, water: 13000, reball_cpu: 18000, reball_gpu: 17000, replace_cpu: 25000, replace_gpu: 23000 } },
                    { id: 'mbp_m4_max_16', name: 'MacBook Pro 16" M4 Max (2024)', gen: 2.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 26000, battery: 12500, keyboard: 13500, thermal_pads: 10000, cleaning: 5500, ssd: 3500, motherboard: 20000, water: 15000, reball_cpu: 20000, reball_gpu: 19000, replace_cpu: 28000, replace_gpu: 26000 } },
                ]
            },
            asus: {
                multiplier: 1.0,
                name: 'ASUS',
                models: [
                    { id: 'asus_vivobook', name: 'VivoBook 14/15/16', gen: 0.8, hasBga: true, specificPrices: { screen: 4000, battery: 3200, keyboard: 3000, cleaning: 2800, ssd: 1800, motherboard: 6500, water: 5500, reball_cpu: 9000, reball_gpu: 8000, replace_cpu: 12000, replace_gpu: 10000, reball_bridge: 6000, ram_replace: 5000 } },
                    { id: 'asus_zenbook', name: 'ZenBook 13/14', gen: 1.1, hasBga: true, specificPrices: { screen: 5500, battery: 3800, keyboard: 4000, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'asus_rog', name: 'ROG Strix G16/G18 (до 2024)', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6000, battery: 4000, keyboard: 4500, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 9000, water: 7000, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'asus_tuf', name: 'TUF Gaming A15/F15/F17', gen: 1.0, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5000, battery: 3500, keyboard: 3800, thermal_pads: 5000, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'asus_rog_2025', name: 'ROG Strix G16/G18 (2025)', gen: 1.4, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7000, battery: 4500, keyboard: 5000, thermal_pads: 6500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 7500, ram_replace: 6500 } },
                    { id: 'asus_zenbook_s_2025', name: 'ZenBook S 14 (2025)', gen: 1.3, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6500, battery: 4200, keyboard: 4500, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 9000, water: 7500, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'asus_tuf_a16_2025', name: 'TUF Gaming A16 (2025)', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5500, battery: 3800, keyboard: 4000, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 8500, water: 7000, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                ]
            },
            lenovo: {
                multiplier: 1.0,
                name: 'Lenovo',
                models: [
                    { id: 'lenovo_ideapad', name: 'IdeaPad 3/5', gen: 0.8, hasBga: true, specificPrices: { screen: 4000, battery: 3200, keyboard: 3000, cleaning: 2800, ssd: 1800, motherboard: 6500, water: 5500, reball_cpu: 9000, reball_gpu: 8000, replace_cpu: 12000, replace_gpu: 10000, reball_bridge: 6000, ram_replace: 5000 } },
                    { id: 'lenovo_thinkpad', name: 'ThinkPad E/T/X1', gen: 1.1, hasBga: true, specificPrices: { screen: 5500, battery: 3800, keyboard: 4500, cleaning: 3200, ssd: 2000, motherboard: 8500, water: 7000, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'lenovo_legion', name: 'Legion 5/5i/7/Pro (до 2024)', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6000, battery: 4000, keyboard: 4500, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 9000, water: 7500, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'lenovo_yoga', name: 'Yoga Slim / 9i', gen: 1.1, hasBga: true, specificPrices: { screen: 5500, battery: 3800, keyboard: 4500, cleaning: 3200, ssd: 2000, motherboard: 8500, water: 7000, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'lenovo_legion_2025', name: 'Legion Pro 7i (2025)', gen: 1.4, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7000, battery: 4500, keyboard: 5000, thermal_pads: 6500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 7500, ram_replace: 6500 } },
                    { id: 'lenovo_thinkpad_x1_2025', name: 'ThinkPad X1 Carbon Gen 13 (2025)', gen: 1.3, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7500, battery: 4200, keyboard: 5500, thermal_pads: 6000, cleaning: 3500, ssd: 2200, motherboard: 9500, water: 7500, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'lenovo_loq_2025', name: 'LOQ 15/17 (2025)', gen: 1.1, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5000, battery: 3500, keyboard: 3800, thermal_pads: 5500, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                ]
            },
            hp: {
                multiplier: 1.0,
                name: 'HP',
                models: [
                    { id: 'hp_pavilion', name: 'Pavilion 14/15', gen: 0.8, hasBga: true, specificPrices: { screen: 4000, battery: 3200, keyboard: 3000, cleaning: 2800, ssd: 1800, motherboard: 6500, water: 5500, reball_cpu: 9000, reball_gpu: 8000, replace_cpu: 12000, replace_gpu: 10000, reball_bridge: 6000, ram_replace: 5000 } },
                    { id: 'hp_envy', name: 'Envy 13/15', gen: 1.0, hasBga: true, specificPrices: { screen: 5000, battery: 3500, keyboard: 4000, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'hp_omen', name: 'Omen 15/16/17 (до 2024)', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6000, battery: 4000, keyboard: 4500, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 9000, water: 7500, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'hp_elitebook', name: 'EliteBook / Spectre', gen: 1.3, hasBga: true, specificPrices: { screen: 6500, battery: 4200, keyboard: 5000, cleaning: 3500, ssd: 2200, motherboard: 9500, water: 7500, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'hp_omen_2025', name: 'Omen Transcend 16 (2025)', gen: 1.4, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7000, battery: 4500, keyboard: 5000, thermal_pads: 6500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 7500, ram_replace: 6500 } },
                    { id: 'hp_victus_2025', name: 'Victus 15/16 (2025)', gen: 1.1, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5000, battery: 3500, keyboard: 3800, thermal_pads: 5500, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'hp_spectre_x360_2025', name: 'Spectre x360 14/16 (2025)', gen: 1.4, hasThermalPads: true, hasBga: true, specificPrices: { screen: 8000, battery: 4500, keyboard: 5500, thermal_pads: 6000, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 7500, ram_replace: 6500 } },
                ]
            },
            dell: {
                multiplier: 1.1,
                name: 'Dell',
                models: [
                    { id: 'dell_inspiron', name: 'Inspiron 14/15', gen: 0.8, hasBga: true, specificPrices: { screen: 4200, battery: 3200, keyboard: 3200, cleaning: 3000, ssd: 1800, motherboard: 7000, water: 5800, reball_cpu: 9500, reball_gpu: 8500, replace_cpu: 12500, replace_gpu: 10500, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'dell_xps', name: 'XPS 13/15/17 (до 2024)', gen: 1.4, hasBga: true, specificPrices: { screen: 7000, battery: 4500, keyboard: 5500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 7500, ram_replace: 6500 } },
                    { id: 'dell_latitude', name: 'Latitude / Precision', gen: 1.1, hasBga: true, specificPrices: { screen: 5500, battery: 3800, keyboard: 4500, cleaning: 3200, ssd: 2000, motherboard: 8500, water: 7000, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'dell_alienware', name: 'Alienware m15/m17/x14/x16', gen: 1.3, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7000, battery: 4500, keyboard: 5500, thermal_pads: 7000, cleaning: 3800, ssd: 2500, motherboard: 11000, water: 8500, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 7500, ram_replace: 6500 } },
                    { id: 'dell_xps_14_2025', name: 'XPS 14 (2025)', gen: 1.5, hasThermalPads: true, hasBga: true, specificPrices: { screen: 8000, battery: 5000, keyboard: 6000, thermal_pads: 6500, cleaning: 4000, ssd: 2500, motherboard: 11000, water: 8500, reball_cpu: 13000, reball_gpu: 12000, replace_cpu: 16000, replace_gpu: 14000, reball_bridge: 8000, ram_replace: 7000 } },
                    { id: 'dell_xps_16_2025', name: 'XPS 16 (2025)', gen: 1.6, hasThermalPads: true, hasBga: true, specificPrices: { screen: 9000, battery: 5500, keyboard: 6500, thermal_pads: 7000, cleaning: 4200, ssd: 2800, motherboard: 12000, water: 9000, reball_cpu: 14000, reball_gpu: 13000, replace_cpu: 17000, replace_gpu: 15000, reball_bridge: 8500, ram_replace: 7500 } },
                    { id: 'dell_alienware_m18_2025', name: 'Alienware m18 R2 (2025)', gen: 1.5, hasThermalPads: true, hasBga: true, specificPrices: { screen: 8000, battery: 5000, keyboard: 6000, thermal_pads: 8000, cleaning: 4200, ssd: 2800, motherboard: 12000, water: 9000, reball_cpu: 13000, reball_gpu: 12000, replace_cpu: 16000, replace_gpu: 14000, reball_bridge: 8000, ram_replace: 7000 } },
                ]
            },
            acer: {
                multiplier: 1.0,
                name: 'Acer',
                models: [
                    { id: 'acer_aspire', name: 'Aspire 3/5', gen: 0.8, hasBga: true, specificPrices: { screen: 4000, battery: 3200, keyboard: 3000, cleaning: 2800, ssd: 1800, motherboard: 6500, water: 5500, reball_cpu: 9000, reball_gpu: 8000, replace_cpu: 12000, replace_gpu: 10000, reball_bridge: 6000, ram_replace: 5000 } },
                    { id: 'acer_swift', name: 'Swift 3/5', gen: 1.0, hasBga: true, specificPrices: { screen: 5000, battery: 3500, keyboard: 4000, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'acer_predator', name: 'Predator Helios / Triton (до 2024)', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6000, battery: 4000, keyboard: 4500, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 9000, water: 7500, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'acer_nitro', name: 'Nitro 5/16/V15', gen: 1.0, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5000, battery: 3500, keyboard: 3800, thermal_pads: 5000, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'acer_predator_2025', name: 'Predator Helios Neo 16 (2025)', gen: 1.4, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7000, battery: 4500, keyboard: 5000, thermal_pads: 6500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 7500, ram_replace: 6500 } },
                    { id: 'acer_swift_go_2025', name: 'Swift Go 14 (2025)', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6000, battery: 4000, keyboard: 4500, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 9000, water: 7500, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'acer_nitro_v_2025', name: 'Nitro V 15/16 (2025)', gen: 1.1, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5500, battery: 3800, keyboard: 4000, thermal_pads: 5500, cleaning: 3500, ssd: 2200, motherboard: 8500, water: 7000, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                ]
            },
            msi: {
                multiplier: 1.1,
                name: 'MSI',
                models: [
                    { id: 'msi_gf', name: 'GF63 / GF75 Thin', gen: 0.9, hasBga: true, specificPrices: { screen: 4200, battery: 3200, keyboard: 3200, cleaning: 3000, ssd: 1800, motherboard: 7000, water: 5800, reball_cpu: 9500, reball_gpu: 8500, replace_cpu: 12500, replace_gpu: 10500, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'msi_katana', name: 'Katana 15/17', gen: 1.0, hasThermalPads: true, hasBga: true, specificPrices: { screen: 4800, battery: 3500, keyboard: 3800, thermal_pads: 5000, cleaning: 3200, ssd: 2000, motherboard: 8000, water: 6500, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'msi_pulse', name: 'Pulse GL66/GL76', gen: 1.1, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5200, battery: 3800, keyboard: 4000, thermal_pads: 5000, cleaning: 3500, ssd: 2000, motherboard: 8500, water: 7000, reball_cpu: 10500, reball_gpu: 9500, replace_cpu: 13500, replace_gpu: 11500, reball_bridge: 7000, ram_replace: 6000 } },
                    { id: 'msi_raider', name: 'Raider GE66/GE78 (до 2024)', gen: 1.3, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6500, battery: 4200, keyboard: 5000, thermal_pads: 6000, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 11500, reball_gpu: 10500, replace_cpu: 14500, replace_gpu: 12500, reball_bridge: 7500, ram_replace: 6500 } },
                    { id: 'msi_stealth', name: 'Stealth 15M / 16/17', gen: 1.4, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7000, battery: 4500, keyboard: 5500, thermal_pads: 7000, cleaning: 4000, ssd: 2500, motherboard: 11000, water: 8500, reball_cpu: 12000, reball_gpu: 11000, replace_cpu: 15000, replace_gpu: 13000, reball_bridge: 8000, ram_replace: 7000 } },
                    { id: 'msi_raider_18_2025', name: 'Raider 18 HX (2025)', gen: 1.6, hasThermalPads: true, hasBga: true, specificPrices: { screen: 8000, battery: 5000, keyboard: 6000, thermal_pads: 8500, cleaning: 4200, ssd: 2800, motherboard: 12000, water: 9500, reball_cpu: 13000, reball_gpu: 12000, replace_cpu: 16000, replace_gpu: 14000, reball_bridge: 8500, ram_replace: 7500 } },
                    { id: 'msi_vector_2025', name: 'Vector 16/17 HX (2025)', gen: 1.5, hasThermalPads: true, hasBga: true, specificPrices: { screen: 7500, battery: 4800, keyboard: 5500, thermal_pads: 7500, cleaning: 4000, ssd: 2500, motherboard: 11000, water: 9000, reball_cpu: 12500, reball_gpu: 11500, replace_cpu: 15500, replace_gpu: 13500, reball_bridge: 8000, ram_replace: 7000 } },
                    { id: 'msi_crosshair_2025', name: 'Crosshair 16/17 (2025)', gen: 1.3, hasThermalPads: true, hasBga: true, specificPrices: { screen: 6500, battery: 4200, keyboard: 5000, thermal_pads: 6500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 11500, reball_gpu: 10500, replace_cpu: 14500, replace_gpu: 12500, reball_bridge: 7500, ram_replace: 6500 } },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд',
                models: [
                    { id: 'laptop_office', name: 'Офисный (бюджетный)', gen: 0.8, hasBga: true, specificPrices: { screen: 3500, battery: 2800, keyboard: 2800, cleaning: 2500, ssd: 1500, motherboard: 6000, water: 5000, reball_cpu: 8000, reball_gpu: 7000, replace_cpu: 11000, replace_gpu: 9000, reball_bridge: 5500, ram_replace: 4500 } },
                    { id: 'laptop_gaming', name: 'Игровой ноутбук', gen: 1.2, hasThermalPads: true, hasBga: true, specificPrices: { screen: 5500, battery: 3800, keyboard: 4000, thermal_pads: 5000, cleaning: 3500, ssd: 2200, motherboard: 8500, water: 7000, reball_cpu: 10000, reball_gpu: 9000, replace_cpu: 13000, replace_gpu: 11000, reball_bridge: 6500, ram_replace: 5500 } },
                    { id: 'laptop_ultra', name: 'Ультрабук (премиум)', gen: 1.3, hasBga: true, specificPrices: { screen: 6500, battery: 4800, keyboard: 5500, cleaning: 3800, ssd: 2500, motherboard: 10000, water: 8000, reball_cpu: 11000, reball_gpu: 10000, replace_cpu: 14000, replace_gpu: 12000, reball_bridge: 7000, ram_replace: 6000 } },
                ]
            },
        },
    },
    tablet: {
        label: 'Планшет',
        icon: '📲',
        services: {
            diagnostics: {
                name: 'Диагностика',
                basePrice: 0,
                minTime: '15 мин',
                maxTime: '30 мин',
                desc: '⚡ БЕСПЛАТНО. Точное определение неисправности'
            },
            screen: { name: 'Замена дисплея', basePrice: 3500, minTime: '1 час', maxTime: '3 часа', desc: 'Работа без учёта дисплея' },
            glass: { name: 'Замена тачскрина', basePrice: 2800, minTime: '2 часа', maxTime: '4 часа', desc: 'Переклейка стекла' },
            battery: { name: 'Замена аккумулятора', basePrice: 2500, minTime: '1 час', maxTime: '2 часа', desc: 'Работа без учёта батареи' },
            charging_type_c: { name: 'Замена разъёма Type-C', basePrice: 2800, minTime: '1 час', maxTime: '2 часа', desc: 'USB Type-C порт', portType: 'type_c' },
            charging_lightning: { name: 'Замена разъёма Lightning', basePrice: 3500, minTime: '1 час', maxTime: '2 часа', desc: 'Apple Lightning порт', portType: 'lightning' },
        },
        brands: {
            apple: {
                multiplier: 1.5,
                name: 'Apple iPad',
                models: [
                    { id: 'ipad_old', name: 'iPad 7/8/9/10 (2019-2022)', gen: 0.8, portType: 'lightning', specificPrices: { diagnostics: 0, battery: 3500, screen: 4500, glass: 3500 } },
                    { id: 'ipad_air', name: 'iPad Air 4 / 5 (2020-2022)', gen: 1.0, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4000, screen: 5500, glass: 4500 } },
                    { id: 'ipad_pro_11', name: 'iPad Pro 11" (2020-2024)', gen: 1.2, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 5000, screen: 7000, glass: 6000 } },
                    { id: 'ipad_pro_12', name: 'iPad Pro 12.9" / 13" (2020-2024)', gen: 1.4, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 6500, screen: 10000, glass: 8000 } },
                    { id: 'ipad_mini', name: 'iPad mini 6 / mini 7 (2021-2024)', gen: 1.0, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3500, screen: 5500, glass: 4500 } },
                    { id: 'ipad_air_m3', name: 'iPad Air M3 (2025)', gen: 1.3, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4500, screen: 8000, glass: 6500 } },
                    { id: 'ipad_pro_m4', name: 'iPad Pro M4 11"/13" (2024-2025)', gen: 1.6, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 7000, screen: 12000, glass: 9000 } },
                ]
            },
            samsung: {
                multiplier: 1.1,
                name: 'Samsung Galaxy Tab',
                models: [
                    { id: 'tab_a_old', name: 'Galaxy Tab A 10.1 (2019)', gen: 0.7, portType: 'micro_usb', specificPrices: { diagnostics: 0, battery: 2800, screen: 3800, glass: 3000 } },
                    { id: 'tab_a', name: 'Galaxy Tab A7/A8/A9 (2020-2024)', gen: 0.7, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 2800, screen: 3800, glass: 3000 } },
                    { id: 'tab_s7', name: 'Galaxy Tab S7 / S7+ (2020)', gen: 0.9, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3500, screen: 5000, glass: 4500 } },
                    { id: 'tab_s8', name: 'Galaxy Tab S8 / S8+ / S8 Ultra (2022)', gen: 1.1, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4000, screen: 6000, glass: 5500 } },
                    { id: 'tab_s9', name: 'Galaxy Tab S9 / S9+ / S9 Ultra (2023)', gen: 1.3, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4500, screen: 7000, glass: 6500 } },
                    { id: 'tab_s10', name: 'Galaxy Tab S10 / S10+ / S10 Ultra (2024)', gen: 1.5, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 5000, screen: 8000, glass: 7500 } },
                ]
            },
            xiaomi: {
                multiplier: 0.9,
                name: 'Xiaomi Pad',
                models: [
                    { id: 'xiaomi_pad', name: 'Xiaomi Pad 5/6', gen: 0.9, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3000, screen: 4000, glass: 3500 } },
                    { id: 'xiaomi_pad_pro', name: 'Xiaomi Pad 6 Pro / S Pro', gen: 1.1, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3500, screen: 5000, glass: 4500 } },
                    { id: 'redmi_pad', name: 'Redmi Pad / Redmi Pad SE', gen: 0.8, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 2800, screen: 3500, glass: 3000 } },
                    { id: 'xiaomi_pad_7', name: 'Xiaomi Pad 7 / 7 Pro (2024-2025)', gen: 1.2, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3800, screen: 5500, glass: 5000 } },
                    { id: 'redmi_pad_pro', name: 'Redmi Pad Pro (2024)', gen: 1.0, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3200, screen: 4200, glass: 3500 } },
                ]
            },
            huawei: {
                multiplier: 1.0,
                name: 'Huawei MatePad',
                models: [
                    { id: 'matepad_old', name: 'MatePad 11 / 11.5 (2021-2022)', gen: 0.9, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3200, screen: 4200, glass: 3500 } },
                    { id: 'matepad_pro', name: 'MatePad Pro 12.6 (2021-2023)', gen: 1.2, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4500, screen: 6000, glass: 5500 } },
                    { id: 'matepad_t', name: 'MatePad T10 / T10s', gen: 0.7, portType: 'micro_usb', specificPrices: { diagnostics: 0, battery: 2800, screen: 3500, glass: 3000 } },
                    { id: 'matepad_2024', name: 'MatePad 11.5" S / Pro (2024)', gen: 1.3, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4000, screen: 5500, glass: 5000 } },
                    { id: 'matepad_air', name: 'MatePad Air (2024-2025)', gen: 1.2, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3800, screen: 5000, glass: 4500 } },
                ]
            },
            lenovo: {
                multiplier: 1.0,
                name: 'Lenovo Tab',
                models: [
                    { id: 'lenovo_m_old', name: 'Lenovo Tab M10 (2019)', gen: 0.8, portType: 'micro_usb', specificPrices: { diagnostics: 0, battery: 2800, screen: 3500, glass: 3000 } },
                    { id: 'lenovo_m', name: 'Lenovo Tab M10/M11 (2022-2024)', gen: 0.8, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 2800, screen: 3500, glass: 3000 } },
                    { id: 'lenovo_p', name: 'Lenovo Tab P11 / P12', gen: 1.0, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3500, screen: 4500, glass: 4000 } },
                    { id: 'lenovo_extreme', name: 'Lenovo Tab Extreme', gen: 1.3, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 5000, screen: 7000, glass: 6500 } },
                    { id: 'lenovo_p12_2025', name: 'Lenovo Tab P12 / P12 Pro (2024-2025)', gen: 1.2, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4500, screen: 6000, glass: 5500 } },
                    { id: 'lenovo_yoga_tab', name: 'Yoga Tab 11/13 (2024-2025)', gen: 1.1, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4000, screen: 5500, glass: 5000 } },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд',
                models: [
                    { id: 'tablet_budget', name: 'Бюджетный планшет', gen: 0.7, portType: 'micro_usb', specificPrices: { diagnostics: 0, battery: 2500, screen: 3200, glass: 2800 } },
                    { id: 'tablet_mid', name: 'Средний класс', gen: 0.9, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 3200, screen: 4000, glass: 3500 } },
                    { id: 'tablet_premium', name: 'Премиум', gen: 1.2, portType: 'type_c', specificPrices: { diagnostics: 0, battery: 4500, screen: 5500, glass: 5000 } },
                ]
            },
        },
    },
    tv: {
        label: 'Телевизор',
        icon: '📺',
        services: {
            diagnostics: {
                name: 'Диагностика',
                basePrice: 0,
                minTime: '30 мин',
                maxTime: '1 час',
                desc: '⚡ БЕСПЛАТНО. Точное определение неисправности'
            },
            backlight_small: { name: 'Замена LED-подсветки 32-43"', basePrice: 5000, minTime: '1 день', maxTime: '2 дня', desc: 'LED телевизоры малой диагонали', requiresTvType: ['led'] },
            backlight_medium: { name: 'Замена LED-подсветки 49-55"', basePrice: 7500, minTime: '1 день', maxTime: '3 дня', desc: 'LED телевизоры средней диагонали', requiresTvType: ['led'] },
            backlight_large: { name: 'Замена LED-подсветки 58-65"', basePrice: 10000, minTime: '2 дня', maxTime: '4 дня', desc: 'LED телевизоры большой диагонали', requiresTvType: ['led'] },
            backlight_xlarge: { name: 'Замена LED-подсветки 70"+', basePrice: 16000, minTime: '2 дня', maxTime: '5 дней', desc: 'LED телевизоры 70-85 дюймов', requiresTvType: ['led'] },
            backlight_qled: { name: 'Ремонт подсветки QLED / Mini-LED', basePrice: 14000, minTime: '2 дня', maxTime: '4 дня', desc: 'QLED Samsung, TCL, Hisense, Mini-LED', requiresTvType: ['qled', 'mini_led'] },
            backlight_oled: { name: 'Ремонт OLED-панели', basePrice: 22000, minTime: '3 дня', maxTime: '7 дней', desc: 'OLED LG / Sony / Philips (сложный ремонт)', requiresTvType: ['oled'] },
            power: { name: 'Ремонт блока питания', basePrice: 4000, minTime: '1 день', maxTime: '3 дня', desc: 'Замена конденсаторов, MOSFET' },
            tcon: { name: 'Ремонт T-Con платы', basePrice: 4500, minTime: '1 день', maxTime: '3 дня', desc: 'Восстановление изображения' },
            mainboard: { name: 'Ремонт основной платы', basePrice: 6000, minTime: '2 дня', maxTime: '5 дней', desc: 'Smart TV, Wi-Fi, HDMI' },
            matrix: { name: 'Замена матрицы', basePrice: 12000, minTime: '2 дня', maxTime: '7 дней', desc: 'LCD / OLED / QLED (работа без матрицы)' },
        },
        brands: {
            samsung: {
                multiplier: 1.2,
                name: 'Samsung',
                models: [
                    { id: 'samsung_uhd', name: 'Crystal UHD 32-55"', gen: 0.9, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5500, backlight_medium: 8500 } },
                    { id: 'samsung_uhd_large', name: 'Crystal UHD 58-75"', gen: 1.1, tvType: 'led', specificPrices: { diagnostics: 0, backlight_large: 11500, backlight_xlarge: 18000 } },
                    { id: 'samsung_qled', name: 'QLED 43-65"', gen: 1.2, tvType: 'qled', specificPrices: { diagnostics: 0, backlight_qled: 16000 } },
                    { id: 'samsung_neo_qled', name: 'Neo QLED 55-75"', gen: 1.4, tvType: 'mini_led', specificPrices: { diagnostics: 0, backlight_qled: 19000 } },
                    { id: 'samsung_frame', name: 'The Frame 32-55"', gen: 1.3, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 6000, backlight_medium: 8500 } },
                    { id: 'samsung_oled', name: 'OLED 55-65" (2024-2025)', gen: 1.5, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 26000 } },
                ]
            },
            lg: {
                multiplier: 1.2,
                name: 'LG',
                models: [
                    { id: 'lg_uhd', name: 'UHD 32-55"', gen: 0.9, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5500, backlight_medium: 8500 } },
                    { id: 'lg_uhd_large', name: 'UHD 58-75"', gen: 1.1, tvType: 'led', specificPrices: { diagnostics: 0, backlight_large: 11500, backlight_xlarge: 18000 } },
                    { id: 'lg_nanocell', name: 'NanoCell 43-65"', gen: 1.1, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5500, backlight_medium: 9500, backlight_large: 12500 } },
                    { id: 'lg_oled', name: 'OLED 48-65"', gen: 1.4, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 27000 } },
                    { id: 'lg_oled_large', name: 'OLED 65-83"', gen: 1.6, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 35000 } },
                    { id: 'lg_qned', name: 'QNED 55-75"', gen: 1.3, tvType: 'qled', specificPrices: { diagnostics: 0, backlight_medium: 8500, backlight_large: 11000 } },
                    { id: 'lg_oled_evo', name: 'OLED evo 55-77" (2024-2025)', gen: 1.5, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 30000 } },
                ]
            },
            sony: {
                multiplier: 1.3,
                name: 'Sony',
                models: [
                    { id: 'sony_x75', name: 'Bravia X75/X80 43-55"', gen: 0.9, tvType: 'led', specificPrices: { diagnostics: 0, backlight_medium: 9500 } },
                    { id: 'sony_x85', name: 'Bravia X85/X90 55-75"', gen: 1.1, tvType: 'led', specificPrices: { diagnostics: 0, backlight_medium: 11000, backlight_large: 15000 } },
                    { id: 'sony_oled', name: 'Bravia XR A80/A90 OLED', gen: 1.4, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 30000 } },
                    { id: 'sony_x95', name: 'Bravia XR X95/X98 55-85"', gen: 1.3, tvType: 'led', specificPrices: { diagnostics: 0, backlight_large: 13000, backlight_xlarge: 18000 } },
                    { id: 'sony_bravia_9', name: 'Bravia 9 Mini-LED (2024-2025)', gen: 1.5, tvType: 'mini_led', specificPrices: { diagnostics: 0, backlight_qled: 20000 } },
                ]
            },
            philips: {
                multiplier: 1.1,
                name: 'Philips',
                models: [
                    { id: 'philips_performance', name: 'Performance 32-55"', gen: 0.9, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5800, backlight_medium: 8500 } },
                    { id: 'philips_pus', name: 'PUS 58-75"', gen: 1.0, tvType: 'led', specificPrices: { diagnostics: 0, backlight_large: 11500, backlight_xlarge: 18000 } },
                    { id: 'philips_oled', name: 'OLED 55-65"', gen: 1.4, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 26000 } },
                    { id: 'philips_oled_2025', name: 'OLED 2025 (Ambilight)', gen: 1.5, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 28000 } },
                ]
            },
            tcl: {
                multiplier: 1.0,
                name: 'TCL',
                models: [
                    { id: 'tcl_p', name: 'P-series 32-55"', gen: 0.8, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5000, backlight_medium: 7500 } },
                    { id: 'tcl_c', name: 'C-series 55-75"', gen: 1.0, tvType: 'led', specificPrices: { diagnostics: 0, backlight_medium: 8500, backlight_large: 11500 } },
                    { id: 'tcl_qled', name: 'QLED 55-65"', gen: 1.1, tvType: 'qled', specificPrices: { diagnostics: 0, backlight_qled: 14500 } },
                    { id: 'tcl_mini_led', name: 'Mini-LED QM8 (2024-2025)', gen: 1.3, tvType: 'mini_led', specificPrices: { diagnostics: 0, backlight_qled: 16000 } },
                ]
            },
            xiaomi: {
                multiplier: 0.9,
                name: 'Xiaomi',
                models: [
                    { id: 'xiaomi_a2', name: 'TV A2 32-43"', gen: 0.8, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 4800 } },
                    { id: 'xiaomi_q1', name: 'TV Q1 55-75"', gen: 1.0, tvType: 'led', specificPrices: { diagnostics: 0, backlight_medium: 8000, backlight_large: 11000 } },
                    { id: 'xiaomi_p1', name: 'TV P1 32-55"', gen: 0.9, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5200, backlight_medium: 8000 } },
                    { id: 'xiaomi_s_pro', name: 'TV S Pro Mini-LED (2024-2025)', gen: 1.2, tvType: 'mini_led', specificPrices: { diagnostics: 0, backlight_qled: 15000 } },
                ]
            },
            hisense: {
                multiplier: 1.0,
                name: 'Hisense',
                models: [
                    { id: 'hisense_a_series', name: 'A4/A6 Series 32-55"', gen: 0.8, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5000, backlight_medium: 7500 } },
                    { id: 'hisense_u_series', name: 'U6/U7/U8 (ULED) 55-75"', gen: 1.1, tvType: 'qled', specificPrices: { diagnostics: 0, backlight_qled: 14000 } },
                    { id: 'hisense_oled', name: 'OLED 55-65"', gen: 1.3, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 24000 } },
                ]
            },
            other: {
                multiplier: 1.0,
                name: 'Другой бренд',
                models: [
                    { id: 'tv_small', name: 'LED 32-43 дюйма', gen: 0.8, tvType: 'led', specificPrices: { diagnostics: 0, backlight_small: 5500 } },
                    { id: 'tv_medium', name: 'LED 49-55 дюймов', gen: 1.0, tvType: 'led', specificPrices: { diagnostics: 0, backlight_medium: 8000 } },
                    { id: 'tv_large', name: 'LED 58-75 дюймов', gen: 1.2, tvType: 'led', specificPrices: { diagnostics: 0, backlight_large: 11500, backlight_xlarge: 17500 } },
                    { id: 'tv_qled', name: 'QLED телевизор', gen: 1.3, tvType: 'qled', specificPrices: { diagnostics: 0, backlight_qled: 15000 } },
                    { id: 'tv_oled', name: 'OLED телевизор', gen: 1.4, tvType: 'oled', specificPrices: { diagnostics: 0, backlight_oled: 24000 } },
                ]
            },
        },
    },
    console: {
        label: 'Игровая приставка',
        icon: '🎮',
        services: {
            diagnostics: {
                name: 'Диагностика',
                basePrice: 0,
                minTime: '20 мин',
                maxTime: '40 мин',
                desc: '⚡ БЕСПЛАТНО. Точное определение неисправности'
            },
            cleaning: { name: 'Чистка от пыли', basePrice: 2500, minTime: '1 час', maxTime: '2 часа', desc: 'Полная разборка, чистка радиатора и вентилятора' },
            thermal: { name: 'Замена термопасты', basePrice: 2800, minTime: '1 час', maxTime: '2 часа', desc: 'Качественная термопаста' },
            hdmi: { name: 'Ремонт HDMI порта', basePrice: 4000, minTime: '1 день', maxTime: '2 дня', desc: 'BGA-пайка разъёма' },
            controller: { name: 'Ремонт геймпада', basePrice: 2500, minTime: '1 час', maxTime: '3 часа', desc: 'Стики, кнопки, триггеры, Bluetooth' },
            drive: { name: 'Ремонт привода', basePrice: 3800, minTime: '1 день', maxTime: '3 дня', desc: 'Лазер, шлейф, механика' },
            power: { name: 'Ремонт блока питания', basePrice: 3800, minTime: '1 день', maxTime: '3 дня', desc: 'Замена компонентов БП' },
            motherboard: { name: 'Ремонт материнской платы', basePrice: 7000, minTime: '3 дня', maxTime: '7 дней', desc: 'BGA-пайка, замена чипов' },
            reball_apu: { name: 'Реболл APU/CPU', basePrice: 8000, minTime: '3 дня', maxTime: '7 дней', desc: 'BGA-пайка процессора консоли' },
            replace_apu: { name: 'Замена APU/CPU', basePrice: 12000, minTime: '5 дней', maxTime: '10 дней', desc: 'Работа без учёта чипа' },
            liquid_metal: { name: 'Замена жидкого металла', basePrice: 5000, minTime: '1 день', maxTime: '2 дня', desc: 'PS5 / PS5 Pro / Xbox Series X' },
            ssd_upgrade: { name: 'Установка SSD', basePrice: 3000, minTime: '30 мин', maxTime: '1 час', desc: 'Без стоимости накопителя' },
        },
        brands: {
            playstation: {
                multiplier: 1.0,
                name: 'PlayStation',
                models: [
                    { id: 'ps3', name: 'PlayStation 3 (Fat/Slim/Super Slim)', gen: 0.7, specificPrices: { diagnostics: 0, cleaning: 2000, thermal: 2500, hdmi: 3800, drive: 3200, power: 3500, motherboard: 6000, reball_apu: 7000, replace_apu: 10000 } },
                    { id: 'ps4_slim', name: 'PlayStation 4 Slim', gen: 0.9, specificPrices: { diagnostics: 0, cleaning: 2500, thermal: 2800, hdmi: 4200, drive: 3800, power: 4000, motherboard: 7000, reball_apu: 8000, replace_apu: 11000 } },
                    { id: 'ps4_pro', name: 'PlayStation 4 Pro', gen: 1.0, specificPrices: { diagnostics: 0, cleaning: 2800, thermal: 3200, hdmi: 4800, drive: 4200, power: 4500, motherboard: 8000, reball_apu: 9000, replace_apu: 12000 } },
                    { id: 'ps5_standard', name: 'PlayStation 5 Standard', gen: 1.2, specificPrices: { diagnostics: 0, cleaning: 4200, thermal: 3800, hdmi: 6500, controller: 3500, drive: 6500, power: 5800, motherboard: 11000, liquid_metal: 6500, ssd_upgrade: 3200, reball_apu: 12000, replace_apu: 16000 } },
                    { id: 'ps5_digital', name: 'PlayStation 5 Digital Edition', gen: 1.2, specificPrices: { diagnostics: 0, cleaning: 4200, thermal: 3800, hdmi: 6500, controller: 3500, power: 5800, motherboard: 11000, liquid_metal: 6500, ssd_upgrade: 3200, reball_apu: 12000, replace_apu: 16000 } },
                    { id: 'ps5_slim', name: 'PlayStation 5 Slim / Slim Digital', gen: 1.3, specificPrices: { diagnostics: 0, cleaning: 4800, thermal: 4200, hdmi: 7200, controller: 3800, drive: 7000, power: 6200, motherboard: 12000, liquid_metal: 7000, ssd_upgrade: 3200, reball_apu: 13000, replace_apu: 17000 } },
                    { id: 'ps5_pro', name: 'PlayStation 5 Pro (2024)', gen: 1.5, specificPrices: { diagnostics: 0, cleaning: 5500, thermal: 4800, hdmi: 8000, controller: 4200, drive: 8000, power: 7000, motherboard: 14000, liquid_metal: 7500, ssd_upgrade: 3500, reball_apu: 15000, replace_apu: 20000 } },
                ]
            },
            xbox: {
                multiplier: 1.1,
                name: 'Xbox',
                models: [
                    { id: 'xbox_one_s', name: 'Xbox One S', gen: 0.8, specificPrices: { diagnostics: 0, cleaning: 2200, thermal: 2800, hdmi: 4200, drive: 3800, power: 4000, motherboard: 7000, reball_apu: 8000, replace_apu: 11000 } },
                    { id: 'xbox_one_x', name: 'Xbox One X', gen: 0.9, specificPrices: { diagnostics: 0, cleaning: 2500, thermal: 3200, hdmi: 4800, drive: 4200, power: 4500, motherboard: 8000, reball_apu: 9000, replace_apu: 12000 } },
                    { id: 'xbox_series_s', name: 'Xbox Series S', gen: 1.1, specificPrices: { diagnostics: 0, cleaning: 3200, thermal: 3500, hdmi: 5500, power: 5000, ssd_upgrade: 3500, motherboard: 9000, reball_apu: 10000, replace_apu: 14000 } },
                    { id: 'xbox_series_x', name: 'Xbox Series X', gen: 1.3, specificPrices: { diagnostics: 0, cleaning: 3800, thermal: 4000, hdmi: 6500, drive: 6000, power: 5800, ssd_upgrade: 3800, motherboard: 10500, liquid_metal: 6000, reball_apu: 12000, replace_apu: 16000 } },
                    { id: 'xbox_series_x_digital', name: 'Xbox Series X Digital Edition', gen: 1.3, specificPrices: { diagnostics: 0, cleaning: 3800, thermal: 4000, hdmi: 6500, power: 5800, ssd_upgrade: 3800, motherboard: 10500, liquid_metal: 6000, reball_apu: 12000, replace_apu: 16000 } },
                ]
            },
            nintendo: {
                multiplier: 1.0,
                name: 'Nintendo Switch',
                models: [
                    { id: 'switch', name: 'Nintendo Switch (2017-2019)', gen: 0.9, specificPrices: { diagnostics: 0, cleaning: 2000, thermal: 2200, controller: 2800, power: 3200, motherboard: 6500, reball_apu: 7500, replace_apu: 10000 } },
                    { id: 'switch_v2', name: 'Nintendo Switch V2 (2019+)', gen: 1.0, specificPrices: { diagnostics: 0, cleaning: 2200, thermal: 2500, controller: 2800, power: 3500, motherboard: 7000, reball_apu: 8000, replace_apu: 11000 } },
                    { id: 'switch_lite', name: 'Nintendo Switch Lite', gen: 1.0, specificPrices: { diagnostics: 0, cleaning: 2000, thermal: 2200, power: 3200, motherboard: 6000, reball_apu: 7000, replace_apu: 9500 } },
                    { id: 'switch_oled', name: 'Nintendo Switch OLED', gen: 1.2, specificPrices: { diagnostics: 0, cleaning: 2500, thermal: 2800, controller: 3200, power: 3800, motherboard: 8000, reball_apu: 9000, replace_apu: 12000 } },
                    { id: 'switch_2', name: 'Nintendo Switch 2 (2025)', gen: 1.5, specificPrices: { diagnostics: 0, cleaning: 3200, thermal: 3500, controller: 4000, power: 4500, motherboard: 9000, reball_apu: 10000, replace_apu: 14000 } },
                ]
            },
            steam_deck: {
                multiplier: 1.2,
                name: 'Steam Deck',
                models: [
                    { id: 'steam_deck_lcd', name: 'Steam Deck LCD 64/256/512GB', gen: 1.0, specificPrices: { diagnostics: 0, cleaning: 2800, thermal: 3200, screen: 8000, ssd_upgrade: 3000, motherboard: 8000, reball_apu: 9000, replace_apu: 12000 } },
                    { id: 'steam_deck_oled', name: 'Steam Deck OLED 512GB/1TB', gen: 1.2, specificPrices: { diagnostics: 0, cleaning: 3200, thermal: 3500, screen: 10000, ssd_upgrade: 3500, motherboard: 9000, reball_apu: 10000, replace_apu: 14000 } },
                ]
            },
            other: { multiplier: 1.0, name: 'Другая приставка', models: [{ id: 'console_old', name: 'Старая модель (до 2015)', gen: 0.7 }, { id: 'console_mid', name: 'Средняя модель (2016-2020)', gen: 0.9 }, { id: 'console_new', name: 'Новая модель (2021+)', gen: 1.1 }] },
        },
    },
    videocard: {
        label: 'Видеокарта',
        icon: '🔥',
        services: {
            diagnostics: {
                name: 'Диагностика',
                basePrice: 700,
                minTime: '30 мин',
                maxTime: '1 час',
                desc: '⚠️ БЕСПЛАТНО при согласии на ремонт. При отказе — от 500 до 1500₽ (зависит от сложности: восстановление цепей питания, замена компонентов для тестирования)'
            },
            cleaning: { name: 'Чистка + термопаста', basePrice: 2500, minTime: '1 час', maxTime: '2 часа', desc: 'Полная разборка, замена термоинтерфейса' },
            thermal: { name: 'Замена термопрокладок', basePrice: 3000, minTime: '1 час', maxTime: '3 часа', desc: 'Качественные термопрокладки' },
            fans: { name: 'Ремонт/замена вентиляторов', basePrice: 2000, minTime: '1 час', maxTime: '2 часа', desc: 'Работа без учёта вентиляторов' },
            reball: { name: 'Реболл GPU', basePrice: 5500, minTime: '2 дня', maxTime: '5 дней', desc: 'BGA-пайка графического чипа' },
            gpu_replace: { name: 'Замена GPU (видеочипа)', basePrice: 8000, minTime: '3 дня', maxTime: '7 дней', desc: 'Работа без учёта чипа' },
            vram_replace: { name: 'Замена видеопамяти (VRAM)', basePrice: 5500, minTime: '2 дня', maxTime: '5 дней', desc: 'Работа без учёта памяти' },
            power: { name: 'Ремонт цепи питания', basePrice: 4500, minTime: '2 дня', maxTime: '5 дней', desc: 'MOSFET, конденсаторы, дроссели' },
            hdmi: { name: 'Ремонт видеовыходов', basePrice: 2800, minTime: '1 день', maxTime: '3 дня', desc: 'HDMI, DisplayPort, DVI' },
            bios: { name: 'Прошивка BIOS', basePrice: 1800, minTime: '1 час', maxTime: '1 день', desc: 'Восстановление, откат, модификация' },
            reball_vram: { name: 'Реболл памяти (VRAM)', basePrice: 5000, minTime: '2 дня', maxTime: '5 дней', desc: 'BGA-пайка чипов памяти' },
            short_circuit: { name: 'Ремонт после КЗ', basePrice: 6000, minTime: '3 дня', maxTime: '7 дней', desc: 'Восстановление после короткого замыкания' },
            mining_recovery: { name: 'Восстановление после майнинга', basePrice: 5000, minTime: '2 дня', maxTime: '5 дней', desc: 'Полная диагностика и восстановление' },
        },
        brands: {
            nvidia_gtx_old: { multiplier: 0.8, name: 'NVIDIA GTX 10xx / 16xx', models: [{ id: 'gtx_1050', name: 'GTX 1050 / 1050 Ti', gen: 0.6 }, { id: 'gtx_1060', name: 'GTX 1060 (3/6 GB)', gen: 0.7 }, { id: 'gtx_1070', name: 'GTX 1070 / 1070 Ti', gen: 0.8 }, { id: 'gtx_1080', name: 'GTX 1080 / 1080 Ti', gen: 0.9, specificPrices: { diagnostics: 0, reball: 5000, gpu_replace: 7000 } }, { id: 'gtx_1650', name: 'GTX 1650 / 1650 Super', gen: 0.7 }, { id: 'gtx_1660', name: 'GTX 1660 / 1660 Super / Ti', gen: 0.8 }] },
            nvidia_rtx_20: { multiplier: 1.0, name: 'NVIDIA RTX 20xx', models: [{ id: 'rtx_2060', name: 'RTX 2060 / 2060 Super', gen: 0.9 }, { id: 'rtx_2070', name: 'RTX 2070 / 2070 Super', gen: 1.0 }, { id: 'rtx_2080', name: 'RTX 2080 / 2080 Super', gen: 1.1, specificPrices: { diagnostics: 0, reball: 6000, gpu_replace: 8500 } }, { id: 'rtx_2080ti', name: 'RTX 2080 Ti', gen: 1.3, specificPrices: { diagnostics: 0, reball: 7500, gpu_replace: 10500, vram_replace: 6500 } }] },
            nvidia_rtx_30: { multiplier: 1.2, name: 'NVIDIA RTX 30xx', models: [{ id: 'rtx_3060', name: 'RTX 3060 / 3060 Ti', gen: 1.0 }, { id: 'rtx_3070', name: 'RTX 3070 / 3070 Ti', gen: 1.2, specificPrices: { diagnostics: 0, reball: 6500, gpu_replace: 9500 } }, { id: 'rtx_3080', name: 'RTX 3080 / 3080 Ti', gen: 1.4, specificPrices: { diagnostics: 0, reball: 8500, gpu_replace: 12500, vram_replace: 7000 } }, { id: 'rtx_3090', name: 'RTX 3090 / 3090 Ti', gen: 1.6, specificPrices: { diagnostics: 0, reball: 10500, gpu_replace: 15500, vram_replace: 8500 } }] },
            nvidia_rtx_40: { multiplier: 1.5, name: 'NVIDIA RTX 40xx', models: [{ id: 'rtx_4060', name: 'RTX 4060 / 4060 Ti', gen: 1.2 }, { id: 'rtx_4070', name: 'RTX 4070 / 4070 Super / Ti', gen: 1.4, specificPrices: { diagnostics: 0, reball: 9000, gpu_replace: 13500 } }, { id: 'rtx_4080', name: 'RTX 4080 / 4080 Super', gen: 1.6, specificPrices: { diagnostics: 0, reball: 11000, gpu_replace: 17000, vram_replace: 9000 } }, { id: 'rtx_4090', name: 'RTX 4090', gen: 1.8, specificPrices: { diagnostics: 0, reball: 14000, gpu_replace: 22000, vram_replace: 10500, cleaning: 4000 } }] },
            nvidia_rtx_50: { multiplier: 1.8, name: 'NVIDIA RTX 50xx (2025)', models: [{ id: 'rtx_5070', name: 'RTX 5070 / 5070 Ti', gen: 1.5, specificPrices: { diagnostics: 0, reball: 10000, gpu_replace: 15000 } }, { id: 'rtx_5080', name: 'RTX 5080', gen: 1.7, specificPrices: { diagnostics: 0, reball: 13000, gpu_replace: 20000, vram_replace: 11000 } }, { id: 'rtx_5090', name: 'RTX 5090', gen: 2.2, specificPrices: { diagnostics: 0, reball: 18000, gpu_replace: 28000, vram_replace: 14000, cleaning: 5000 } }] },
            amd_rx_old: { multiplier: 0.9, name: 'AMD Radeon RX 5xx / Vega', models: [{ id: 'rx_580', name: 'RX 570 / 580 / 590', gen: 0.6, specificPrices: { diagnostics: 0, reball: 4800 } }, { id: 'rx_vega', name: 'RX Vega 56 / 64', gen: 0.8, specificPrices: { diagnostics: 0, reball: 5500, thermal: 3200 } }] },
            amd_rx_5000: { multiplier: 1.0, name: 'AMD Radeon RX 5xxx', models: [{ id: 'rx_5600', name: 'RX 5600 XT', gen: 0.9 }, { id: 'rx_5700', name: 'RX 5700 / 5700 XT', gen: 1.0, specificPrices: { diagnostics: 0, reball: 6000 } }] },
            amd_rx_6000: { multiplier: 1.2, name: 'AMD Radeon RX 6xxx', models: [{ id: 'rx_6600', name: 'RX 6600 / 6600 XT', gen: 1.0 }, { id: 'rx_6700', name: 'RX 6700 XT', gen: 1.1 }, { id: 'rx_6800', name: 'RX 6800 / 6800 XT', gen: 1.3, specificPrices: { diagnostics: 0, reball: 8000, gpu_replace: 11500 } }, { id: 'rx_6900', name: 'RX 6900 XT / 6950 XT', gen: 1.5, specificPrices: { diagnostics: 0, reball: 10000, gpu_replace: 15000, vram_replace: 8000 } }] },
            amd_rx_7000: { multiplier: 1.4, name: 'AMD Radeon RX 7xxx', models: [{ id: 'rx_7600', name: 'RX 7600 / 7600 XT', gen: 1.2 }, { id: 'rx_7700', name: 'RX 7700 XT', gen: 1.3 }, { id: 'rx_7800', name: 'RX 7800 XT', gen: 1.4, specificPrices: { diagnostics: 0, reball: 9500, gpu_replace: 14000 } }, { id: 'rx_7900', name: 'RX 7900 XT / XTX', gen: 1.7, specificPrices: { diagnostics: 0, reball: 12500, gpu_replace: 19000, vram_replace: 9500 } }] },
            amd_rx_9000: { multiplier: 1.6, name: 'AMD Radeon RX 9000 (2025)', models: [{ id: 'rx_9070', name: 'RX 9070 / 9070 XT', gen: 1.5, specificPrices: { diagnostics: 0, reball: 11000, gpu_replace: 16000 } }, { id: 'rx_9070_xtx', name: 'RX 9070 XTX', gen: 1.7, specificPrices: { diagnostics: 0, reball: 13000, gpu_replace: 19000, vram_replace: 10000 } }] },
            intel_arc: { multiplier: 1.1, name: 'Intel Arc', models: [{ id: 'arc_a580', name: 'Arc A580', gen: 1.0 }, { id: 'arc_a750', name: 'Arc A750', gen: 1.1 }, { id: 'arc_a770', name: 'Arc A770', gen: 1.2 }, { id: 'arc_b580', name: 'Arc B580 (Battlemage 2024)', gen: 1.3 }, { id: 'arc_b770', name: 'Arc B770 (Battlemage 2025)', gen: 1.4, specificPrices: { diagnostics: 0, reball: 8000 } }] },
            other: { multiplier: 1.0, name: 'Другая видеокарта', models: [{ id: 'gpu_office', name: 'Офисная (GT 710/1030)', gen: 0.6 }, { id: 'gpu_mid_old', name: 'Средняя (до 2018)', gen: 0.8 }, { id: 'gpu_mid_new', name: 'Средняя (2019-2022)', gen: 1.0 }, { id: 'gpu_top', name: 'Топовая (2023+)', gen: 1.3 }] },
        },
    },
};
