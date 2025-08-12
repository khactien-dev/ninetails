import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DataSet,
  DeleteInput,
  SearchAndFilterListDto,
  searchCharacterByKeyword,
  searchIndex,
} from './opensearch.dto';
import { Client } from '@opensearch-project/opensearch';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import * as console from 'node:console';
import { formatDate } from 'libs/utils/helper.util';
import { IOpenSearchResult } from 'libs/common/constants/common.constant';
import { IndexName } from 'libs/indexes/base.index';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OpensearchService {
  logger: Logger;

  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {
    this.logger = new Logger();
    this.logger.log(
      `OpenSearch client initialized with node: ${this.openSearchClient.connectionPool}`,
    );
  }

  async search(index: string, query: any) {
    try {
      const response = await this.openSearchClient.search({
        index,
        body: query,
      });
      return response.body.hits.hits;
    } catch (error) {
      this.logger.error(`Error searching index ${index}`, error);
      throw error;
    }
  }

  async createIndex(indexName: string, mappings: any) {
    try {
      const exists = await this.openSearchClient.indices.exists({
        index: indexName,
      });
      if (exists.body) {
        this.logger.log(
          `Index ${indexName} already exists, skipping creation.`,
        );
        return;
      }

      await this.openSearchClient.indices.create({
        index: indexName,
        body: {
          mappings,
        },
      });
      this.logger.log(`Index ${indexName} created successfully`);
    } catch (error) {
      this.logger.error(`Error creating index ${indexName}`, error);
    }
  }

  async startJob(jobId: string) {
    try {
      const response = await this.openSearchClient.rollups.start({
        id: jobId,
      });
      this.logger.log(`Rollup job ${jobId} started successfully.`);
      return response.body;
    } catch (error) {
      this.logger.error(`Error starting job`, error);
      throw error;
    }
  }

  async createRollupJob(jobId: string, rollup: any): Promise<any> {
    try {
      // Kiểm tra xem rollup job đã tồn tại hay chưa
      try {
        const existingJob = await this.openSearchClient.rollups.get({
          id: jobId,
        });

        if (existingJob.body && existingJob.body.rollup.rollup_id === jobId) {
          this.logger.log(
            `Rollup job ${jobId} already exists. Skipping creation.`,
          );
          return existingJob.body;
        }
      } catch (checkError) {
        if (checkError.meta?.statusCode !== 404) {
          this.logger.error(
            `Error checking existence of rollup job ${jobId}:`,
            checkError.meta?.body || checkError.message,
          );
          throw checkError;
        }
        // Nếu là lỗi 404 (job không tồn tại), tiếp tục tạo job
      }

      // Tạo mới rollup job
      const response = await this.openSearchClient.rollups.put({
        id: jobId,
        body: {
          rollup,
        },
      });

      this.logger.log(`Rollup job ${jobId} created successfully.`);
      return response.body;
    } catch (error) {
      this.logger.error(
        `Failed to create rollup job ${jobId}:`,
        error.meta?.body || error.message,
      );
      throw error;
    }
  }

  async bulkDataIngestion(input: DataSet): Promise<any> {
    this.logger.log(
      `Inside bulkUpload() Method | Ingesting Bulk data of length ${input.data.length} having index ${input.indexName}`,
    );

    const body = input.data.flatMap((doc) => {
      return [{ index: { _index: input.indexName, _id: doc.id } }, doc];
    });

    try {
      const res = await this.openSearchClient.bulk({ body });
      this.logger.log('Data indexed successfully');
      return res.body;
    } catch (err) {
      this.logger.error(`Exception occurred : ${err})`);
      return {
        httpCode: 500,
        error: err,
      };
    }
  }

  async singleDataIngestion1(input: DataSet): Promise<any> {
    this.logger.log(
      `Inside singleUpload() Method | Ingesting single data with index ${input.indexName} `,
    );

    try {
      const res = await this.openSearchClient.index({
        index: input.indexName,
        body: input.data,
      });
      this.logger.log('Data indexed successfully');
      return res.body;
    } catch (err) {
      this.logger.error(`Exception occurred : ${err})`);
      return {
        httpCode: 500,
        error: err,
      };
    }
  }

  async singleDataIngestion2(input: DataSet): Promise<any> {
    this.logger.log(
      `Inside singleUpload() Method | Ingesting single data with index ${input.indexName} `,
    );

    try {
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
                    'data.segment_id': input.data.data.segmentId,
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
      if (check && check.body.hits.hits[0]) {
        const data = check.body.hits.hits[0];
        if (data._source.data.drive_mode !== input.data.data.drive_mode) {
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
                      'data.segment_id.keyword': input.data.data.segmentId,
                    },
                  },
                  {
                    range: {
                      'data.timestamp': {
                        gte: data._source.data.timestamp,
                        lte: input.data.data.timestamp,
                        format: 'strict_date_optional_time',
                      },
                    },
                  },
                ],
              },
            },
            sort: [{ 'data.timestamp': { order: 'desc' } }],
            aggs: {
              total_trip_time: {
                sum: {
                  script: {
                    source: `
                      if (doc.containsKey('data.trip_time.keyword') && !doc['data.trip_time.keyword'].empty) {
                        String tripTime = doc['data.trip_time.keyword'].value;
                        int colon1 = tripTime.indexOf(':');
                        int colon2 = tripTime.lastIndexOf(':');
                        if (colon1 != -1 && colon2 != -1 && colon1 != colon2) {
                          double hours = Double.parseDouble(tripTime.substring(0, colon1));
                          double minutes = Double.parseDouble(tripTime.substring(colon1 + 1, colon2));
                          double seconds = Double.parseDouble(tripTime.substring(colon2 + 1));
                          return (hours * 60) + (minutes * 60) + seconds;
                        }
                      }
                      return 0;
                    `,
                  },
                },
              },
            },
          };
          if (![6, 7, 8].includes(input.data.drive_mode)) {
            bodyQuery.aggs['total_trip_distance'] = {
              sum: {
                field: 'data.distance',
              },
            };
            const getSum: IOpenSearchResult =
              await this.openSearchClient.search({
                index: input.indexName,
                body: bodyQuery,
              });
            // input.data.total_trip_distance =
            //   getSum.body?.aggregations?.total_trip_distance?.value;
            await this.openSearchClient.update({
              index: input.indexName,
              id: data._id,
              body: {
                doc: {
                  total_trip_distance:
                    getSum.body?.aggregations?.total_trip_distance?.value,
                },
              },
            });
          }
          input.data.change_mode = true;
        }
      } else {
        input.data.change_mode = true;
      }
      const res = await this.openSearchClient.index({
        index: input.indexName,
        body: input.data,
      });
      this.logger.log('Data indexed successfully');
      return res.body;
    } catch (err) {
      this.logger.error(`Exception occurred : ${err})`);
      return {
        httpCode: 500,
        error: err,
      };
    }
  }

  async updateMessageIfVehicleStateChanged() {
    try {
      const { body: latestResponse } = await this.openSearchClient.search({
        index: 'drive-metric',
        body: {
          sort: [{ time: { order: 'desc' } }],
          size: 1,
        },
      });

      if (latestResponse.hits.total.value === 0) {
        console.log('No documents found');
        return;
      }

      const latestHit = latestResponse.hits.hits[0];
      const latestVehicleId = latestHit._source.vehicle_id;
      const latestVehicleState = latestHit._source.vehicle_state;

      const { body: oldRecordsResponse } = await this.openSearchClient.search({
        index: 'drive-metric',
        body: {
          query: {
            match_phrase: {
              vehicle_id: latestVehicleId,
            },
          },
          size: 1000,
        },
      });

      if (oldRecordsResponse.hits.total.value > 2) {
        const hits = oldRecordsResponse.hits.hits;

        const updatedDocuments = [];

        for (const hit of hits) {
          const currentVehicleState = hit._source.vehicle_state;

          if (currentVehicleState !== latestVehicleState) {
            await this.openSearchClient.update({
              index: 'drive-metric',
              id: hit._id,
              body: {
                doc: {
                  exit_at: new Date().toISOString(),
                },
              },
              refresh: true,
            });

            updatedDocuments.push(hit._id);
          }
        }

        this.logger.log(`Updated ${updatedDocuments.length} documents`);
        return updatedDocuments;
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to update message:: ${error})`);
    }
  }

  async searchAndCombine() {
    const driveMetricResult = await this.openSearchClient.search({
      index: 'drive_metric',
      body: {
        query: {
          bool: {
            must: [],
            filter: [
              {
                match_all: {},
              },
              {
                match_phrase: {
                  'dispatch_no.keyword': '20240531-S003',
                },
              },
            ],
            should: [],
            must_not: [],
          },
        },
        _source: ['dispatch_no', 'vehicle_state'],
      },
    });

    // Truy vấn đến chỉ mục vehicle_route
    const vehicleRouteResult = await this.openSearchClient.search({
      index: 'vehicle_route',
      body: {
        query: {
          match_phrase: {
            'data.dispatch_no.keyword': '20240531-S003',
          },
        },
        _source: ['data.dispatch_no', 'data.coordinates'],
      },
    });

    console.log(vehicleRouteResult.body.hits.hits[0]._source);

    // Kết hợp dữ liệu từ hai truy vấn
    const combinedResult = {
      _index: 'custom_index',
      _source: {
        dispatch_no: '20240531-S003',
        vehicle_state: null,
        coordinates: [],
      },
    };

    if (driveMetricResult.body.hits.hits.length > 0) {
      const driveMetricSource = driveMetricResult.body.hits.hits[0]._source;
      combinedResult._source.vehicle_state = driveMetricSource.vehicle_state;
    }

    if (vehicleRouteResult.body.hits.hits.length > 0) {
      const vehicleRouteSource = vehicleRouteResult.body.hits.hits[0]._source;
      combinedResult._source.coordinates = vehicleRouteSource.data.coordinates;
    }

    return combinedResult;
  }

  async searchIndex(input: searchIndex): Promise<any> {
    this.logger.log(`Inside searchIndex() Method`);
    let body: any;

    try {
      const res = await this.openSearchClient.search({
        index: input.indexName,
        body,
      });
      if (res.body.hits.total.value == 0) {
        return {
          httpCode: 200,
          data: [],
          message: `No Data found based on Index: ${input.indexName}`,
        };
      }
      const result = res.body.hits.hits.map((item) => {
        return item._source;
      });

      return result;
    } catch (error) {
      this.logger.error(`Exception occurred while doing : ${error})`);
      return {
        httpCode: 500,
        data: [],
        error: error,
      };
    }
  }

  async calculateVehicleStateDuration(index: string) {
    const query = {
      aggs: {
        results: {
          terms: {
            field: 'vehicle_id.keyword',
            order: {
              _key: 'asc',
            },
            size: 5,
          },
          aggs: {
            vehicle_state_duration: {
              sum: {
                field: 'vehicle_state_duration',
              },
            },
          },
        },
      },
      size: 0,
      stored_fields: ['*'],
      script_fields: {},
      docvalue_fields: [
        {
          field: 'exit_at',
          format: 'date_time',
        },
        {
          field: 'time',
          format: 'date_time',
        },
      ],
      _source: {
        excludes: [],
      },
      query: {
        bool: {
          must: [
            {
              match_all: {},
            },
          ],
          filter: [
            {
              match_phrase: {
                main_record: true,
              },
            },
            {
              range: {
                time: {
                  gte: 'now-1d/d',
                  lt: 'now+1d/d',
                },
              },
            },
          ],
          should: [],
          must_not: [],
        },
      },
    };

    try {
      const { body } = await this.openSearchClient.search({
        index,
        body: query,
      });
      return body?.aggregations?.results?.buckets;
    } catch (error) {
      this.logger.error(`Exception occurred while doing : ${error})`);
      return {
        httpCode: 500,
        data: [],
        error: error,
      };
    }
  }

  async searchCharaterByKeyword(input: searchCharacterByKeyword): Promise<any> {
    this.logger.log(`Inside searchByKeyword() Method`);
    let body: any;

    this.logger.log(
      `Searching for Keyword: ${input.keyword} in the index : ${input.indexName} `,
    );
    body = {
      query: {
        multi_match: {
          query: input.keyword,
        },
      },
    };

    try {
      const res = await this.openSearchClient.search({
        index: input.indexName,
        body,
      });
      if (res.body.hits.total.value == 0) {
        return {
          httpCode: 200,
          data: [],
          message: `No Data found based based on Keyword: ${input.keyword}`,
        };
      }
      const result = res.body.hits.hits.map((item) => {
        return {
          _id: item._id,
          data: item._source,
        };
      });

      return {
        httpCode: 200,
        data: result,
        message: `Data fetched successfully based on Keyword: ${input.keyword}`,
      };
    } catch (error) {
      this.logger.error(`Exception occurred while doing : ${error})`);
      return {
        httpCode: 500,
        data: [],
        error: error,
      };
    }
  }

  async purgeIndex(input: DeleteInput): Promise<any> {
    this.logger.log(`Inside purgeIndex() Method`);
    try {
      this.logger.log(`Deleting all records having index: ${input.indexName}`);

      await this.openSearchClient.indices.delete({
        index: input.indexName,
      });

      return {
        httpCode: 200,
        message: `Record deleted having index: ${input.indexName}, characterId: ${input.id}`,
      };
    } catch (error) {
      this.logger.error(`Exception occurred while doing : ${error})`);
      return {
        httpCode: 500,
        error: error,
      };
    }
  }

  async purgeDocumentById(input: DeleteInput): Promise<any> {
    this.logger.log(`Inside purgeDocumentById() Method : ${input}`);
    try {
      if (input.id != null && input.indexName != null) {
        this.logger.log(
          `Deleting record having index: ${input.indexName}, id: ${input.id}`,
        );
        await this.openSearchClient.delete({
          index: input.indexName,
          id: input.id,
        });
      } else {
        this.logger.log(`indexName or document id is missing`);
        return {
          httpCode: 200,
          message: `indexName or document id is missing`,
        };
      }

      return {
        httpCode: 200,
        message: `Record deleted having index: ${input.indexName}, id: ${input.id}`,
      };
    } catch (error) {
      this.logger.error(
        `Exception occurred while doing purgeDocumentById : ${error})`,
      );
      return {
        httpCode: 500,
        message: error,
      };
    }
  }

  async searchVehicleIdByKeyword(indexName, vehicleId, limit) {
    this.logger.log(`Inside searchByKeyword() Method`);
    this.logger.log(
      `Search Vehicle Id By Keyword: ${vehicleId} in the index : ${indexName} `,
    );
    let body: any;
    body = {
      query: {
        bool: {
          must: [],
          filter: [
            {
              match_all: {},
            },
            {
              match_phrase: {
                _index: indexName,
              },
            },
            {
              match_phrase: {
                'data.vehicle_id.keyword': vehicleId,
              },
            },
          ],
          should: [],
          must_not: [],
        },
      },
      size: limit,
      sort: [
        {
          'data.timestamp': {
            order: 'desc',
          },
        },
      ],
    };

    const res = await this.openSearchClient.search({
      index: indexName,
      body,
    });
    if (res.body.hits.total.value == 0) {
      return [];
    }
    return res.body.hits.hits.map((item) => {
      return {
        _id: item._id,
        data: item._source,
      };
    });
  }

  async searchAllTodayOfVehicleId(indexName, vehicleId) {
    this.logger.log(`Inside searchByKeyword() Method`);
    this.logger.log(
      `Search Vehicle Id By Keyword: ${vehicleId} in the index : ${indexName} `,
    );
    const start = moment().startOf('day').format('YYYY-MM-DD');
    const end = moment().add(1, 'd').startOf('day').format('YYYY-MM-DD');
    let body: any;
    body = {
      query: {
        bool: {
          must: [],
          filter: [
            {
              match_all: {},
            },
            {
              match_phrase: {
                _index: indexName,
              },
            },
            {
              match_phrase: {
                'data.vehicle_id.keyword': vehicleId,
              },
            },
            {
              range: {
                'data.timestamp': {
                  gte: start + 'T00:00:00.000',
                  lt: end + 'T00:00:00.000',
                },
              },
            },
            {
              bool: {
                should: [
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '000',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '001',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '002',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '003',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '004',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '005',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '006',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '007',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '008',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '009',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '010',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '011',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '012',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '013',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '014',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '015',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '016',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '017',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '018',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '019',
                    },
                  },
                  {
                    match_phrase: {
                      'data.segment_id.keyword': '020',
                    },
                  },
                ],
                minimum_should_match: 1,
              },
            },
          ],
          should: [],
          must_not: [],
        },
      },
      docvalue_fields: [
        {
          field: 'data.timestamp',
          format: 'date_time',
        },
      ],
      _source: ['data.segment_id'],
      size: 10000,
    };
    const res = await this.openSearchClient.search({
      index: indexName,
      body,
    });
    if (res.body.hits.total.value == 0) {
      return [];
    }
    return res.body.hits.hits.map((item) => {
      return item._source.data;
    });
  }

  async calculateTotalForDay(
    startDate: string,
    endDate: string,
    customerId: string,
  ) {
    const rangeQuery = this.createRangeQueryDataSet(
      startDate,
      endDate,
      'data.timestamp',
    );
    const schema = customerId.toLowerCase();

    const driverMetrics = await this.getDataIndexMetrics(
      rangeQuery,
      schema,
      schema + '.drive_metrics',
    );

    const collectMetrics = await this.getDataIndexMetrics(
      rangeQuery,
      schema,
      schema + '.collect_metrics',
    );

    const uniqueVehicleData = await this.getUniqueVehicleData(driverMetrics);

    const totalVehicleBySchema = await this.totalNumberBySchema(
      schema,
      'vehicle',
    );

    const getDriverMetrics = await this.getDriverMetrics(
      driverMetrics,
      schema,
      startDate,
    );

    const fields = [
      '5L_gen',
      '10L_gen',
      '10L_reu',
      '20L_gen',
      '20L_reu',
      '30L_gen',
      '50L_gen',
      '50L_pub',
      '75L_gen',
      '75L_pub',
      'ext',
      'etc',
    ];

    const totalAllTrashBags = await this.totalTrashBags(fields, collectMetrics);

    const totalTrashBags = Object.values(totalAllTrashBags)
      .map((value) => value as number)
      .reduce((sum, value) => sum + value, 0);

    const totalAllCollectedWeight = await this.totalCollectedWeight(
      fields,
      collectMetrics,
    );

    const sumCollectedWeight = Object.values(totalAllCollectedWeight)
      .map((value) => value as number)
      .reduce((sum, value) => sum + value, 0);

    const totalCollectedWeight = Math.round(sumCollectedWeight * 100) / 100;

    const driverMetricsHasDriverMode5 = await this.getDataIndexMetrics(
      rangeQuery,
      schema,
      schema + '.drive_metrics',
      5,
    );

    const totalCollectTime = await this.getDriverMetrics(
      driverMetricsHasDriverMode5,
      schema,
      startDate,
    );

    const driverMetricsHasDriverMode6 = await this.getDataIndexMetrics(
      rangeQuery,
      schema,
      schema + '.drive_metrics',
      6,
    );

    const totalIdlingTime = await this.getDriverMetrics(
      driverMetricsHasDriverMode6,
      schema,
      startDate,
    );

    const totalRouterBySchema = await this.totalNumberBySchema(schema, 'route');

    const totalStaffBySchema = await this.totalNumberBySchema(schema, 'staff');

    const data = {
      timestamp: new Date().toISOString(),
      total_active_vehicle: uniqueVehicleData.totalUniqueVehicle,
      total_router_by_schema: +totalRouterBySchema,
      total_vehicle_by_schema: +totalVehicleBySchema,
      total_staff_by_schema: +totalStaffBySchema,
      total_eco_score_active_vehicle: uniqueVehicleData.totalEcoScore,
      total_operating_all_active_vehicle: getDriverMetrics.totalTripTimeSeconds,
      total_driving_distance_all_active_vehicle:
        getDriverMetrics.totalTripDistance, //meter
      total_amount_collected_trash_bags: totalTrashBags,
      total_collected_weight_active_vehicles: totalCollectedWeight,
      total_collected_time_all_active_vehicle:
        totalCollectTime.totalTripTimeSeconds,
      total_collected_distance_all_active_vehicle:
        totalCollectTime.totalTripDistance, //meter
      total_overspeeding_time_all_active_vehicle:
        getDriverMetrics.totalOverSpeeding,
      total_idling_time_all_active_vehicle:
        totalIdlingTime.totalTripTimeSeconds,
      total_sudden_acceleration_times_all_active_vehicle:
        getDriverMetrics.totalSuddenAcceleration,
      total_sudden_braking_times_all_active_vehicle:
        getDriverMetrics.totalSuddenBraking,
    };

    return {
      customer_id: schema,
      topic: schema + '.dashboard_for_day',
      data: data,
    };
  }

  // async calculateTotalForDay2(customerId: string, timestamp: string) {
  //   const rangeQuery = this.createRangeQueryDataSet(
  //     timestamp,
  //     timestamp,
  //     'data.timestamp',
  //   );
  //   const schema = customerId.toLowerCase();
  //
  //   const driverMetrics = await this.getDataIndexMetrics(
  //     rangeQuery,
  //     schema,
  //     schema + '.drive_metrics',
  //   );
  //
  //   const collectMetrics = await this.getDataIndexMetrics(
  //     rangeQuery,
  //     schema,
  //     schema + '.collect_metrics',
  //   );
  //
  //   const uniqueVehicleData = await this.getUniqueVehicleData(driverMetrics);
  //
  //   const totalVehicleBySchema = await this.totalNumberBySchema(
  //     schema,
  //     'vehicle',
  //   );
  //
  //   const getDriverMetrics = await this.getDriverMetrics(driverMetrics);
  //
  //   const fields = [
  //     '5L_gen',
  //     '10L_gen',
  //     '10L_reu',
  //     '20L_gen',
  //     '20L_reu',
  //     '30L_gen',
  //     '50L_gen',
  //     '50L_pub',
  //     '75L_gen',
  //     '75L_pub',
  //     'ext',
  //     'etc',
  //   ];
  //
  //   const totalAllTrashBags = await this.totalTrashBags(fields, collectMetrics);
  //
  //   const totalTrashBags = Object.values(totalAllTrashBags)
  //     .map((value) => value as number)
  //     .reduce((sum, value) => sum + value, 0);
  //
  //   const totalAllCollectedWeight = await this.totalCollectedWeight(
  //     fields,
  //     collectMetrics,
  //   );
  //
  //   const totalCollectedWeight = Object.values(totalAllCollectedWeight)
  //     .map((value) => value as number)
  //     .reduce((sum, value) => sum + value, 0);
  //
  //   const driverMetricsHasDriverMode5 = await this.getDataIndexMetrics(
  //     rangeQuery,
  //     schema,
  //     schema + '.drive_metrics',
  //     5,
  //   );
  //
  //   const totalCollectTime = await this.getDriverMetrics(
  //     driverMetricsHasDriverMode5,
  //   );
  //
  //   const driverMetricsHasDriverMode6 = await this.getDataIndexMetrics(
  //     rangeQuery,
  //     schema,
  //     schema + '.drive_metrics',
  //     6,
  //   );
  //
  //   const totalIdlingTime = await this.getDriverMetrics(
  //     driverMetricsHasDriverMode6,
  //
  //   );
  //
  //   const totalRouterBySchema = await this.totalNumberBySchema(schema, 'route');
  //
  //   const totalStaffBySchema = await this.totalNumberBySchema(schema, 'staff');
  //
  //   const data = {
  //     timestamp,
  //     total_active_vehicle: uniqueVehicleData.totalUniqueVehicle,
  //     total_router_by_schema: +totalRouterBySchema,
  //     total_vehicle_by_schema: +totalVehicleBySchema,
  //     total_staff_by_schema: +totalStaffBySchema,
  //     total_eco_score_active_vehicle: uniqueVehicleData.totalEcoScore,
  //     total_operating_all_active_vehicle: getDriverMetrics.totalTripTimeSeconds,
  //     total_driving_distance_all_active_vehicle:
  //       getDriverMetrics.totalTripDistance, //meter
  //     total_amount_collected_trash_bags: totalTrashBags,
  //     total_collected_weight_active_vehicles: totalCollectedWeight,
  //     total_collected_time_all_active_vehicle:
  //       totalCollectTime.totalTripTimeSeconds,
  //     total_collected_distance_all_active_vehicle:
  //       totalCollectTime.totalTripDistance, //meter
  //     total_overspeeding_time_all_active_vehicle:
  //       getDriverMetrics.totalOverSpeeding,
  //     total_idling_time_all_active_vehicle:
  //       totalIdlingTime.totalTripTimeSeconds,
  //     total_sudden_acceleration_times_all_active_vehicle:
  //       getDriverMetrics.totalSuddenAcceleration,
  //     total_sudden_braking_times_all_active_vehicle:
  //       getDriverMetrics.totalSuddenBraking,
  //   };
  //
  //   return {
  //     customer_id: schema,
  //     topic: schema + '.dashboard_for_day',
  //     data: data,
  //   };
  // }

  async getDataIndexMetrics(
    rangeQuery: object,
    schema: string,
    indexMetrics: string,
    driveMode?: number,
  ) {
    const mustQueries = [];

    if (driveMode) {
      mustQueries.push({ term: { 'data.drive_mode': driveMode } });
    }
    mustQueries.push(rangeQuery);

    const body = {
      size: 10000,
      query: {
        bool: {
          must: [...mustQueries, { match: { customer_id: schema } }],
        },
      },
      sort: [{ 'data.timestamp': { order: 'asc' } }],
    };

    const dataMetrics = await this.openSearchClient.search({
      index: indexMetrics,
      body,
    });

    return dataMetrics;
  }

  private createRangeQueryDataSet(
    startDate: string,
    endDate: string,
    field: any,
  ): any {
    return {
      range: { [field]: { gte: startDate || 'now/d', lte: endDate || 'now' } },
    };
  }

  async getUniqueVehicleData(data: any) {
    const uniqueData: { [key: string]: any } = {};
    let totalUniqueVehicles = 0;
    let totalEcoScore = 0;

    data.body.hits.hits.forEach((hit) => {
      const routeId = hit._source.data.route_id;
      const timestamp = hit._source.data.timestamp;
      const ecoScore = hit._source.data.eco_score;

      if (!uniqueData[routeId]) {
        uniqueData[routeId] = hit._source.data;
        totalUniqueVehicles++;
        totalEcoScore += ecoScore;
      } else if (timestamp > uniqueData[routeId].timestamp) {
        totalEcoScore -= uniqueData[routeId].eco_score;
        uniqueData[routeId] = hit._source.data;
        totalEcoScore += ecoScore;
      }
    });

    return {
      uniqueVehicles: Object.values(uniqueData),
      totalUniqueVehicle: totalUniqueVehicles,
      totalEcoScore: totalEcoScore,
    };
  }

  async getDriverMetrics(data: any, schema: string, date: string) {
    const hits = data.body.hits.hits || [];

    const routeIds = [
      ...new Set(hits.map((hit: any) => hit._source.data.route_id)),
    ];

    const multipliers = await this.getOperationMetricsFromDb(
      routeIds,
      schema,
      date,
    );

    const multipliersMap = multipliers.reduce(
      (map, entry) => {
        map[entry.id] = entry.operation_metrics;
        return map;
      },
      {} as Record<number, number>,
    );

    const routeCounts = hits.reduce((acc: Record<number, number>, hit: any) => {
      const routeId = hit._source?.data?.route_id;
      if (routeId !== undefined) {
        acc[routeId] = (acc[routeId] || 0) + 1;
      }
      return acc;
    }, {});

    const totalTripTimeSeconds = Object.entries(routeCounts).reduce(
      (sum, [routeId, count]) => {
        const numericRouteId = Number(routeId);
        const secondsCoefficient = multipliersMap[numericRouteId];
        if (secondsCoefficient === undefined) {
          return sum;
        }
        const numericCount = Number(count);
        return sum + numericCount * secondsCoefficient;
      },
      0,
    );

    const {
      totalTripDistance,
      totalOverSpeeding,
      totalSuddenAcceleration,
      totalSuddenBraking,
    } = data.body.hits.hits.reduce(
      (
        acc: {
          totalTripDistance: number;
          totalOverSpeeding: number;
          totalSuddenAcceleration: number;
          totalSuddenBraking: number;
        },
        hit: any,
      ) => {
        acc.totalTripDistance += hit._source.data.distance || 0;
        acc.totalOverSpeeding += hit._source.data.speeding || 0;
        acc.totalSuddenAcceleration += hit._source.data.sudden_accel || 0;
        acc.totalSuddenBraking += hit._source.data.sudden_break || 0;
        return acc;
      },
      {
        totalTripDistance: 0,
        totalOverSpeeding: 0,
        totalSuddenAcceleration: 0,
        totalSuddenBraking: 0,
      },
    );

    return {
      totalTripTimeSeconds: totalTripTimeSeconds,
      totalTripDistance: totalTripDistance,
      totalOverSpeeding: totalOverSpeeding,
      totalSuddenAcceleration: totalSuddenAcceleration,
      totalSuddenBraking: totalSuddenBraking,
    };
  }

  private async getOperationMetricsFromDb(
    routeIds: any,
    schema: string,
    date: string,
  ) {
    const query = `
    SELECT
      ws.route_id AS id,
      ws.dispatches,
      es.operation_metrics
    FROM
      "${schema}".dispatches ws
    INNER JOIN
      "${schema}".edge_serve es
    ON
      ws.vehicle_id = es.vehicle_id
    WHERE
      ws.route_id = ANY($1)
      AND ws.date = $2
  `;

    const results = await this.dataSource.query(query, [routeIds, date]);
    return results.map((row: any) => ({
      id: row.id,
      operation_metrics: row.operation_metrics,
    }));
  }

  async totalVehicleBySchema(schema: string) {
    const totalVehicleBySchema = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM "${schema}".vehicle`,
    );
    return totalVehicleBySchema[0].total;
  }

  async totalNumberBySchema(schema: string, tableName: string) {
    const totalNumberBySchema = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM "${schema}".${tableName}`,
    );
    return totalNumberBySchema[0].total;
  }

  async totalTrashBags(fields: string[], data: any) {
    const totals = fields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {});

    data.body.hits.hits.forEach((row) => {
      fields.forEach((field) => {
        if (
          row._source.data[field] &&
          row._source.data[field][0] !== undefined
        ) {
          totals[field] += row._source.data[field][0];
        }
      });
    });

    return totals;
  }

  async totalCollectedWeight(fields: string[], data: any) {
    const totals = fields.reduce((acc, field) => ({ ...acc, [field]: 0 }), {});

    data.body.hits.hits.forEach((row) => {
      fields.forEach((field) => {
        if (
          row._source.data[field] &&
          row._source.data[field][2] !== undefined
        ) {
          totals[field] += row._source.data[field][2];
        }
      });
    });

    return totals;
  }

  async saveDataCalculateTotalForDay() {
    const listSchema = await this.listSchemaByTenant();
    const date = formatDate(new Date());

    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();

      try {
        const data = await this.calculateTotalForDay(date, date, schema);
        const indexName = schema + '.dashboard_for_day';
        await this.singleDataIngestionDashboard({ indexName, data });
        console.log(
          `Data for customer ${customerId} has been successfully saved to dashboard.`,
        );
      } catch (error) {
        const errorMessage =
          error && error.message
            ? error.message
            : JSON.stringify(error) || 'Unknown error';
        console.error(
          `Error saving data for customer ${schema} to dashboard:`,
          errorMessage,
        );
      }
    }
  }

  // async saveDataCalculateTotalForDay2(timestamp: string) {
  //   const listSchema = await this.listSchemaByTenant();
  //   // const date = formatDate(new Date());
  //   for (const schemaObj of listSchema) {
  //     const customerId = schemaObj.schema.toUpperCase();
  //     const schema = customerId.toLowerCase();
  //     const data = await this.calculateTotalForDay2(schema, timestamp);
  //     try {
  //       const indexName = schema + '.dashboard_for_day';
  //       await this.singleDataIngestionDashboard({ indexName, data });
  //       console.log(
  //         `Data for customer ${customerId} has been successfully saved to dashboard.`,
  //       );
  //     } catch (error) {
  //       console.error(
  //         `Error saving data for customer ${customerId} to dashboard:`,
  //         error,
  //       );
  //     }
  //   }
  // }

  async dashboard(query: SearchAndFilterListDto, customerId: string) {
    const schema = customerId.toLowerCase();

    const { date, startDate, endDate, prevStartDate, prevEndDate } =
      await this.getDate(query);

    const [dataNow, rawDataNow1, dataOld] = await Promise.all([
      date === endDate
        ? this.calculateTotalForDay(date, date, schema)
        : { data: '' },
      this.getDataByDate(startDate, endDate, schema),
      this.getDataByDate(prevStartDate, prevEndDate, schema),
    ]);

    let mergedDataNow = [];
    if (dataNow.data !== '') {
      mergedDataNow = [
        {
          _source: {
            customer_id: schema,
            data: dataNow.data,
          },
        },
        ...(Array.isArray(rawDataNow1) ? rawDataNow1 : []).map((item) => ({
          _index: item._index,
          _id: item._id,
          _score: item._score,
          _source: item._source,
          sort: item.sort,
        })),
      ];
    } else {
      mergedDataNow = (Array.isArray(rawDataNow1) ? rawDataNow1 : []).map(
        (item) => ({
          _index: item._index,
          _id: item._id,
          _score: item._score,
          _source: item._source,
          sort: item.sort,
        }),
      );
    }

    const filterUniqueByTimestamp = (data) => {
      const uniqueMap = new Map();

      data.forEach((item) => {
        const timestamp = item._source?.data?.timestamp;
        if (!timestamp) return;

        const dateKey = new Date(timestamp).toISOString().split('T')[0];
        if (
          !uniqueMap.has(dateKey) ||
          new Date(timestamp) >
            new Date(uniqueMap.get(dateKey)._source.data.timestamp)
        ) {
          uniqueMap.set(dateKey, item);
        }
      });

      return Array.from(uniqueMap.values());
    };

    mergedDataNow = filterUniqueByTimestamp(mergedDataNow);

    const [calculateDataNow, calculateDataOld] = await Promise.all([
      this.calculateDashboard(mergedDataNow),
      this.calculateDashboard(Array.isArray(dataOld) ? dataOld : []),
    ]);

    const totalToday = await this.calculateTotalForDay(date, date, schema);

    return {
      dataNow: calculateDataNow,
      dataOld: calculateDataOld,
      numberOfRouterNow: totalToday?.data?.total_router_by_schema || 0,
      totalActiveVehicleNow: totalToday?.data?.total_active_vehicle || 0,
      numberOfRegisterVehicleNow:
        totalToday?.data?.total_vehicle_by_schema || 0,
      numberOfStaffNow: totalToday?.data?.total_staff_by_schema || 0,
      last_updated: new Date().toISOString(),
    };
  }

  async getDataByDate(startDate: string, endDate: string, schema: string) {
    const rangeQuery = this.createRangeQueryDataSet(
      startDate,
      endDate,
      'data.timestamp',
    );

    const dashboardForDays = await this.getDataIndexMetrics(
      rangeQuery,
      schema,
      schema + '.dashboard_for_day',
    );

    return dashboardForDays.body.hits.hits;
  }

  async calculateDashboardNow(data: any) {
    const [
      vehicleOperatingRate,
      ecoOperationScore,
      operatingTime,
      drivingDistance,
      collectionAmount,
      collectionWeight,
      collectionTime,
      collectionDistance,
      speeding,
      idling,
      suddenAcceleration,
      suddenBraking,
    ] = await Promise.all([
      this.vehicleOperatingRate(data),
      this.ecoOperationScore(data),
      this.calculateAverageAndTotal(
        data.total_operating_all_active_vehicle,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_driving_distance_all_active_vehicle,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_amount_collected_trash_bags,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_collected_weight_active_vehicles,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_collected_time_all_active_vehicle,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_collected_distance_all_active_vehicle,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_overspeeding_time_all_active_vehicle,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_idling_time_all_active_vehicle,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_sudden_acceleration_times_all_active_vehicle,
        data.total_active_vehicle,
      ),
      this.calculateAverageAndTotal(
        data.total_sudden_braking_times_all_active_vehicle,
        data.total_active_vehicle,
      ),
    ]);

    return {
      numberOfRouter: data.total_router_by_schema,
      totalActiveVehicle: data.total_active_vehicle,
      numberOfRegisterVehicle: data.total_vehicle_by_schema,
      numberOfStaff: data.total_staff_by_schema,
      vehicleOperatingRate: vehicleOperatingRate,
      ecoOperationScore: ecoOperationScore,
      operatingTime: operatingTime,
      drivingDistance: drivingDistance,
      collectionAmount: collectionAmount,
      collectionWeight: collectionWeight,
      collectionTime: collectionTime,
      collectionDistance: collectionDistance,
      speeding: speeding,
      idling: idling,
      suddenAcceleration: suddenAcceleration,
      suddenBraking: suddenBraking,
      last_updated: new Date().toISOString(),
    };
  }

  async vehicleOperatingRate(data: any) {
    return data.total_vehicle_by_schema > 0
      ? (data.total_active_vehicle * 100) / data.total_vehicle_by_schema
      : 0;
  }

  async ecoOperationScore(data: any) {
    return data.total_active_vehicle > 0
      ? data.total_eco_score_active_vehicle / data.total_active_vehicle
      : 0;
  }

  async calculateAverageAndTotal(total: number, activeVehicles: number) {
    const average = activeVehicles > 0 ? total / activeVehicles : 0;
    return { average, total };
  }

  async calculateDashboard(data: any) {
    const vehicleOperatingRate = 0;
    let totalNumberOfRouter = 0;
    let totalNumberOfStaff = 0;
    let totalEcoScore = 0;
    let totalOperatingTime = 0;
    let totalDrivingDistance = 0;
    let totalCollectionAmount = 0;
    let totalCollectionWeight = 0;
    let totalCollectionTime = 0;
    let totalCollectionDistance = 0;
    let totalSpeeding = 0;
    let totalIdling = 0;
    let totalSuddenAcceleration = 0;
    let totalSuddenBraking = 0;

    let totalActiveVehicles = 0;
    let totalVehicleBySchema = 0;

    data.forEach((record: any) => {
      const {
        total_active_vehicle,
        total_router_by_schema,
        total_vehicle_by_schema,
        total_staff_by_schema,
        total_eco_score_active_vehicle,
        total_operating_all_active_vehicle,
        total_driving_distance_all_active_vehicle,
        total_amount_collected_trash_bags,
        total_collected_weight_active_vehicles,
        total_collected_time_all_active_vehicle,
        total_collected_distance_all_active_vehicle,
        total_overspeeding_time_all_active_vehicle,
        total_idling_time_all_active_vehicle,
        total_sudden_acceleration_times_all_active_vehicle,
        total_sudden_braking_times_all_active_vehicle,
      } = record._source.data;

      totalNumberOfRouter += total_router_by_schema;
      totalNumberOfStaff += total_staff_by_schema;

      totalActiveVehicles += total_active_vehicle;
      totalVehicleBySchema += total_vehicle_by_schema;
      totalEcoScore += total_eco_score_active_vehicle;

      totalOperatingTime += total_operating_all_active_vehicle;
      totalDrivingDistance += total_driving_distance_all_active_vehicle;
      totalCollectionAmount += total_amount_collected_trash_bags;
      totalCollectionWeight += total_collected_weight_active_vehicles;
      totalCollectionTime += total_collected_time_all_active_vehicle;
      totalCollectionDistance += total_collected_distance_all_active_vehicle;
      totalSpeeding += total_overspeeding_time_all_active_vehicle;
      totalIdling += total_idling_time_all_active_vehicle;
      totalSuddenAcceleration +=
        total_sudden_acceleration_times_all_active_vehicle;
      totalSuddenBraking += total_sudden_braking_times_all_active_vehicle;
    });

    const vehicleOperatingRateResult = await this.vehicleOperatingRate({
      total_active_vehicle: totalActiveVehicles,
      total_vehicle_by_schema: totalVehicleBySchema,
    });

    const ecoOperationScoreResult = await this.ecoOperationScore({
      total_active_vehicle: totalActiveVehicles,
      total_eco_score_active_vehicle: totalEcoScore,
    });

    return {
      numberOfRouter: totalNumberOfRouter,
      totalActiveVehicle: totalActiveVehicles,
      numberOfRegisterVehicle: totalVehicleBySchema,
      numberOfStaff: totalNumberOfStaff,

      vehicleOperatingRate: {
        average: vehicleOperatingRateResult,
        total: vehicleOperatingRateResult,
      },

      ecoOperationScore: {
        average: ecoOperationScoreResult,
        total: ecoOperationScoreResult,
      },
      operatingTime: await this.calculateAverageAndTotal(
        totalOperatingTime,
        totalActiveVehicles,
      ),
      drivingDistance: await this.calculateAverageAndTotal(
        totalDrivingDistance,
        totalActiveVehicles,
      ),
      collectionAmount: await this.calculateAverageAndTotal(
        totalCollectionAmount,
        totalActiveVehicles,
      ),

      collectionWeight: await this.calculateAverageAndTotal(
        totalCollectionWeight,
        totalActiveVehicles,
      ),

      collectionTime: await this.calculateAverageAndTotal(
        totalCollectionTime,
        totalActiveVehicles,
      ),
      collectionDistance: await this.calculateAverageAndTotal(
        totalCollectionDistance,
        totalActiveVehicles,
      ),
      speeding: await this.calculateAverageAndTotal(
        totalSpeeding,
        totalActiveVehicles,
      ),
      idling: await this.calculateAverageAndTotal(
        totalIdling,
        totalActiveVehicles,
      ),
      suddenAcceleration: await this.calculateAverageAndTotal(
        totalSuddenAcceleration,
        totalActiveVehicles,
      ),
      suddenBraking: await this.calculateAverageAndTotal(
        totalSuddenBraking,
        totalActiveVehicles,
      ),
    };
  }

  async singleDataIngestionDashboard(input: DataSet): Promise<any> {
    this.logger.log(
      `Inside singleUpload() Method | Ingesting single data with index ${input.indexName} `,
    );

    try {
      const res = await this.openSearchClient.index({
        index: input.indexName,
        body: input.data,
      });
      this.logger.log('Data indexed successfully');
      return res.body;
    } catch (err) {
      this.logger.error(`Exception occurred : ${err})`);
      return {
        httpCode: 500,
        error: err,
      };
    }
  }

  async getDate(query: any) {
    const sDate = new Date(query.startDate);
    const eDate = new Date(query.endDate);
    const sDatePrev = new Date(query.startDatePrev);
    const eDatePrev = new Date(query.endDatePrev);

    if (sDate > eDate) {
      throw new Error('Start date cannot be greater than end date.');
    }

    if (sDatePrev > eDate || eDatePrev > eDate) {
      throw new Error('Previous dates cannot be greater than the end date.');
    }

    if (sDatePrev > eDatePrev) {
      throw new Error('startDatePrev cannot be greater than endDatePrev.');
    }

    // const diffDays =
    //   (eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24);
    // const pStartDate = new Date(sDate);
    // const pEndDate = new Date(eDate);
    // pStartDate.setDate(pStartDate.getDate() - diffDays - 1);
    // pEndDate.setDate(pEndDate.getDate() - diffDays - 1);
    // const prevStartDate = formatDate(pStartDate);
    // const prevEndDate = formatDate(pEndDate);

    const today = new Date();
    const date = formatDate(today);
    const startDate = formatDate(sDate);
    const endDate = formatDate(eDate);
    const prevStartDate = formatDate(sDatePrev);
    const prevEndDate = formatDate(eDatePrev);

    return { date, startDate, endDate, prevStartDate, prevEndDate };
  }

  async listSchemaByTenant() {
    return await this.dataSource.query(
      `select schema from public.tenant t where t.deleted_at is null and t.approved_time is not null`,
    );
  }

  async approvedIndexName(schema: string): Promise<any> {
    const listIndex = IndexName;
    const results = [];

    for (const indexName in listIndex) {
      if (isNaN(Number(indexName))) {
        const fullIndexName = `${schema}.${listIndex[indexName]}`;
        this.logger.log(`Creating index ${fullIndexName}`);

        try {
          let res;
          if (listIndex[indexName] === 'drive_metrics') {
            res = await this.openSearchClient.indices.create({
              index: fullIndexName,
              body: {
                mappings: {
                  properties: {
                    customer_id: {
                      type: 'text',
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                      },
                    },
                    total_trip_distance: {
                      type: 'float',
                    },
                    duration: {
                      type: 'text',
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                      },
                    },
                    collect_amount: {
                      type: 'long',
                    },
                    weight: {
                      type: 'float',
                    },
                    duration_seconds: {
                      type: 'long',
                    },
                    location_string: {
                      type: 'text',
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                      },
                    },
                    data: {
                      properties: {
                        angle: {
                          type: 'long',
                        },
                        drive_mode: {
                          type: 'long',
                        },
                        eco_score: {
                          type: 'long',
                        },
                        location: {
                          type: 'float',
                        },
                        route_name: {
                          type: 'text',
                          fields: {
                            keyword: {
                              type: 'keyword',
                              ignore_above: 256,
                            },
                          },
                        },
                        section_name: {
                          type: 'text',
                          fields: {
                            keyword: {
                              type: 'keyword',
                              ignore_above: 256,
                            },
                          },
                        },
                        speeding: {
                          type: 'long',
                        },
                        sudden_accel: {
                          type: 'long',
                        },
                        sudden_break: {
                          type: 'long',
                        },
                        timestamp: {
                          type: 'date',
                        },
                        distance: {
                          type: 'float',
                        },
                        trip_time: {
                          type: 'text',
                          fields: {
                            keyword: {
                              type: 'keyword',
                              ignore_above: 256,
                            },
                          },
                        },
                        vehicle_id: {
                          type: 'text',
                          fields: {
                            keyword: {
                              type: 'keyword',
                              ignore_above: 256,
                            },
                          },
                        },
                        segment_id: {
                          type: 'long',
                        },
                        section_id: {
                          type: 'long',
                        },
                        route_id: {
                          type: 'long',
                        },
                      },
                    },
                    topic: {
                      type: 'text',
                      fields: {
                        keyword: {
                          type: 'keyword',
                          ignore_above: 256,
                        },
                      },
                    },
                  },
                },
              },
            });
          } else {
            res = await this.openSearchClient.indices.create({
              index: fullIndexName,
              body: {
                mappings: {
                  properties: {
                    data: {
                      properties: {
                        timestamp: { type: 'date' },
                      },
                    },
                  },
                },
              },
            });
          }
          this.logger.log(`Index ${fullIndexName} created successfully`);
          results.push({
            indexName: fullIndexName,
            result: res.body,
          });
        } catch (err) {
          this.logger.error(
            `Exception occurred while creating index ${fullIndexName}: ${err}`,
          );
          results.push({
            indexName: fullIndexName,
            error: err,
          });
        }
      }
    }

    return results;
  }
}
