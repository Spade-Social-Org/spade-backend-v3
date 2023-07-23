import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(null, (exception) => {
        console.log('Logged from Sentry interceptor ====>>>>', exception);
        if (exception instanceof InternalServerErrorException)
          Sentry.captureException(exception);
      }),
    );
  }
}
