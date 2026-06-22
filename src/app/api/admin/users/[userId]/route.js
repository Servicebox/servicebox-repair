
// app/api/admin/users/[userId]/route.js
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getServerSession } from '@/lib/session';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const patchSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
  email: z.string().email('Неверный формат email').optional(),
  newPassword: z.string().min(8, 'Минимум 8 символов').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Укажите хотя бы одно поле для обновления'
});

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(request);
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Обновляем пользователя
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: только role / isActive / email — с Zod-валидацией
export async function PATCH(request, { params }) {
  try {
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
      return NextResponse.json({ error: 'Неверные данные', details: err.errors }, { status: 400 });
    }

    // Нельзя лишить себя роли admin
    if (userId === session.userId && body.role === 'user') {
      return NextResponse.json({ error: 'Нельзя понизить свою роль' }, { status: 400 });
    }

    const { newPassword, ...fields } = body;
    const updateSet = { ...fields };
    if (newPassword) {
      updateSet.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateSet },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!updated) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Обновлено', user: updated });
  } catch (error) {
    console.error('Admin PATCH user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(request);
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { userId } = params;
    
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