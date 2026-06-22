// app/api/chat/messages/route.js
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import dbConnect from '@/lib/db';
import jwt from 'jsonwebtoken';

const messages = [];

export async function POST(request) {
  try {
    await dbConnect();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await request.json();

    const newMessage = {
      id: Date.now().toString(),
      senderId: decoded.id,
      senderName: body.senderName || 'Пользователь',
      text: body.text,
      files: body.files || [],
      createdAt: new Date(),
      isRead: false
    };

    messages.push(newMessage);
    return NextResponse.json({ message: 'Отправлено', data: newMessage });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const sorted = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paginated = sorted.slice(offset, offset + limit).reverse();

    return NextResponse.json({ messages: paginated, total: messages.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
