import { DynamicModule, Module } from '@nestjs/common';
import { OpenSearchLoggerOptions } from 'libs/common/logger/opensearch-logger.option';
import { OpenSearchLoggerService } from 'libs/common/logger/opensearch-logger.service';

@Module({
  providers: [OpenSearchLoggerService],

  exports: [OpenSearchLoggerService],
})
export class OpenSearchLoggerModule {
  public static forRoot(options: OpenSearchLoggerOptions): DynamicModule {
    return {
      module: OpenSearchLoggerModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },

        OpenSearchLoggerService,
      ],
      exports: [OpenSearchLoggerService],
    };
  }
}
