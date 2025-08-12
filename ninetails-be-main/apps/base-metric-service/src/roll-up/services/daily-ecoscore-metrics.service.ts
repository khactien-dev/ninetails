import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { OpensearchService } from '../../opensearch/opensearch.service';
import { DataSource } from 'typeorm';

@Injectable()
export class DailyEcoscoreMetricsService {
  private readonly logger = new Logger(DailyEcoscoreMetricsService.name);

  constructor(
    private readonly opensearchService: OpensearchService,
    private dataSource: DataSource
  ) {}

  async createIndex() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase()
      const schema = customerId.toLowerCase();
      const indexName = `${schema}.daily_ecoscore_metrics`;

      const mappings = {
        mappings: {
          properties: {
            date_time: {
              type: 'date',
              format: 'yyyy-MM-dd HH:mm:ss||strict_date_optional_time||epoch_millis',
            },
            route_id: {
              type: 'integer',
            },
            section_id: {
              type: 'integer',
            },
            segment_id: {
              type: 'integer',
            },
            locations: {
              type: 'geo_shape',
            },
            eco_score: {
              type: 'integer',
            },
            duration: {
              type: 'integer',
            },
            distance: {
              type: 'integer',
            },
            speeding: {
              type: 'integer',
            },
            idling_stop: {
              type: 'integer',
            },
            sudden_accel: {
              type: 'integer',
            },
            sudden_break: {
              type: 'integer',
            },
            off_control: {
              type: 'integer',
            },
            end_operation: {
              type: 'integer',
            },
            section_name: {
              type: 'keyword',
              ignore_above: 64,
            },
          },
        },
      };
  
