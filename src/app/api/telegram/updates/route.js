// src/app/api/telegram/updates/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const BOT_TOKEN = process.env.SUPPORT_BOT_TOKEN; // Исправлено: используем SUPPORT_BOT_TOKEN

export async function GET(request) {
  try {
    if (!BOT_TOKEN) {
      console.error('SUPPORT_BOT_TOKEN not configured');
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Исправлено: убрал пробел в URL
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const updates = response.data.result || [];

    const replies = updates
      .filter(u => u.message?.reply_to_message?.text?.includes(userId))
      .map(u => ({
        _id: u.update_id.toString(),
        author: 'manager',
        text: u.message.text,
        createdAt: new Date(u.message.date * 1000).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: "delivered"
      }));

    return NextResponse.json(replies);
  } catch (error) {
    console.error('Telegram updates error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}