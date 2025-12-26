import { Module } from '@nestjs/common';
import { LoggerModule } from './common/logger';
import { EnvironmentModule } from './common/config';
import { HealthModule } from './common/health/health.module';
import { DatabaseModule } from './common/database';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { EmployeesModule } from './modules/employees/employees.module';

@Module({
  imports: [
    EnvironmentModule.forRoot({
      envFilePath: `./.env`,
    }),
    LoggerModule,
    DatabaseModule,
    HealthModule,
    MerchantsModule,
    EmployeesModule
  ],
})
export class AppModule { }
