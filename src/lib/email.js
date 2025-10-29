// lib/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.YANDEX_USER,
    pass: process.env.YANDEX_PASS,
  },
});

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const sendVerificationEmail = async (email, token, username) => {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.YANDEX_USER,
    to: email,
    subject: 'Подтверждение email адреса',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Добро пожаловать в наш сервис, ${username}!</h2>
        <p>Пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже:</p>
        <a href="${verificationUrl}" 
           target="_blank"
           style="background-color: #0070f3; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Подтвердить Email
        </a>
        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
        <p style="word-break: break-all; color: #0070f3;">${verificationUrl}</p>
        <p>Ссылка действительна в течение 24 часов.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, token, username) => {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.YANDEX_USER,
    to: email,
    subject: 'Сброс пароля',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Запрос на сброс пароля</h2>
        <p>Здравствуйте, ${username},</p>
        <p>Вы запросили сброс пароля. Нажмите на кнопку ниже для продолжения:</p>
        <a href="${resetUrl}" 
           target="_blank"
           style="background-color: #dc3545; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Сбросить пароль
        </a>
        <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
        <p style="word-break: break-all; color: #0070f3;">${resetUrl}</p>
        <p>Ссылка действительна в течение 1 часа.</p>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};