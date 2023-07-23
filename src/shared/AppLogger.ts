import { Injectable } from '@nestjs/common';

@Injectable()
export class AppLogger {
  logError(exception: Error | unknown) {
    const nodeEnv = process.env.NODE_ENV || 'local';
    if (nodeEnv === 'development') {
      console.error(exception);
    } else {
      // log to sentry
    }
  }

  logInfo(...info: any) {
    const nodeEnv = process.env.NODE_ENV || 'local';
    if (nodeEnv === 'development') {
      console.info(info);
    } else {
      // log to sentry
    }
  }
}
