import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
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