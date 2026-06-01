import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

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

    // СОЗДАЕМ ТОКЕН НАПРЯМУЮ (без метода модели)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    console.log('🔐 Verification token created:', verificationToken);
    console.log('🔐 Token expires:', verificationTokenExpires);

    // Создаем пользователя с токеном
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      verificationToken,
      verificationTokenExpires,
    });

    console.log('👤 User instance created:', user._id);

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