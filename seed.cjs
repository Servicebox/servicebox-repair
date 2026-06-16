// seed.cjs
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Подключение к БД
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB подключена'))
    .catch(err => console.error('❌ Ошибка подключения:', err));

(async () => {
    try {
        // 1. Загружаем модель (используем import для совместимости с ESM модулями Next.js)
        const { default: CalculatorConfig } = await import('./src/models/CalculatorConfig.js');

        // 2. Загружаем данные из нового файла
        const { PRICING } = await import('./src/lib/pricing-data.js');

        // 3. Записываем в базу
        await CalculatorConfig.findOneAndUpdate({}, { pricingData: PRICING }, { upsert: true });

        console.log('✅ Цены успешно сохранены в базу данных!');
    } catch (error) {
        console.error('❌ Ошибка при сохранении:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();