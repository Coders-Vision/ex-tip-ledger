import { Module, DynamicModule } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions,
} from '@nestjs/config';
import * as Joi from 'joi';

const defaultConfigValidationSchema = Joi.object({
  APP_ENV: Joi.string().required(),
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().required(),
  APP_NAME: Joi.string().required(),
  // DB_HOST: Joi.string().required(),
  // DB_SSL: Joi.bool().required(),
  // DB_NAME: Joi.string().required(),
  // DB_PORT: Joi.number().required(),
  // DB_USERNAME: Joi.string().required(),
  // DB_PASSWORD: Joi.string().required(),
  // JWT_ACCESS_SECRET: Joi.string().required(),
  // JWT_REFRESH_SECRET: Joi.string().required(),
  // FRONTEND_URL: Joi.string().required(),
  // FRONTEND_OAUTH_REDIRECT_PATH: Joi.string().optional(),
  // GOOGLE_AUTH_CLIENT_ID: Joi.string().optional(),
  // GOOGLE_AUTH_CLIENT_SECRET: Joi.string().optional(),
  // GOOGLE_AUTH_REDIRECT_URI: Joi.string().optional(),
});

@Module({})
export class EnvironmentModule {
  static forRoot(options?: ConfigModuleOptions): DynamicModule {
    return {
      module: EnvironmentModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true, // Makes the ConfigModule global
          validationSchema: defaultConfigValidationSchema, // Default validation schema
          ...options, // Spread any additional options passed in
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
