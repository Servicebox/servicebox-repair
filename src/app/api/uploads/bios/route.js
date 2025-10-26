// app/api/uploads/bios/route.js
import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const biosDir = path.join(process.cwd(), 'public', 'uploads', 'bios');
    
    try {
      const files = await readdir(biosDir);
      
      const biosFiles = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(biosDir, filename);
          const fileStats = await stat(filePath);
          
          return {
            filename,
            url: `/uploads/bios/${filename}`,
            size: fileStats.size,
            uploaded: fileStats.birthtime,
            downloadUrl: `/api/download/bios/${filename}`
          };
        })
      );

      return NextResponse.json({
        success: true,
        files: biosFiles
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({
          success: true,
          files: [],
          message: 'Директория BIOS файлов пуста'
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error reading BIOS files:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении списка BIOS файлов' 
      },
      { status: 500 }
    );
  }
}