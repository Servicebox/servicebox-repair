// app/api/generate-wallet-jwt/route.js
import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';

// ID эмитента и класса (возьмите из консоли)
const ISSUER_ID = '9299-5484-6696'; // Ваш ID эмитента (тот, что в консоли)
const CLASS_ID = `${ISSUER_ID}.loyalty_class`; // Укажите правильный ID класса, который вы создали в консоли
// ВАЖНО: класс должен быть создан заранее через REST API или консоль

export async function POST(request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // ⚠️ Проверяем, что переменная окружения с ключом сервисного аккаунта существует
        const serviceAccountKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountKeyRaw) {
            console.error('❌ Переменная GOOGLE_SERVICE_ACCOUNT_KEY не задана');
            return NextResponse.json(
                { error: 'Server configuration error: missing Google service account key' },
                { status: 500 }
            );
        }

        // Парсим JSON ключа
        let serviceAccountKey;
        try {
            serviceAccountKey = JSON.parse(serviceAccountKeyRaw);
        } catch (e) {
            console.error('❌ Неверный формат GOOGLE_SERVICE_ACCOUNT_KEY:', e.message);
            return NextResponse.json(
                { error: 'Invalid service account key format' },
                { status: 500 }
            );
        }

        // Создаём клиент аутентификации
        const authClient = new JWT({
            email: serviceAccountKey.client_email,
            key: serviceAccountKey.private_key,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });
        await authClient.authorize();

        // Уникальный ID объекта карты для этого пользователя
        const objectId = `${CLASS_ID}.${userId}`;

        // Данные класса (шаблон) – они должны совпадать с тем, что вы создали в консоли
        const loyaltyClass = {
            id: CLASS_ID,
            issuerName: 'ServiceBox',
            programName: 'Программа лояльности ServiceBox',
            issuerId: ISSUER_ID,
            reviewStatus: 'UNDER_REVIEW', // после модерации сменится на APPROVED
            textModulesData: [
                {
                    header: 'О программе',
                    body: 'Накопительная скидка до 10% с каждого ремонта. Баллы за отзывы.',
                },
            ],
        };

        // Данные объекта (конкретная карта пользователя)
        const loyaltyObject = {
            id: objectId,
            classId: CLASS_ID,
            state: 'ACTIVE',
            loyaltyPoints: {
                balance: { string: '0' },
                label: 'Баллы',
            },
            textModulesData: [
                {
                    header: `Приветствуем, клиент ${userId}!`,
                    body: 'Спасибо, что выбираете ServiceBox',
                },
            ],
            barcode: {
                type: 'QR_CODE',
                value: userId,
                alternateText: 'Предъявите штрих-код для начисления скидки',
            },
        };

        // Формируем JWT payload
        const jwtPayload = {
            iss: serviceAccountKey.client_email,
            aud: 'google',
            typ: 'savetowallet',
            iat: Math.floor(Date.now() / 1000),
            payload: {
                loyaltyClasses: [loyaltyClass],
                loyaltyObjects: [loyaltyObject],
            },
        };

        // Подписываем JWT
        const token = await authClient.sign(jwtPayload);

        return NextResponse.json({ jwt: token });
    } catch (error) {
        console.error('Ошибка генерации JWT:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}