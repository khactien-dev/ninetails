import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ExceptionError implements ExceptionFilter {
  catch(exception: HttpException | any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = 500;
    if (exception.response) {
      status = exception.getStatus();
    }
    console.log(exception);
    if (exception instanceof HttpException) {
      const err: any = exception.getResponse();
      if (Array.isArray(err.message) && err.message.length > 0)
        err.message = err.message[0];
      return response.status(status).json({
        errorCode: 1,
        ...err,
      });
    }
    response.status(status).json({
      errorCode: 1,
      statusCode: status,
      message: exception.message,
    });
  }
}
