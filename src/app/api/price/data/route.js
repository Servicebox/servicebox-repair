import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { read, utils } from 'xlsx';

const PRICE_FILE_PATH = path.join(process.cwd(), 'public', 'price-data', 'price.xlsx');
const PUBLIC_COLUMNS = ['наименование', 'модель', 'ревизия', 'розница', 'описание'];

export async function GET() {
    try {
        // Проверяем существование файла
        try {
            await fs.access(PRICE_FILE_PATH);
        } catch (e) {
            // Файл не найден – возвращаем пустой ответ, чтобы страница не падала
            console.log('Прайс-лист не загружен');
            return NextResponse.json({ headers: [], data: [] });
        }

        const fileBuffer = await fs.readFile(PRICE_FILE_PATH);
        const workbook = read(fileBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
            return NextResponse.json({ headers: [], data: [] });
        }

        const rawHeaders = jsonData[0].map(h => String(h).toLowerCase().trim());
        const headerMap = {};
        rawHeaders.forEach((header, index) => {
            PUBLIC_COLUMNS.forEach(col => {
                if (header.includes(col.toLowerCase())) {
                    headerMap[col] = index;
                }
            });
        });

        const publicHeaders = PUBLIC_COLUMNS.filter(col => headerMap[col] !== undefined);
        const data = jsonData.slice(1).map(row => {
            const item = {};
            publicHeaders.forEach(col => {
                const value = row[headerMap[col]];
                item[col] = value !== undefined && value !== null ? value : '';
            });
            return item;
        }).filter(item => Object.values(item).some(v => v !== ''));

        return NextResponse.json({ headers: publicHeaders, data });

    } catch (error) {
        console.error('Error reading price:', error);
        // Возвращаем пустой массив, а не ошибку 500
        return NextResponse.json({ headers: [], data: [] });
    }
}