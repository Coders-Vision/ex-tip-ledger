import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryModule } from './repository.module';
import {
  Merchant,
  TipIntent,
  User,
} from './entities';
import { TipIntentRepository } from './repositories/tip-intent.repository';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: ['dist/**/*.entity{.ts,.js}'], // For production build
        // synchronize: true, // Enable in dev only
        autoLoadEntities: true,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
        factories: [__dirname + '/factories/**/*{.ts,.js}'],
        cli: {
          migrationsDir: __dirname + '/migrations/',
        },
        ssl: configService.get('DB_SSL'),
        // logging: true,
        // logger: 'advanced-console',
      }),
    }),

    // Register RepositoryModule for required entities
    RepositoryModule.forRepositories([
      { entity: User }, // Default repository for User
      { entity: Merchant }, // Default repository for Merchant
      { entity: TipIntent, repository: TipIntentRepository }, // Custom repository for TipIntent
    ]),
  ],
  exports: [RepositoryModule],
})
export class TypeormModule { }
