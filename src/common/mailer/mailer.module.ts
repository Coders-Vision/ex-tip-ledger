import { Module } from '@nestjs/common';
import { MailerModule as NestNodeMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
// import { join } from 'path';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter'; // Import PugAdapter

@Module({
  imports: [
    ConfigModule, // Import ConfigModule for environment variables
    NestNodeMailerModule.forRootAsync({
      // imports: [ConfigModule], //Already Environment Module is Loader
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: configService.get('MAIL_SECURE'), // true for 465, false for other ports
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false
          }
        },
        defaults: {
          from: `"No Reply" <${configService.get('MAIL_FROM')}>`,
        },
        template: {
          // dir: join(__dirname, 'templates'), // Path to email templates folder
          // dir:'./libs/mailer/src/templates',
          dir:'./src/common/mailer/templates',
          adapter: new PugAdapter(), // Use Pug for templating
          options: {
            pretty: true, // Optional, makes the output HTML pretty
          },
        },
      }),
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
