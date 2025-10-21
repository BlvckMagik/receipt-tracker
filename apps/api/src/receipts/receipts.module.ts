import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller.js';
import { ReceiptsService } from './receipts.service.js';
import { ChatgptService } from '../chatgpt/chatgpt.service.js';
import { DbService } from '../db/db.service.js';

@Module({
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ChatgptService, DbService],
})
export class ReceiptsModule {}
