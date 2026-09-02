import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/authGuard';

// Прайс со всей номенклатурой весит ~1–3 МБ; 10 МБ — щедрый предел,
// отсекающий заведомо мусорные и атакующие загрузки до парсинга.
const MAX_XLSX_BYTES = 10 * 1024 * 1024;

export async function POST(request) {
    // Загружать прайс может только администратор.
    // requireAdmin дополнительно проверяет Origin (CSRF).
    const denied = await requireAdmin(request);
    if (denied) return denied;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
            return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
        }

        // Проверяем расширение
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.xlsx')) {
            return NextResponse.json({ error: 'Файл должен быть в формате .xlsx' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (buffer.length > MAX_XLSX_BYTES) {
            return NextResponse.json({ error: 'Файл слишком большой (максимум 10 МБ)' }, { status: 413 });
        }

        // .xlsx — это ZIP-контейнер, первые два байта всегда "PK" (0x50 0x4B).
        // Отсекаем файлы с подделанным расширением ещё до записи на диск,
        // чтобы парсер прайса не встречал заведомо чужой формат.
        if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
            return NextResponse.json({ error: 'Файл не является корректным .xlsx' }, { status: 400 });
        }

        // Сохраняем в папку price-data с именем price.xlsx
        const uploadDir = path.join(process.cwd(), 'public', 'price-data');
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, 'price.xlsx');
        await writeFile(filePath, buffer);

        return NextResponse.json({ success: true, message: 'Прайс-лист загружен' });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
    }
}