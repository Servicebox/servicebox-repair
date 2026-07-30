import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { phoneMatchRegex } from '@/lib/phone';

export async function POST(request) {
  try {
    await dbConnect();
    console.log('🔧 === STARTING USER REGISTRATION ===');

    const { username, email, password, phone } = await request.json();
    console.log('📝 Registration data received:', {
      username,
      email,
      phone: phone ? '***' : 'missing',
      password: password ? '***' : 'missing'
    });

    if (!username || !email || !password || !phone) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже пользователя с таким email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
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

    // СОЗДАЕМ ТОКЕН НАПРЯМУЮ (без метода модели)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    console.log('🔐 Verification token created:', verificationToken);
    console.log('🔐 Token expires:', verificationTokenExpires);

    let user;
    if (placeholderUser) {
      console.log('🔗 Claiming existing phone-only account:', placeholderUser._id);
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

    console.log('👤 User instance ready:', user._id ?? '(new)');

    // Сохраняем пользователя
    console.log('💾 сохранен в базу...');
    await user.save();
    console.log('✅ пользователь сохранен');

    // Проверяем, что токен действительно сохранился
    const savedUser = await User.findById(user._id);
    console.log('🔍 Verification after save:');
    console.log(`   - Token: ${savedUser.verificationToken}`);
    console.log(`   - Expires: ${savedUser.verificationTokenExpires}`);
    console.log(`   - Token matches: ${savedUser.verificationToken === verificationToken}`);

    // Отправляем email с ссылкой для подтверждения
    try {
      console.log('📧 Sending verification email...');
      await sendVerificationEmail(user.email, verificationToken, user.username);
      console.log('✅ Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
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
    return NextResponse.json(
      { message: 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}