import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { MerchantsModule } from '../merchants/merchants.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    MerchantsModule,
    EmployeesModule,
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
