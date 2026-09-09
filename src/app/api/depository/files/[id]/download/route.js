// app/api/depository/files/[id]/download/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import DepositoryFile from '@/models/DepositoryFile';
import { getServerSession } from '@/lib/session';
import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

// Все файлы депозитария лежат тут (см. src/app/api/depository/files/route.js).
const DEPO_ROOT = path.join(process.cwd(), 'uploads', 'depository');

export async function GET(request, { params }) {
  try {
    // Скачивание — только для авторизованных пользователей.
    // Список файлов остаётся публичным (нужно для индексации), закрыт
    // только сам download.
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { message: 'Войдите или зарегистрируйтесь, чтобы скачивать файлы' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: 'Файл не найден' }, { status: 404 });
    }

    await dbConnect();

    const file = await DepositoryFile.findById(params.id);
    if (!file || file.isActive === false) {
      return NextResponse.json({ message: 'Файл не найден' }, { status: 404 });
    }

    // filePath хранится абсолютным при загрузке. Убеждаемся, что он
    // действительно внутри каталога депозитария (защита от подмены пути),
    // и что файл физически на месте — ДО инкремента счётчика, иначе каждая
    // неудачная попытка накручивала downloadCount.
    const resolved = path.resolve(file.filePath || '');
    if (resolved !== DEPO_ROOT && !resolved.startsWith(DEPO_ROOT + path.sep)) {
      console.error('[depository/download] путь вне каталога:', file.filePath);
      return NextResponse.json({ message: 'Файл недоступен' }, { status: 404 });
    }

    try {
      await access(resolved, constants.R_OK);
    } catch {
      console.warn('[depository/download] файла нет на диске:', file.filename);
      return NextResponse.json(
        { message: 'Файл временно недоступен — сообщите администратору' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(resolved);

    // Счётчик увеличиваем только после успешного чтения файла и best-effort —
    // сбой БД на этом шаге не должен ломать уже успешную отдачу файла.
    DepositoryFile.updateOne({ _id: file._id }, { $inc: { downloadCount: 1 } }).catch(
      (e) => console.warn('[depository/download] счётчик не обновлён:', e?.message || e)
    );

    // Имя файла в заголовке Content-Disposition:
    //  - filename="..."  — ТОЛЬКО ASCII (не-ASCII символы в значении
    //    заголовка бросают ByteString-ошибку и роняют ответ в 500), плюс
    //    вырезаем кавычки / бэкслеш / ; / переводы строк (инъекция);
    //  - filename*=UTF-8'' — настоящее имя, percent-encoded по RFC 8187
    //    (encodeURIComponent + добавочно !*'() ).
    const rawName = String(file.originalName || file.filename).slice(0, 200);
    const asciiName =
      rawName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\;\r\n]/g, '') || 'file';
    const utf8Name = encodeURIComponent(rawName).replace(
      /[!*'()]/g,
      (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
    );

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mimetype || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
        'Content-Length': String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error('[depository/download] ошибка:', error?.message || error);
    return NextResponse.json(
      { message: 'Ошибка при скачивании файла' },
      { status: 500 }
    );
  }
}
