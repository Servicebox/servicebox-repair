const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

class MediaProcessor {
  static async compressImage(inputPath) {
    try {
      const outputPath = inputPath.replace(path.extname(inputPath), '.webp');
      
      await sharp(inputPath)
        .webp({ 
          quality: 80,
          effort: 4
        })
        .resize(1200, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(outputPath);

      await fs.unlink(inputPath);
      return outputPath;
    } catch (error) {
      // Если сжатие не удалось, оставляем оригинальный файл
      console.error('Image compression error:', error);
      return inputPath;
    }
  }

  static async compressVideo(inputPath) {
    try {
      const outputPath = path.join(
        path.dirname(inputPath),
        path.basename(inputPath, path.extname(inputPath)) + '.mp4'
      );

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-crf 23',
            '-preset medium',
            '-movflags +faststart',
            '-profile:v high',
            '-level 4.0',
            '-pix_fmt yuv420p',
            '-maxrate 2M',
            '-bufsize 4M'
          ])
          .on('progress', (progress) => {
            console.log(`Processing: ${progress.percent}% done`);
          })
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      await fs.unlink(inputPath);
      return outputPath;
    } catch (error) {
      console.error('Video compression error:', error);
      return inputPath;
    }
  }

  static async generateThumbnail(videoPath) {
    try {
      const thumbnailPath = videoPath.replace(path.extname(videoPath), '.jpg');
      
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: path.basename(thumbnailPath),
            folder: path.dirname(thumbnailPath),
            size: '320x240'
          })
          .on('end', resolve)
          .on('error', reject);
      });

      return thumbnailPath;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return null;
    }
  }

  static async cleanupFiles(filePaths) {
    try {
      await Promise.all(
        filePaths.map(filePath => 
          fs.unlink(filePath).catch(error => {
            console.error('Error deleting file:', error);
          })
        )
      );
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = MediaProcessor;