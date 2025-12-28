import { Module } from '@nestjs/common';

import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService],
})
export class QueueModule {}
