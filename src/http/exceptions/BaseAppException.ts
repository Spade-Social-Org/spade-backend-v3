import { HttpException } from '@nestjs/common';
import { ResponseStatusCodeConst } from 'src/constant/ResponseStatusCodeConst';

type HttpExceptionConstructorParams = ConstructorParameters<
  typeof HttpException
>;

export class BaseAppException extends HttpException {
  statusCode: ResponseStatusCodeConst;
  translateMessage: boolean;
  devMessage?: string;

  constructor(
    message: HttpExceptionConstructorParams[0],
    status: HttpExceptionConstructorParams[1],
    statusCode: ResponseStatusCodeConst,
    translateMessage: boolean,
    devMessage: string | undefined = undefined,
  ) {
    super(message, status);
    this.statusCode = statusCode;
    this.translateMessage = translateMessage;
    this.devMessage = devMessage;
  }
}
