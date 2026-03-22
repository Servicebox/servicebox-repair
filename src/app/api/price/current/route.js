import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PRICE_FILE_PATH = path.join(process.cwd(), 'public', 'price-data', 'price.xlsx');

export async function GET() {
    try {
        await fs.access(PRICE_FILE_PATH);
        const fileBuffer = await fs.readFile(PRICE_FILE_PATH);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="price.xlsx"',
            },
        });
    } catch {
        return new NextResponse(null, { status: 404 });
    }
}