      await this.opensearchService.createIndex(indexName, mappings);
    }
  }

  async aggregateData() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const driveMetricsIndex = `${schema}.drive_metrics`;
      const dailyEcoscoreMetricsIndex = `${schema}.daily_ecoscore_metrics`;

      // Fetch unique route_id, segment_id, and section_id combinations
      const uniqueQuery = {
        size: 0,
        aggs: {
          unique_combinations: {
            composite: {
              size: 10000,
              sources: [
                { route_id: { terms: { field: 'route_id' } } },
                { segment_id: { terms: { field: 'segment_id' } } },
                { section_id: { terms: { field: 'section_id' } } }
              ]
            }
          }
        }
      };

      let uniqueResponse;
      try {
        uniqueResponse = await this.opensearchService.search(driveMetricsIndex, uniqueQuery);
      } catch (error) {
        this.logger.error('Error fetching unique combinations', error);
        continue;
      }

      const uniqueBuckets = uniqueResponse.aggregations.unique_combinations.buckets;

      for (const bucket of uniqueBuckets) {
        const { route_id, segment_id, section_id } = bucket.key;

        const query = {
          size: 0,
          query: {
            bool: {
              must: [
                { term: { route_id } },
                { term: { segment_id } },
                { term: { section_id } }
              ]
            }
          },
          aggs: {
            first_location: {
              top_hits: {
                size: 1,
                sort: [{ timestamp: { order: 'asc' } }],
                _source: { includes: ['location'] }
              }
            },
            last_location: {
              top_hits: {
                size: 1,
                sort: [{ timestamp: { order: 'desc' } }],
                _source: { includes: ['location'] }
              }
            },
            total_eco_score: { sum: { field: 'eco_score' } },
            total_duration: { sum: { field: 'timestamp' } },
            total_distance: { sum: { field: 'distance' } },
            total_speeding: { sum: { field: 'speeding' } },
            total_idling_stop: {
              filter: { term: { drive_mode: 6 } },
              aggs: { duration: { sum: { field: 'timestamp' } } }
            },
            total_sudden_accel: { sum: { field: 'sudden_accel' } },
            total_sudden_break: { sum: { field: 'sudden_break' } },
            total_off_control: {
              filter: { term: { drive_mode: 7 } },
              aggs: { duration: { sum: { field: 'timestamp' } } }
            },
            total_end_operation: {
              filter: { term: { drive_mode: 8 } },
              aggs: { duration: { sum: { field: 'timestamp' } } }
            }
          }
        };

        let response;
        try {
          response = await this.opensearchService.search(driveMetricsIndex, query);
        } catch (error) {
          this.logger.error('Error fetching drive metrics data', error);
          continue;
        }

        const firstLocation = response.aggregations.first_location.hits.hits[0]._source.location;
        const lastLocation = response.aggregations.last_location.hits.hits[0]._source.location;
        const totalEcoScore = response.aggregations.total_eco_score.value;
        const totalDuration = response.aggregations.total_duration.value;
        const totalDistance = response.aggregations.total_distance.value;
        const totalSpeeding = response.aggregations.total_speeding.value;
        const totalIdlingStop = response.aggregations.total_idling_stop.duration.value;
        const totalSuddenAccel = response.aggregations.total_sudden_accel.value;
        const totalSuddenBreak = response.aggregations.total_sudden_break.value;
        const totalOffControl = response.aggregations.total_off_control.duration.value;
        const totalEndOperation = response.aggregations.total_end_operation.duration.value;

        const aggregatedData = {
          date_time: new Date().toISOString(),
          route_id,
          section_id,
          segment_id,
          locations: {
            type: 'line',
            coordinates: [firstLocation, lastLocation]
          },
          eco_score: totalEcoScore,
          duration: totalDuration,
          distance: totalDistance,
          speeding: totalSpeeding,
          idling_stop: totalIdlingStop,
          sudden_accel: totalSuddenAccel,
          sudden_break: totalSuddenBreak,
          off_control: totalOffControl,
          end_operation: totalEndOperation
        };

        // Index aggregated data into daily_ecoscore_metrics
        try {
          await this.opensearchService.bulkDataIngestion({ indexName: dailyEcoscoreMetricsIndex, data: [aggregatedData]});
        } catch (error) {
          this.logger.error(`Error indexing aggregated data to ${dailyEcoscoreMetricsIndex}`, error);
        }
      }
    }
  }

  async createRollupJob() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const jobId = `${schema}_daily_ecoscore_metrics_rollup`;
      const rollup = {
        enabled: true,
        schedule: {
          interval: {
            period: 1,
            unit: "Minutes"
          }
        },
        "page_size": 1000,
        "delay": 0,
        "continuous": false,
        "description": "Daily rollup job for etc metrics",
        "source_index": `${schema}.daily_ecoscore_metrics`,
        "target_index": `${schema}.daily_ecoscore_metrics_rollup`,
        "dimensions": [
          {
            "date_histogram": {
              "source_field": "date_time",
              "fixed_interval": "60m",
              "timezone": "UTC"
            }
          },
          {
            "terms": {
              "source_field": "route_id"
            }
          },
          {
            "terms": {
              "source_field": "section_id"
            }
          },
          {
            "terms": {
              "source_field": "segment_id"
            }
          },
          {
            "terms": {
              "source_field": "locations_point",
              "target_field": "locations"
            }
          }
        ],
        "metrics": [
          {
            "source_field": "distance",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "duration",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "eco_score",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "speeding",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "idling_stop",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "sudden_accel",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "sudden_break",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "off_control",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "end_operation",
            "metrics": [
              {
                "sum": {}
              }
            ]
          }
        ],
      };

      try {
        await this.opensearchService.createRollupJob(jobId, rollup);
      } catch (error) {
        this.logger.error(`Error creating rollup job ${jobId}`, error);
      }
    }
  }

  async queryRollupData() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const rollupIndex = `${schema}.daily_ecoscore_metrics_rollup`;

      const query = {
        size: 0,
        aggs: {
          by_route: {
            terms: { field: 'route_id' },
            aggs: {
              by_section: {
                terms: { field: 'section_id' },
                aggs: {
                  by_segment: {
                    terms: { field: 'segment_id' },
                    aggs: {
                      total_eco_score: { sum: { field: 'eco_score' } },
                      total_duration: { sum: { field: 'duration' } },
                      total_distance: { sum: { field: 'distance' } },
                      total_speeding: { sum: { field: 'speeding' } },
                      total_idling_stop: { sum: { field: 'idling_stop' } },
                      total_sudden_accel: { sum: { field: 'sudden_accel' } },
                      total_sudden_break: { sum: { field: 'sudden_break' } },
                      total_off_control: { sum: { field: 'off_control' } },
                      total_end_operation: { sum: { field: 'end_operation' } }
                    }
                  }
                }
              }
            }
          }
        }
      };

      let response;
      try {
        response = await this.opensearchService.search(rollupIndex, query);
      } catch (error) {
        this.logger.error('Error querying rollup data', error);
        continue;
      }

      const buckets = response.aggregations.by_route.buckets;
      for (const routeBucket of buckets) {
        const routeId = routeBucket.key;
        for (const sectionBucket of routeBucket.by_section.buckets) {
          const sectionId = sectionBucket.key;
          for (const segmentBucket of sectionBucket.by_segment.buckets) {
            const segmentId = segmentBucket.key;
            const totalEcoScore = segmentBucket.total_eco_score.value;
            const totalDuration = segmentBucket.total_duration.value;
            const totalDistance = segmentBucket.total_distance.value;
            const totalSpeeding = segmentBucket.total_speeding.value;
            const totalIdlingStop = segmentBucket.total_idling_stop.value;
            const totalSuddenAccel = segmentBucket.total_sudden_accel.value;
            const totalSuddenBreak = segmentBucket.total_sudden_break.value;
            const totalOffControl = segmentBucket.total_off_control.value;
            const totalEndOperation = segmentBucket.total_end_operation.value;

            const query = `
              INSERT INTO daily_ecoscore_metrics (routeId, sectionId, segmentId, ecoScore, duration, distance, speeding, idlingStop, suddenAccel, suddenBreak, offControl, endOperation)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `;
            const values = [routeId, sectionId, segmentId, totalEcoScore, totalDuration, totalDistance, totalSpeeding, totalIdlingStop, totalSuddenAccel, totalSuddenBreak, totalOffControl, totalEndOperation];

            try {
              await this.dataSource.query(query, values);
              this.logger.log(`Saved data for Route ID: ${routeId}, Section ID: ${sectionId}, Segment ID: ${segmentId}`);
            } catch (error) {
              this.logger.error(`Error saving data for Route ID: ${routeId}, Section ID: ${sectionId}, Segment ID: ${segmentId}`, error);
            }
          }
        }
      }
    }
  }

  async startJob(){
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const jobId = `${schema}_daily_ecoscore_metrics_rollup`;
      await this.opensearchService.startJob(jobId)
    }
  }
}