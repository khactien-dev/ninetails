import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { DataSet } from './opensearch.dto';
import * as moment from 'moment';
import { IOpenSearchResult } from 'libs/common/constants/common.constant';
import { DataSource } from 'typeorm';
import { EdgeManagementService } from '../edge-management/edge-management.service';

@Injectable()
export class SingleIngestService {
  logger: Logger;

  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private dataSource: DataSource,
    private edgeManagementService: EdgeManagementService,
  ) {
    this.logger = new Logger();
    this.logger.log(
      `OpenSearch client initialized with node: ${this.openSearchClient.connectionPool}`,
    );
  }

  handlePack5Min(ts: Date) {
    const startMinute5Min = Math.floor(ts.getMinutes() / 5) * 5;
    const packStart5Min = new Date(ts);
    packStart5Min.setMinutes(startMinute5Min, 0, 0);
    const packEnd5Min = new Date(packStart5Min);
    packEnd5Min.setMinutes(packEnd5Min.getMinutes() + 5);
    packEnd5Min.setSeconds(packEnd5Min.getSeconds() - 1);
    return { packStart5Min, packEnd5Min };
  }

  handlePack1Hour(ts: Date) {
    const packStartHour = new Date(ts);
    packStartHour.setMinutes(0, 0, 0);
    const packEndHour = new Date(packStartHour);
    packEndHour.setHours(packEndHour.getHours() + 1);
    packEndHour.setSeconds(packEndHour.getSeconds() - 1);
    return { packStartHour, packEndHour };
  }

  async singleDataIngestion(input: DataSet): Promise<any> {
    this.logger.log(
      `Inside singleUpload() Method | Ingesting single data with index ${input.indexName} `,
    );
    try {
      const schema = input.indexName.split('.')[0];
      // input.data.data = input.data.data.data;
      input.data.data.timestamp = moment(
        input.data.data.timestamp,
      ).toISOString();
      if (input.indexName.split('.')[1] === 'drive_metrics') {
        const startDay = moment(input.data.data.timestamp)
          .startOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS');
        const check: IOpenSearchResult = await this.openSearchClient.search({
          index: input.indexName,
          body: {
            query: {
              bool: {
                filter: [
                  {
                    match_phrase: {
                      'data.route_id': input.data.data.route_id,
                    },
                  },
                  {
                    match_phrase: {
                      change_mode: true,
                    },
                  },
                  {
                    range: {
                      'data.timestamp': {
                        gte: startDay,
                        format: 'strict_date_optional_time',
                      },
                    },
                  },
                ],
              },
            },
            sort: [{ 'data.timestamp': { order: 'desc' } }],
            size: 1,
          },
        });
        const saveDb = {
          drive_mode: input.data.data.drive_mode,
          section_name: input.data.data.section_name,
          timestamp: input.data.data.timestamp,
          route_id: input.data.data.route_id,
        };
        if (check && check.body.hits.hits[0]) {
          const data = check.body.hits.hits[0];
          if (data._source.data.drive_mode !== input.data.data.drive_mode) {
            const range = {
              'data.timestamp': {
                gte: data._source.data.timestamp,
                lte: input.data.data.timestamp,
                format: 'strict_date_optional_time',
              },
            };
            const bodyQuery = {
              query: {
                bool: {
                  filter: [
                    {
                      match_phrase: {
                        'data.drive_mode': data._source.data.drive_mode,
                      },
                    },
                    {
                      match_phrase: {
                        'data.route_id': input.data.data.route_id,
                      },
                    },
                    { range },
                  ],
                },
              },
              sort: [{ 'data.timestamp': { order: 'desc' } }],
              aggs: {
                // total_trip_time: {
                //   sum: {
                //     script: {
                //       source: `
                //       if (doc.containsKey('data.trip_time.keyword') && !doc['data.trip_time.keyword'].empty) {
                //         String tripTime = doc['data.trip_time.keyword'].value;
                //         int colon1 = tripTime.indexOf(':');
                //         int colon2 = tripTime.lastIndexOf(':');
                //         if (colon1 != -1 && colon2 != -1 && colon1 != colon2) {
                //           double hours = Double.parseDouble(tripTime.substring(0, colon1));
                //           double minutes = Double.parseDouble(tripTime.substring(colon1 + 1, colon2));
                //           double seconds = Double.parseDouble(tripTime.substring(colon2 + 1));
                //           return (hours * 60) + (minutes * 60) + seconds;
                //         }
                //       }
                //       return 0;
                //     `,
                //     },
                //   },
                // },
              },
            };
            const entryCurrent = moment(input.data.data.timestamp) as any;
            const duration =
              entryCurrent - (moment(data._source.data.timestamp) as any);
            const updateDoc = {
              duration_seconds: duration / 1000,
              duration: moment()
                .startOf('day')
                .milliseconds(duration)
                .format('HH:mm:ss'),
            };
            saveDb['duration_seconds'] = updateDoc.duration_seconds;
            saveDb['duration'] = updateDoc.duration;
            if (data._source.data.drive_mode === 5) {
              // const aggsCollect = {
              //   total_collect_amount: {
              //     sum: {
              //       script: {
              //         source: `def total = 0;
              //         if (
              //           params._source['data']['5L_gen'] instanceof List &&
              //           params._source['data']['5L_gen'] != null
              //         ) {
              //           total += params._source['data']['5L_gen'][0];
              //         }
              //         if (
              //           params._source['data']['10L_gen'] instanceof List &&
              //           params._source['data']['10L_gen'] != null
              //         ) {
              //           total += params._source['data']['10L_gen'][0];
              //         }
              //         if (
              //           params._source['data']['10L_reu'] instanceof List &&
              //           params._source['data']['10L_reu'] != null
              //         ) {
              //           total += params._source['data']['10L_reu'][0];
              //         }
              //         if (
              //           params._source['data']['20L_reu'] instanceof List &&
              //           params._source['data']['20L_reu'] != null
              //         ) {
              //           total += params._source['data']['20L_reu'][0];
              //         }
              //         if (
              //           params._source['data']['20L_gen'] instanceof List &&
              //           params._source['data']['20L_gen'] != null
              //         ) {
              //           total += params._source['data']['20L_gen'][0];
              //         }
              //         if (
              //           params._source['data']['30L_gen'] instanceof List &&
              //           params._source['data']['30L_gen'] != null
              //         ) {
              //           total += params._source['data']['30L_gen'][0];
              //         }
              //         if (
              //           params._source['data']['50L_gen'] instanceof List &&
              //           params._source['data']['50L_gen'] != null
              //         ) {
              //           total += params._source['data']['50L_gen'][0];
              //         }
              //         if (
              //           params._source['data']['50L_pub'] instanceof List &&
              //           params._source['data']['50L_pub'] != null
              //         ) {
              //           total += params._source['data']['50L_pub'][0];
              //         }
              //         if (
              //           params._source['data']['75L_gen'] instanceof List &&
              //           params._source['data']['75L_gen'] != null
              //         ) {
              //           total += params._source['data']['75L_gen'][0];
              //         }
              //         if (
              //           params._source['data']['75L_pub'] instanceof List &&
              //           params._source['data']['75L_pub'] != null
              //         ) {
              //           total += params._source['data']['75L_pub'][0];
              //         }
              //         if (
              //           params._source['data']['ext'] instanceof List &&
              //           params._source['data']['ext'] != null
              //         ) {
              //           total += params._source['data']['ext'][0];
              //         }
              //         if (
              //           params._source['data']['etc'] instanceof List &&
              //           params._source['data']['etc'] != null
              //         ) {
              //           total += params._source['data']['etc'][0];
              //         }
              //         return total;`,
              //         lang: 'painless',
              //       },
              //     },
              //   },
              //   total_weight: {
              //     sum: {
              //       script: {
              //         source: `def total = 0;
              //         if (
              //           params._source['data']['5L_gen'] instanceof List &&
              //           params._source['data']['5L_gen'] != null
              //         ) {
              //           total += params._source['data']['5L_gen'][2];
              //         }
              //         if (
              //           params._source['data']['10L_gen'] instanceof List &&
              //           params._source['data']['10L_gen'] != null
              //         ) {
              //           total += params._source['data']['10L_gen'][2];
              //         }
              //         if (
              //           params._source['data']['10L_reu'] instanceof List &&
              //           params._source['data']['10L_reu'] != null
              //         ) {
              //           total += params._source['data']['10L_reu'][2];
              //         }
              //         if (
              //           params._source['data']['20L_reu'] instanceof List &&
              //           params._source['data']['20L_reu'] != null
              //         ) {
              //           total += params._source['data']['20L_reu'][2];
              //         }
              //         if (
              //           params._source['data']['20L_gen'] instanceof List &&
              //           params._source['data']['20L_gen'] != null
              //         ) {
              //           total += params._source['data']['20L_gen'][2];
              //         }
              //         if (
              //           params._source['data']['30L_gen'] instanceof List &&
              //           params._source['data']['30L_gen'] != null
              //         ) {
              //           total += params._source['data']['30L_gen'][2];
              //         }
              //         if (
              //           params._source['data']['50L_gen'] instanceof List &&
              //           params._source['data']['50L_gen'] != null
              //         ) {
              //           total += params._source['data']['50L_gen'][2];
              //         }
              //         if (
              //           params._source['data']['50L_pub'] instanceof List &&
              //           params._source['data']['50L_pub'] != null
              //         ) {
              //           total += params._source['data']['50L_pub'][2];
              //         }
              //         if (
              //           params._source['data']['75L_gen'] instanceof List &&
              //           params._source['data']['75L_gen'] != null
              //         ) {
              //           total += params._source['data']['75L_gen'][2];
              //         }
              //         if (
              //           params._source['data']['75L_pub'] instanceof List &&
              //           params._source['data']['75L_pub'] != null
              //         ) {
              //           total += params._source['data']['75L_pub'][2];
              //         }
              //         if (
              //           params._source['data']['ext'] instanceof List &&
              //           params._source['data']['ext'] != null
              //         ) {
              //           total += params._source['data']['ext'][2];
              //         }
              //         if (
              //           params._source['data']['etc'] instanceof List &&
              //           params._source['data']['etc'] != null
              //         ) {
              //           total += params._source['data']['etc'][2];
              //         }
              //         return total;`,
              //         lang: 'painless',
              //       },
              //     },
              //   },
              // };
              const collects: IOpenSearchResult =
                await this.openSearchClient.search({
                  index: `${schema}.collect_metrics`,
                  body: {
                    query: {
                      bool: {
                        filter: [
                          {
                            match_phrase: {
                              'data.route_id': input.data.data.route_id,
                            },
                          },
                          { range },
                        ],
                      },
                    },
                    // aggs: aggsCollect,
                  },
                });
              const cal = collects.body.hits.hits.reduce(
                (p, c) => {
                  const val = c._source.data;
                  const totalAmount =
                    val['5L_gen'][0] +
                    val['10L_gen'][0] +
                    val['10L_reu'][0] +
                    val['20L_gen'][0] +
                    val['20L_reu'][0] +
                    val['30L_gen'][0] +
                    val['50L_gen'][0] +
                    val['50L_pub'][0] +
                    val['75L_gen'][0] +
                    val['75L_pub'][0] +
                    val['ext'][0] +
                    val['etc'][0];
                  const totalWeight =
                    val['5L_gen'][2] +
                    val['10L_gen'][2] +
                    val['10L_reu'][2] +
                    val['20L_gen'][2] +
                    val['20L_reu'][2] +
                    val['30L_gen'][2] +
                    val['50L_gen'][2] +
                    val['50L_pub'][2] +
                    val['75L_gen'][2] +
                    val['75L_pub'][2] +
                    val['ext'][2] +
                    val['etc'][2];
                  return {
                    amount: p.amount + totalAmount,
                    weight: p.weight + totalWeight,
                  };
                },
                {
                  amount: 0,
                  weight: 0,
                },
              );
              saveDb['collect_amount'] = cal.amount;
              saveDb['weight'] = cal.weight;
              updateDoc['collect_amount'] =
                // collects.body.aggregations.total_collect_amount.value;
                cal.amount;
              updateDoc['weight'] =
                // collects.body.aggregations.total_weight.value;
                cal.weight;
            }
            if (![6, 7, 8].includes(data._source.data.drive_mode)) {
              // bodyQuery.aggs['total_trip_distance'] = {
              //   sum: {
              //     field: 'data.distance',
              //   },
              // };
              const getSum: IOpenSearchResult =
                await this.openSearchClient.search({
                  index: input.indexName,
                  body: bodyQuery,
                });
              const sum = this.preciseSum(
                ...getSum.body.hits.hits.map((g) => g._source.data.distance),
              );
              await this.openSearchClient.update({
                index: input.indexName,
                id: data._id,
                body: {
                  doc: {
                    total_trip_distance:
                      // getSum.body?.aggregations?.total_trip_distance?.value,
                      sum,
                  },
                },
              });
              saveDb['total_trip_distance'] = sum;
            }
            await this.openSearchClient.update({
              index: input.indexName,
              id: data._id,
              body: {
                doc: updateDoc,
              },
            });
            input.data.change_mode = true;
          }
        } else {
          input.data.change_mode = true;
        }
        if (input.data.data.location) {
          input.data.location_string = `${input.data.data.location}`;
        }
        if (input.data.change_mode === true) {
          const diary = await this.dataSource.query(
            `select id from "${schema}".driving_diary where route_id = ${saveDb.route_id} order by timestamp desc limit 1;`,
          );
          if (diary.length) {
            await this.dataSource.query(
              `update "${schema}".driving_diary set 
              duration = '${saveDb['duration']}', total_trip_distance = ${saveDb['total_trip_distance'] || null}, 
              collect_amount = ${saveDb['collect_amount'] || null}, weight = ${saveDb['weight'] || null}, 
              duration_seconds = ${saveDb['duration_seconds'] || null} where id = ${diary[0].id}`,
            );
          }
          await this.dataSource.query(
            `insert into "${schema}".driving_diary 
            (route_id, section_name, drive_mode, timestamp) 
            values(
            ${saveDb.route_id}, '${saveDb.section_name}', ${saveDb.drive_mode}, '${saveDb.timestamp}');`,
          );
        }
      } else if (input.indexName.split('.')[1] === 'edge_state_metrics') {
        input.data.data.timestamp = new Date();
      }
      this.logger.log(`Data before indexed with data: ${JSON.stringify(input.data)}`);
      const res = await this.openSearchClient.index({
        index: input.indexName,
        body: input.data,
      });
      this.logger.log(`Data after indexed with data: ${JSON.stringify(res.body)}`);
      this.logger.log('Data indexed successfully');
      return res.body;
    } catch (err) {
      console.log(err);
      // this.logger.error(`Exception occurred : ${err})`);
      return {
        httpCode: 500,
        error: err,
      };
    }
  }

  preciseSum(...numbers: number[]) {
    const maxDecimals = numbers.reduce((max, num) => {
      const decimals = (num.toString().split('.')[1] || '').length;
      return Math.max(max, decimals);
    }, 0);

    const factor = Math.pow(10, maxDecimals);
    const sum = numbers.reduce((acc, num) => acc + Math.round(num * factor), 0);

    return sum / factor;
  }
}
