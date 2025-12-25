import { Module } from '@nestjs/common';
// import { LoggerService } from './logger.service';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
// import { EnvironmentModule } from '@app/config';
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      // imports: [EnvironmentModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          pinoHttp: {
            name: `${config.get('APP_NAME')}`,
            level: 'info',
            genReqId: (request) =>
              request.headers['x-correlation-id'] || uuidv4(),
            // redact: ['req.headers.authorization','req.headers.cookie',"res.headers['set-cookie']"],
            // serializers:{
            //   req(req) {
            //     req.body = req.raw.body;
            //     return req;
            //   },
            // },
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
