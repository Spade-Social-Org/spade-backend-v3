import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { HttpResponse } from '../../../shared/HttpResponse';
import { BaseAppException } from '../BaseAppException';
import { ModuleRef } from '@nestjs/core';
import { AppLogger } from '../../../shared/AppLogger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private moduleRef: ModuleRef,
    private appLogger: AppLogger,
  ) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const httpResponse: HttpResponse = new HttpResponse(this.moduleRef);

    if (exception instanceof BaseAppException) {
      this.appLogger.logError(exception);
      return httpResponse.sendException(exception, request, response);
    } else {
      this.appLogger.logError(exception);
      return httpResponse.sendNotHandledException(exception, request, response);
    }
  }
}
