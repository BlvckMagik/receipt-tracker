import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller.js';
import { ReceiptsService } from './receipts.service.js';
import { OcrService } from '../ocr/ocr.service.js';
import { DbService } from '../db/db.service.js';

@Module({
  controllers: [ReceiptsController],
  providers: [ReceiptsService, OcrService, DbService],
})
export class ReceiptsModule {}
