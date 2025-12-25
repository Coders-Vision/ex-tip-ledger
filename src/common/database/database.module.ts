import { Module } from '@nestjs/common';
import { TypeormModule } from './type-orm/typeorm.module';

@Module({
  imports: [TypeormModule],
  exports: [TypeormModule],
})
export class DatabaseModule {}
