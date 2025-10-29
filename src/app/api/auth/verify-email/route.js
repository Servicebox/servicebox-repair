// app/api/auth/verify/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://service-box-35.ru'}/auth/verification-error?message=Токен верификации отсутствует`
      );
    }

    // Ищем пользователя с этим токеном верификации
    const user = await User.findOne({ 
      verificationToken: token
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://service-box-35.ru'}/auth/verification-error?message=Неверный или просроченный токен верификации`
      );
    }

    // Проверяем срок действия токена
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://service-box-35.ru'}/auth/verification-error?message=Срок действия токена истек`
      );
    }

    // Проверяем, не подтвержден ли уже email
    if (user.emailVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://service-box-35.ru'}/auth/verification-success?alreadyVerified=true`
      );
    }

    // Подтверждаем email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Перенаправляем на страницу успеха
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://service-box-35.ru'}/auth/verification-success`
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://service-box-35.ru'}/auth/verification-error?message=Ошибка при подтверждении email`
    );
  }
}