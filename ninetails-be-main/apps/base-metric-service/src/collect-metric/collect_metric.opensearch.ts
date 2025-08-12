import { Inject, Injectable } from '@nestjs/common';
import { CollectMetricSearchInput } from './collect_metric.dto';
var { Client } = require('@opensearch-project/opensearch');

@Injectable()
export class CollectMetricOpensearch {
  public readonly indexName = 'collect_metrics';
  private client;
  constructor() {
    this.client = new Client({
      node: process.env.OPENSEARCH_SERVER,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async search(input: CollectMetricSearchInput) {
    try {
      const query = {
        query: {
          bool: {
            filter: [
              {
                term: {
                  'data.dispatch_no': input.area,
                },
              },
              {
                range: {
                  'data.timestamp': {
                    gte: input.start_date,
                    lte: input.end_date,
                  },
                },
              },
            ],
          },
        },
        aggs: {
          total_5L_gen: {
            sum: {
              field: 'data.5L_gen',
            },
          },
          total_10L_gen: {
            sum: {
              field: 'data.10L_gen',
            },
          },
          total_10L_reu: {
            sum: {
              field: 'data.10L_reu',
            },
          },
          total_20L_gen: {
            sum: {
              field: 'data.20L_gen',
            },
          },
          total_20L_reu: {
            sum: {
              field: 'data.20L_reu',
            },
          },
          total_30L_gen: {
            sum: {
              field: 'data.30L_gen',
            },
          },
          total_50L_gen: {
            sum: {
              field: 'data.50L_gen',
            },
          },
          total_50L_pub: {
            sum: {
              field: 'data.50L_pub',
            },
          },
          total_75L_gen: {
            sum: {
              field: 'data.75L_gen',
            },
          },
          total_75L_pub: {
            sum: {
              field: 'data.75L_pub',
            },
          },
          total_ext: {
            sum: {
              field: 'data.ext',
            },
          },
          total_etc: {
            sum: {
              field: 'data.etc',
            },
          },
        },
      };

      const response = await this.client.search({
        index: this.indexName,
        body: query,
      });

      return response;
    } catch (error) {}
  }

  async exists() {
    const indexExistsResponse = await this.client.indices.exists({
      index: this.indexName,
    });
    if (indexExistsResponse.statusCode === 200) {
      return true;
    }
    return false;
  }
}
