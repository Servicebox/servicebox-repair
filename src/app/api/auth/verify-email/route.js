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
        `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/auth/verification-error?message=Токен верификации отсутствует`
      );
    }

    // Ищем пользователя с этим токеном верификации.
    // verificationToken / verificationTokenExpires имеют select: false —
    // запрашиваем явно, иначе проверка срока действия ниже станет no-op.
    const user = await User.findOne({
      verificationToken: token
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/auth/verification-error?message=Неверный или просроченный токен верификации`
      );
    }

    // Проверяем срок действия токена
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/auth/verification-error?message=Срок действия токена истек`
      );
    }

    // Проверяем, не подтвержден ли уже email
    if (user.emailVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/auth/verification-success?alreadyVerified=true`
      );
    }

    // Подтверждаем email. Точечный updateOne, а не user.save() — не
    // гоняем валидацию всего документа (легаси-профиль, не проходящий
    // новые ограничения модели, иначе дал бы 500 на верификации).
    await User.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: true },
        $unset: { verificationToken: 1, verificationTokenExpires: 1 },
      }
    );

    // Перенаправляем на страницу успеха
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/auth/verification-success`
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://servicebox35.ru'}/auth/verification-error?message=Ошибка при подтверждении email`
    );
  }
}