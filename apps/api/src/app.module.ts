import { Module } from '@nestjs/common';
import { ReceiptsModule } from './receipts/receipts.module.js';
import { DbService } from './db/db.service.js';

@Module({
  imports: [ReceiptsModule],
  providers: [DbService],
  exports: [DbService],
})
export class AppModule {}
