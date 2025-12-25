import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        data: data?.result ?? data,
        ...(data?.metadata && { metadata: data?.metadata ?? null }),
        message: data?.message
          ? data?.message
          : 'Operation completed successfully.',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
