import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
// import { HttpModule } from '@nestjs/axios';

@Module({
  // imports: [TerminusModule,HttpModule],
  imports: [TerminusModule,HttpModule],
  controllers: [HealthController],
  providers: [MongooseHealthIndicator, TypeOrmHealthIndicator],
})
export class HealthModule { }
