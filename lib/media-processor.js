// lib/media-processor.js
// Этот файл используется ТОЛЬКО на сервере, поэтому можно использовать require

// Проверка, что код выполняется на сервере
if (typeof window !== 'undefined') {
  throw new Error('MediaProcessor предназначен только для серверного использования');
}

const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

class MediaProcessor {
  static async compressImage(inputPath, options = {}) {
    try {
      const {
        quality = 80,
        width = 1200,
        height = 800,
        format = 'webp'
      } = options;

      const ext = path.extname(inputPath);
      const outputPath = inputPath.replace(ext, `.${format}`);

      let image = sharp(inputPath);

      // Получаем метаданные для проверки размеров
      const metadata = await image.metadata();

      // Ресайз только если изображение больше указанных размеров
      if (metadata.width > width || metadata.height > height) {
        image = image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Конвертация в выбранный формат
      switch (format) {
        case 'webp':
          await image.webp({ quality, effort: 4 }).toFile(outputPath);
          break;
        case 'avif':
          await image.avif({ quality }).toFile(outputPath);
          break;
        case 'jpeg':
          await image.jpeg({ quality }).toFile(outputPath);
          break;
        default:
          await image.toFile(outputPath);
      }

      // Удаляем оригинал если конвертация успешна
      if (inputPath !== outputPath) {
        await fs.unlink(inputPath).catch(() => {});
      }

      return outputPath;
    } catch (error) {
      console.error('Image compression error:', error);
      return inputPath;
    }
  }

  static async compressVideo(inputPath, options = {}) {
    try {
      const {
        crf = 23,
        preset = 'medium',
        maxBitrate = '2M'
      } = options;

      const ext = path.extname(inputPath);
      const outputPath = path.join(
        path.dirname(inputPath),
        path.basename(inputPath, ext) + '_compressed.mp4'
      );

      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            `-crf ${crf}`,
            `-preset ${preset}`,
            '-movflags +faststart',
            '-profile:v high',
            '-level 4.0',
            '-pix_fmt yuv420p',
            `-maxrate ${maxBitrate}`,
            '-bufsize 4M',
            '-threads 2' // Оптимизация для сервера
          ])
          .on('start', (command) => {
            console.log('FFmpeg command:', command);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`Processing: ${Math.round(progress.percent)}% done`);
            }
          })
          .on('end', () => {
            console.log('Video compression completed');
            // Удаляем оригинал только после успешной конвертации
            fs.unlink(inputPath).catch(() => {});
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error('Video compression failed:', err);
            reject(err);
          })
          .save(outputPath);
      });
    } catch (error) {
      console.error('Video compression error:', error);
      return inputPath;
    }
  }

  static async generateThumbnail(videoPath, options = {}) {
    try {
      const {
        timestamp = '00:00:01',
        size = '320x240',
        format = 'jpg'
      } = options;

      const thumbnailPath = videoPath.replace(
        path.extname(videoPath),
        `_thumb.${format}`
      );

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [timestamp],
            filename: path.basename(thumbnailPath),
            folder: path.dirname(thumbnailPath),
            size: size
          })
          .on('end', () => {
            // Оптимизируем миниатюру
            sharp(thumbnailPath)
              .resize(320, 240, { fit: 'cover' })
              .jpeg({ quality: 70 })
              .toFile(thumbnailPath)
              .then(() => resolve(thumbnailPath))
              .catch(reject);
          })
          .on('error', reject);
      });
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return null;
    }
  }

  static async getMediaInfo(filePath) {
    try {
      if (filePath.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        const metadata = await sharp(filePath).metadata();
        return {
          type: 'image',
          width: metadata.width,
          height: metadata.height,
          size: metadata.size,
          format: metadata.format,
          hasAlpha: metadata.hasAlpha
        };
      } else if (filePath.match(/\.(mp4|avi|mov|mkv)$/i)) {
        return new Promise((resolve, reject) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) reject(err);
            resolve({
              type: 'video',
              duration: metadata.format.duration,
              size: metadata.format.size,
              format: metadata.format.format_name,
              streams: metadata.streams
            });
          });
        });
      }
    } catch (error) {
      console.error('Media info error:', error);
      return null;
    }
  }
}

module.exports = MediaProcessor;