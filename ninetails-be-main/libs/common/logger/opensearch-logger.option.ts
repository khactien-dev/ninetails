import { ROLLING_INDEX_MODE } from 'libs/common/logger/opensearch-logger.utilities';
import { ClientOptions } from '@opensearch-project/opensearch';

export class OpenSearchLoggerOptions {
  public name: string;
  public indexPrefix: string;
  public rollingOffsetMode: ROLLING_INDEX_MODE;
  public stdout: boolean;
  public openSearchClientOptions: ClientOptions;
}
