import { Inject, Injectable } from '@nestjs/common';
import * as os from 'node:os';
import { Client } from '@opensearch-project/opensearch';
import { OpenSearchLoggerOptions } from 'libs/common/logger/opensearch-logger.option';
import { OpenSearchLoggerUtilities } from 'libs/common/logger/opensearch-logger.utilities';
// import { ApiResponse, Context, TransportRequestPromise } from '@opensearch-project/opensearch/lib/Transport';
// import { Search } from '@opensearch-project/opensearch/api/requestParams';

@Injectable()
export class OpenSearchLoggerService {
  private readonly client: Client;
  private indexes_cache: Array<string> = [];

  public constructor(
    @Inject('CONFIG_OPTIONS')
    private readonly options: OpenSearchLoggerOptions,
  ) {
    this.client = new Client(options.openSearchClientOptions);
  }

  public async createIndexIfNotExists(index: string, body?: any) {
    try {
      const result = await this.client.indices.exists({ index });
      if (!result) {
        await this.client.indices.create({
          index,
        });
      }
      this.indexes_cache.push(index);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Primary log message handler.
   *
   * @param {string} level
   * @param message
   * @param indice
   */
  public async log<T>(
    level: string,
    message: T,
    indice?: string,
  ): Promise<any> {
    if (!!!indice) {
      indice = OpenSearchLoggerUtilities.getRollingIndex(
        this.options.indexPrefix,
        this.options.rollingOffsetMode,
      );
    }

    await this.createIndexIfNotExists(indice);

    const result = await this.client.index({
      index: indice,
      body: {
        date: new Date(),
        hostname: os.hostname(),
        level,
        data: JSON.stringify(message),
      },
    });

    if (this.options.stdout) {
      console.log(`[${this.options.name}] ${JSON.stringify(message)}`);
    }

    return result;
  }

  public async raw<T>(message: T, indice?: string): Promise<any> {
    if (!!!indice) {
      indice = OpenSearchLoggerUtilities.getRollingIndex(
        this.options.indexPrefix,
        this.options.rollingOffsetMode,
      );
    }

    await this.createIndexIfNotExists(indice);

    const result = await this.client.index({
      index: indice,
      body: message,
    });

    if (this.options.stdout) {
      console.log(`[${this.options.name}] ${JSON.stringify(message)}`);
    }

    return result;
  }

  public async info<T>(message: T, indice?: string): Promise<string> {
    return this.log('info', message, indice);
  }

  public async error<T>(message: T, indice?: string): Promise<string> {
    return this.log('error', message, indice);
  }

  public async debug<T>(message: T, indice?: string): Promise<string> {
    return this.log('debug', message, indice);
  }

  public async warning<T>(message: T, indice?: string): Promise<string> {
    return this.log('warning', message, indice);
  }

  public async trace<T>(message: T, indice?: string): Promise<string> {
    return this.log('trace', message, indice);
  }

  public async getLatest(index?: string) {
    if (!!!index) {
      index = `${this.options.indexPrefix}*`;
    }

    return this.client.search({
      index,
      body: {
        sort: [
          {
            date: {
              order: 'desc',
            },
          },
        ],
      },
    });
  }

  // public async search<
  //   TResponse = Record<string, any>,
  //   TRequestBody extends RequestBody = Record<string, any>,
  //   TContext = Context,
  // >(
  //   obj: Search,
  // ): Promise<TransportRequestPromise<ApiResponse<TResponse, TContext>>> {
  //   return this.client.search(obj);
  // }
}
