import { NextResponse } from 'next/server';
import axios from 'axios';

// Используем бота для уведомлений в группу
const BOT_TOKEN = process.env.NOTIFY_BOT_TOKEN;
const CHAT_ID = process.env.NOTIFY_CHAT_ID;

export async function POST(request) {
  try {
    console.log('Environment check:', {
      hasToken: !!BOT_TOKEN,
      hasChatId: !!CHAT_ID,
      tokenLength: BOT_TOKEN?.length,
      chatId: CHAT_ID
    });

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Missing environment variables:', {
        BOT_TOKEN: BOT_TOKEN ? 'SET' : 'MISSING',
        CHAT_ID: CHAT_ID ? 'SET' : 'MISSING'
      });
      return NextResponse.json(
        { error: 'Bot token or chat ID not configured' }, 
        { status: 500 }
      );
    }

    // Получаем данные из формы
    const { name, phone, description, promotion } = await request.json();
    
    console.log('Received form data:', { name, phone, description, promotion });
    
    // Валидация обязательных полей
    if (!name || !phone) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['name', 'phone'],
          received: { name, phone, description, promotion }
        },
        { status: 400 }
      );
    }

    // Форматируем сообщение для Telegram
    const message = `📝 *Новая заявка с сайта*\n\n` +
                   `👤 *Имя:* ${name}\n` +
                   `📞 *Телефон:* ${phone}\n` +
                   (description ? `📋 *Описание:* ${description}\n` : '') +
                   (promotion ? `🎁 *Акция:* ${promotion}\n` : '') +
                   `\n⏰ *Время:* ${new Date().toLocaleString('ru-RU')}`;

    // Отправляем сообщение в Telegram
    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Telegram API response:', telegramResponse.data);

    return NextResponse.json({ 
      success: true, 
      message: 'Заявка успешно отправлена',
      messageId: telegramResponse.data.result?.message_id
    });

  } catch (error) {
    console.error('Telegram send error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    let errorMessage = 'Failed to send message to Telegram';
    let statusCode = 500;

    if (error.response) {
      errorMessage = `Telegram API error: ${error.response.data.description || 'Unknown error'}`;
      statusCode = error.response.status;
    } else if (error.request) {
      errorMessage = 'No response received from Telegram API';
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}

// Обработчик для GET запросов (тот самый который возвращает "Hello telegram!")
export async function GET() {
  return NextResponse.json({
    message: "Hello telegram!",
    usage: "Send POST request with form data to submit an application"
  });
}