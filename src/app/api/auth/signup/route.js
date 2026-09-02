export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken, hashToken } from '@/lib/authTokens';
import { sendVerificationEmail } from '@/lib/email';
import { phoneMatchRegex } from '@/lib/phone';

export async function POST(request) {
  try {
    await dbConnect();

    const { username, email, password, phone } = await request.json();

    if (!username || !email || !password || !phone) {
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже пользователя с таким email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Если бонусы уже начислялись по этому телефону через CRM (ремонт в
    // сервисе до регистрации на сайте) — "забираем" тот тихий аккаунт вместо
    // создания нового, пустого. Иначе накопленные бонусы остались бы
    // недоступны клиенту навсегда.
    const phoneMatcher = phoneMatchRegex(phone);
    const placeholderUser = phoneMatcher
      ? await User.findOne({ phone: phoneMatcher, isPhoneOnlyAccount: true })
      : null;

    // Сырой токен уходит в письмо, в БД кладём только SHA-256 хеш.
    const rawVerificationToken = generateToken();
    const verificationToken = hashToken(rawVerificationToken);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    let user;
    if (placeholderUser) {
      placeholderUser.username = username.trim();
      placeholderUser.email = email.toLowerCase().trim();
      placeholderUser.password = password;
      placeholderUser.phone = phone.trim();
      placeholderUser.isPhoneOnlyAccount = false;
      placeholderUser.verificationToken = verificationToken;
      placeholderUser.verificationTokenExpires = verificationTokenExpires;
      user = placeholderUser;
    } else {
      user = new User({
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone.trim(),
        verificationToken,
        verificationTokenExpires,
      });
    }

    // Сохраняем пользователя
    await user.save();

    // Отправляем email с ссылкой для подтверждения
    try {
      await sendVerificationEmail(user.email, rawVerificationToken, user.username);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Продолжаем работу даже если email не отправился
    }

    // Возвращаем ответ без пароля и токена
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
    };

    return NextResponse.json(
      {
        message: 'Регистрация успешна! Проверьте ваш email для подтверждения.',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Signup error:', error);

    // Нарушение ограничений модели (maxlength/regex/minlength) — это
    // ошибка ввода, а не сервера: отвечаем 400, а не 500.
    if (error?.name === 'ValidationError') {
      const first = Object.values(error.errors || {})[0];
      return NextResponse.json(
        { message: first?.message || 'Проверьте корректность введённых данных' },
        { status: 400 }
      );
    }
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: 'Пользователь с такими данными уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}