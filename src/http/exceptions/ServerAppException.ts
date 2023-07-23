import { ResponseStatusCodeConst } from 'src/constant/ResponseStatusCodeConst';
import { BaseAppException } from './BaseAppException';
import { HttpStatus } from '@nestjs/common';

type BaseAppExceptionConstructorParams = ConstructorParameters<
  typeof BaseAppException
>;

export class ServerAppException extends BaseAppException {
  constructor(
    message: BaseAppExceptionConstructorParams[0],
    devMessage = undefined,
    translateMessage = true,
  ) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ResponseStatusCodeConst.SERVER_ERROR,
      translateMessage,
      devMessage,
    );
  }
}
