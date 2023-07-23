import { ResponseStatusCodeConst } from 'src/constant/ResponseStatusCodeConst';
import { BaseAppException } from './BaseAppException';
import { HttpStatus } from '@nestjs/common';

type BaseAppExceptionConstructorParams = ConstructorParameters<
  typeof BaseAppException
>;
export class NotFoundAppException extends BaseAppException {
  constructor(
    message: BaseAppExceptionConstructorParams[0],
    devMessage = undefined,
    translateMessage = true,
  ) {
    super(
      message,
      HttpStatus.NOT_FOUND,
      ResponseStatusCodeConst.NOT_FOUND,
      translateMessage,
      devMessage,
    );
  }
}
