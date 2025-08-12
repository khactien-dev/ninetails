import {
  ValidateBy,
  ValidationOptions,
  buildMessage,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';
import { REPEAT } from 'libs/common/constants/common.constant';

export const IsAfter = (
  property: string,
  options?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'IsAfter',
      constraints: [property],
      validator: {
        validate: (
          value: string | undefined,
          args: ValidationArguments,
        ): boolean => {
          if (!value) return true;
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ] as string | undefined;
          if (!relatedValue) return true;
          return (
            new Date(value).toISOString() >=
            new Date(relatedValue).toISOString()
          );
        },
        defaultMessage: buildMessage(
          (each: string): string =>
            each + '$property must be after $constraint1',
          options,
        ),
      },
    },
    options,
  );

export const IsBefore = (
  property: string,
  options?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'IsBefore',
      constraints: [property],
      validator: {
        validate: (
          value: string | undefined,
          args: ValidationArguments,
        ): boolean => {
          if (!value) return true;
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ] as string | undefined;
          if (!relatedValue) return true;
          return (
            new Date(value).toISOString() <=
            new Date(relatedValue).toISOString()
          );
        },
        defaultMessage: buildMessage(
          (each: string): string =>
            each + '$property must be before $constraint1',
          options,
        ),
      },
    },
    options,
  );

export function ValidateDaysBasedOnRepeat(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'validateDaysBasedOnRepeat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any;
          const repeat = object.repeat;

          if (repeat === REPEAT.WEEKLY) {
            const validWeekDays = [
              'MONDAY',
              'TUESDAY',
              'WEDNESDAY',
              'THURSDAY',
              'FRIDAY',
              'SATURDAY',
            ];
            if (!Array.isArray(value) || value.length === 0) {
              return false;
            }
            return value.every((day) => validWeekDays.includes(day));
          }

          if (repeat === REPEAT.MONTHLY) {
            if (!Array.isArray(value) || value.length === 0) {
              return false;
            }
            return value.every((day) => Number(day) >= 1 && Number(day) <= 31);
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const object = args.object as any;
          const repeat = object.repeat;

          if (repeat === REPEAT.WEEKLY) {
            return 'Please select valid days in week (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY) when repeat mode is set to weekly. Example: ["MONDAY", "THURSDAY", "FRIDAY"]';
          }

          if (repeat === REPEAT.MONTHLY) {
            return 'Please select valid days in month (from 1 to 31) when repeat mode is set to monthly. Example: ["1", "15", "31"]';
          }

          return 'Invalid input for days.';
        },
      },
    });
  };
}
