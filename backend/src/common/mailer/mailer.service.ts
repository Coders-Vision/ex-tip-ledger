// libs/mail/src/lib/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService as NestNodeMailerService } from '@nestjs-modules/mailer';
import { MailOptions } from './mailer.interface';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestNodeMailerService) {}

  async sendMail(mailOptions: MailOptions): Promise<void> {

    await this.mailerService.sendMail({
      to: mailOptions.to,
      subject: mailOptions.subject,
      template: mailOptions.template, // Path to the template file
      context: mailOptions.context,   // Handlebars context (variables passed to template)
    });
  }
}
