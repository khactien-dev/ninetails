import { RpcException } from '@nestjs/microservices';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpExceptionOptions } from '@nestjs/common/exceptions/http.exception';

export function BadRequestExceptionHandle(
  objectOrError?: string | object | any,
  descriptionOrOptions?: string | HttpExceptionOptions,
): void {
  throw new RpcException(
    new BadRequestException(objectOrError, descriptionOrOptions),
  );
}

export function UnauthorizedExceptionHandle(
  objectOrError?: string | object | any,
  descriptionOrOptions?: string | HttpExceptionOptions,
): void {
  throw new RpcException(
    new UnauthorizedException(objectOrError, descriptionOrOptions),
  );
}

export function NotFoundExceptionHandle(
  objectOrError?: string | object | any,
  descriptionOrOptions?: string | HttpExceptionOptions,
): void {
  throw new RpcException(
    new NotFoundException(objectOrError, descriptionOrOptions),
  );
}
