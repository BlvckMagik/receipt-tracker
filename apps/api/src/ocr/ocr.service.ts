import { Injectable } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import * as path from 'path';
import * as fs from 'fs';
import { preprocessImage } from './image-preprocessor.js';

@Injectable()
export class OcrService {
  async extractText(filePath: string): Promise<string> {
    try {
      console.log('Початок OCR обробки для файлу:', filePath);
      
      // Попередня обробка зображення для покращення якості
      const processedPath = path.join(
        path.dirname(filePath), 
        'processed_' + path.basename(filePath)
      );
      
      try {
        await preprocessImage(filePath, processedPath);
        console.log('Зображення оброблено для покращення якості');
      } catch (preprocessError) {
        console.log('Помилка попередньої обробки, використовуємо оригінал:', preprocessError);
      }
      
      // Використовуємо оброблене зображення якщо воно існує, інакше оригінал
      const imageToProcess = fs.existsSync(processedPath) ? processedPath : filePath;
      
      // Покращені налаштування для розпізнавання чеків
      const { data } = await Tesseract.recognize(imageToProcess, 'ukr+eng', {
        logger: m => console.log('OCR:', m)
      });
      
      // Видаляємо тимчасовий оброблений файл
      if (fs.existsSync(processedPath)) {
        fs.unlinkSync(processedPath);
      }
      
      console.log('OCR завершено, знайдено текст:', data.text?.length || 0, 'символів');
      console.log('Текст:', data.text);
      return data.text || '';
    } catch (error) {
      console.error('Помилка OCR:', error);
      return 'Помилка обробки зображення';
    }
  }
}
