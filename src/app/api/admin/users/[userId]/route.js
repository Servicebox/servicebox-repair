
// app/api/admin/users/[userId]/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getServerSession } from '@/lib/session';
import { assertSameOrigin } from '@/lib/authGuard';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// Разрешённый набор полей задаётся Zod-схемой ниже. Прежний PUT-хендлер
// делал { $set: <сырое тело запроса> } без белого списка (mass-assignment:
// админ мог выставить любому пользователю произвольный role/bonuses/
// emailVerified/tokenVersion и т.п.) и не имел ни одного вызова из
// фронтенда — удалён. Все изменения пользователя идут через PATCH.

const patchSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
  email: z.string().email('Неверный формат email').max(254).optional(),
  newPassword: z.string().min(8, 'Минимум 8 символов').max(128).optional(),
}).strict().refine(data => Object.keys(data).length > 0, {
  message: 'Укажите хотя бы одно поле для обновления'
});

// PATCH: только role / isActive / email / newPassword — с Zod-валидацией
export async function PATCH(request, { params }) {
  try {
    const csrf = assertSameOrigin(request);
    if (csrf) return csrf;

    const session = await getServerSession(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let body;
    try {
      body = patchSchema.parse(await request.json());
    } catch (err) {
      return NextResponse.json({ error: 'Неверные данные', details: err.issues }, { status: 400 });
    }

    // Нельзя лишить себя роли admin
    if (userId === session.userId && body.role === 'user') {
      return NextResponse.json({ error: 'Нельзя понизить свою роль' }, { status: 400 });
    }

    // Текущие значения — чтобы не разлогинивать пользователя при «правке
    // без изменений» (админка шлёт role/isActive всегда).
    const current = await User.findById(userId).select('role isActive').lean();
    if (!current) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const { newPassword, ...fields } = body;
    const updateSet = { ...fields };
    const updateOps = { $set: updateSet };

    // Инвалидируем ранее выданные JWT пользователя (getServerSession
    // сверяет tv в токене с tokenVersion в БД) при:
    //  - сбросе пароля админом
    //  - реальной смене роли (демоут админа обрубает его старые токены)
    //  - блокировке аккаунта (isActive: true → false)
    const revokeSessions =
      Boolean(newPassword) ||
      (fields.role !== undefined && fields.role !== current.role) ||
      (fields.isActive === false && current.isActive !== false);

    if (newPassword) {
      updateSet.password = await bcrypt.hash(newPassword, 12);
      updateSet.passwordChangedAt = new Date();
    }
    if (revokeSessions) {
      updateOps.$inc = { tokenVersion: 1 };
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      updateOps,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!updated) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Обновлено', user: updated });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
    }
    console.error('Admin PATCH user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const csrf = assertSameOrigin(request);
    if (csrf) return csrf;

    const session = await getServerSession(request);

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Не позволяем удалить самого себя
    if (userId === session.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}