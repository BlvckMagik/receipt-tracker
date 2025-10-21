import { Injectable } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import * as path from 'path';

@Injectable()
export class OcrService {
  async extractText(filePath: string): Promise<string> {
    // Use Ukrainian + English by default
    const langPath = path.join(process.cwd(), 'ocr-data'); // place traineddata here for offline
    const { data } = await Tesseract.recognize(filePath, 'ukr+eng', {
      langPath, // if empty - will fallback to CDN
      tessedit_char_whitelist: undefined,
    } as any);
    return data.text || '';
  }
}
