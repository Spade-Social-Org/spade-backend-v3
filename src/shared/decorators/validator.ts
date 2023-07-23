import { registerDecorator, ValidationOptions } from 'class-validator';
import { isString, get } from 'lodash';

export function IsValidName(validationOptions?: ValidationOptions) {
  return function <T extends () => unknown>(object: T, propertyName: string) {
    registerDecorator({
      name: 'isValidName',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (isString(value)) {
            const nameArr = value.split(' ', 2);
            return (
              isString(get(nameArr, 0)) &&
              nameArr[0].length > 0 &&
              isString(get(nameArr, 1)) &&
              nameArr[1].length > 0
            );
          }

          return false;
        },
      },
    });
  };
}
