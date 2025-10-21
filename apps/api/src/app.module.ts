import { Module } from '@nestjs/common';
import { ReceiptsModule } from './receipts/receipts.module.js';
import { DbService } from './db/db.service.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [ReceiptsModule],
  controllers: [HealthController],
  providers: [DbService],
  exports: [DbService],
})
export class AppModule {}
