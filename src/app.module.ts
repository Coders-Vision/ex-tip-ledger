import { Module } from '@nestjs/common';
import { LoggerModule } from './common/logger';
import { EnvironmentModule } from './common/config';
import { HealthModule } from './common/health/health.module';
import { DatabaseModule } from './common/database';

@Module({
  imports: [
    EnvironmentModule.forRoot({
      envFilePath: `./.env`,
    }),
    LoggerModule,
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule { }
