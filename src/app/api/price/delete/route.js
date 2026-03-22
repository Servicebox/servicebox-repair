// app/api/price/delete/route.js
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

const PRICE_FILE_PATH = path.join(process.cwd(), 'public', 'price-data', 'price.xlsx');

export async function DELETE() {
    try {
        await unlink(PRICE_FILE_PATH);
        return NextResponse.json({ success: true });
    } catch (error) {
        // Если файл не найден – возвращаем 404, иначе 500
        if (error.code === 'ENOENT') {
            return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
    }
}
