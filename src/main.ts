import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
// import * as cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';
import { setupSwagger } from './common/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable transformation and validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enables class-transformer to transform query params
      // whitelist: true, // Strips out fields that don't exist in the DTO
      // forbidNonWhitelisted: false,
    }),
  );
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new ResponseInterceptor());
  // app.use(cookieParser());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));

  const PORT = process.env.PORT || 8080;

  if (process.env.APP_ENV === 'dev') {
    setupSwagger(
      app,
      `${process.env.APP_NAME || 'APP_NAME'}`,
      `API documentation for ${process.env.APP_NAME || 'APP_NAME'} System`,
      '1.0',
    );
  }

  await app.listen(PORT, () => {
    const HOST = `http://localhost:${PORT}`;
    console.log(`
     Backend started successfully
     Node Version : ${process.version}
     Port : ${`${PORT}`}
     Date : ${`${new Date().toLocaleString()}`}
     Timezone : ${Intl.DateTimeFormat().resolvedOptions().timeZone}
     Env  : ${`${process.env.APP_ENV}`}
    `);
  });
}
bootstrap();
