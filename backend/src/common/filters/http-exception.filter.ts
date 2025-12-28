import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { Logger } from 'nestjs-pino';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    constructor(@Inject(Logger) private readonly logger: Logger) {}
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const errorResponse =
        exception instanceof HttpException
          ? (exception.getResponse() as any)
          : { message: 'Internal server error' };
  
      const errorMessage = errorResponse.message || errorResponse;
  
      const unifiedErrorResponse = {
        status: 'error',
        error: {
          code: status,
          message: errorMessage,
          details: errorResponse.details || null,
        },
        timestamp: new Date().toISOString(),
      };
  
      this.logger.error(
        { req: request, res: response, error: errorResponse },
        JSON.stringify(unifiedErrorResponse),
      );
  
      response.status(status).json(unifiedErrorResponse);
    }
  }
  