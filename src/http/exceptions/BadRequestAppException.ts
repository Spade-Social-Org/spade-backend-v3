import { ResponseStatusCodeConst } from 'src/constant/ResponseStatusCodeConst';
import { BaseAppException } from './BaseAppException';
import { HttpStatus } from '@nestjs/common';

type BaseAppExceptionConstructorParams = ConstructorParameters<
  typeof BaseAppException
>;

export class BadRequestAppException extends BaseAppException {
  constructor(
    message: BaseAppExceptionConstructorParams[0],
    statusCode = ResponseStatusCodeConst.BAD_REQUEST,
    devMessage = undefined,
    translateMessage = true,
  ) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      statusCode,
      translateMessage,
      devMessage,
    );
  }
}
