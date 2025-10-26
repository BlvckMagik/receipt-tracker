import { Controller, Get, Post, Delete, Param, Query, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ReceiptsService } from './receipts.service.js';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly service: ReceiptsService) {}

  @Get()
  list() {
    return this.service.listReceipts();
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getReceipt(Number(id));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        let uploadDir = process.env.UPLOAD_DIR;
        if (!uploadDir) {
          const dataDir = process.env.DATA_DIR || (fs.existsSync('/data') ? '/data' : path.join(process.cwd(), 'data'));
          uploadDir = path.join(dataDir, 'uploads');
        }
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    try {
      console.log('Отримано файл:', file.originalname, 'розмір:', file.size);
      const result = await this.service.processUpload(file.path, file.originalname);
      console.log('Обробка завершена успішно');
      return result;
    } catch (error) {
      console.error('Помилка обробки файлу:', error);
      throw error;
    }
  }

  @Get('/items/all')
  listItems(@Query('q') q?: string, @Query('category') category?: string) {
    return this.service.listItems(q || '', category || '');
  }

  @Get('/stats/categories')
  getCategoryStats() {
    return this.service.getCategoryStats();
  }

  @Post('/items/:id')
  updateItem(@Param('id') id: string, @Body() body: any) {
    return this.service.updateItem(Number(id), body);
  }

  @Delete(':id')
  deleteReceipt(@Param('id') id: string) {
    return this.service.deleteReceipt(Number(id));
  }
}
