import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { OpenSearchLoggerService } from 'libs/common/logger/opensearch-logger.service';

@Catch()
export class ExceptionHandleError implements ExceptionFilter {
  private elasticsearchLoggerService: OpenSearchLoggerService;
  constructor(elasticsearchLoggerService: OpenSearchLoggerService) {
    this.elasticsearchLoggerService = elasticsearchLoggerService;
  }
  catch(exception: HttpException | any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = 500;
    console.log(exception);
    if (exception.response && exception.getStatus()) {
      status = exception.getStatus();
    }
    if (exception instanceof HttpException) {
      const err: any = exception.getResponse();
      if (Array.isArray(err.message) && err.message.length > 0) {
        err.message = err.message[0];
      }
      this.elasticsearchLoggerService.error({
        success: false,
        ...err,
      });
      return response.status(status).json({
        success: false,
        ...err,
      });
    }
    this.elasticsearchLoggerService.error({
      success: false,
      code: status,
      message: exception.error ?? exception.message,
    });
    response.status(status).json({
      success: false,
      code: status,
      message: exception.error ?? exception.message,
    });
  }
}
