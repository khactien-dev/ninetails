import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import { OpenSearchLoggerService } from 'libs/common/logger/opensearch-logger.service';

@Injectable()
export class ElasticsearchRequestInterceptor implements NestInterceptor {
  private elasticsearchLoggerService: OpenSearchLoggerService;

  constructor(elasticsearchLoggerService: OpenSearchLoggerService) {
    this.elasticsearchLoggerService = elasticsearchLoggerService;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req: any = context.switchToHttp().getRequest();
    try {
      this.elasticsearchLoggerService.info({
        url: req.url,
        query: req.query,
        body: req.body,
      });
    } catch (e: any) {
      console.log(e);
    }
    return next.handle().pipe(tap(() => console.log(``)));
  }
}
