import { ResponseStatusCodeConst } from 'src/constant/ResponseStatusCodeConst';
import { BaseAppException } from './BaseAppException';
import { HttpStatus } from '@nestjs/common';

type BaseAppExceptionConstructorParams = ConstructorParameters<
  typeof BaseAppException
>;
export class NotAuthorizedAppException extends BaseAppException {
  constructor(
    message: BaseAppExceptionConstructorParams[0],
    devMessage = undefined,
    translateMessage = true,
  ) {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      ResponseStatusCodeConst.FORBIDDEN,
      translateMessage,
      devMessage,
    );
  }
}
