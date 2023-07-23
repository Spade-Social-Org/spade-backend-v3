import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { first, values, has, set } from 'lodash';

export default new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory(errors) {
    const formattedErrors = errors.reduce(
      (prev, error) => {
        if (!has(prev, error.property)) {
          set(prev, error.property, first(values(error.constraints || {})));
        }

        return prev;
      },
      {} as Record<string, string>,
    );

    return new BadRequestException(
      {
        status: false,
        code: 'DATA_VALIDATION_ERROR',
        errors: formattedErrors,
        message: 'Invalid data',
      },
      'Bad request',
    );
  },
});
