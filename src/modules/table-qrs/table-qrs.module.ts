import { Module } from '@nestjs/common';
import { TableQRsController } from './table-qrs.controller';
import { TableQRsService } from './table-qrs.service';

@Module({
  controllers: [TableQRsController],
  providers: [TableQRsService],
  exports: [TableQRsService],
})
export class TableQRsModule {}
