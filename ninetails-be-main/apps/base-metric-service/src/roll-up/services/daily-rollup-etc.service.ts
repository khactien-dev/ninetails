import { Injectable, Logger } from '@nestjs/common';
import { OpensearchService } from '../../opensearch/opensearch.service';
import { DataSource } from 'typeorm';

@Injectable()
export class DailyRollupETCService {
  private readonly logger = new Logger(DailyRollupETCService.name);
  constructor(
    private readonly opensearchService: OpensearchService,
    private readonly dataSource: DataSource
  ) {}

  async createIndex() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase()
      const schema = customerId.toLowerCase();
      const indexName = `${schema}.daily_etc_metrics`;
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
            distance: {
              type: 'integer',
            },
            duration: {
              type: 'integer',
            },
            drive_mode: {
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

      // Fetch data from drive_metrics
      const driveMetricsIndex = `${schema}.drive_metrics`;
      const driveMetricsQuery = {
        size: 10000,
        query: {
          term: {
            "data.drive_mode": 5
          }
        }
      };

      let driveMetricsData;
      try {
        driveMetricsData = await this.opensearchService.search(driveMetricsIndex, driveMetricsQuery);
      } catch (error) {
        this.logger.error('Error fetching drive metrics data', error);
        continue;
      }
      
      // Aggregate data
      const aggregatedData = driveMetricsData.map(driveMetric => {
        const baseTimestamp = new Date(driveMetric._source.timestamp).setHours(0, 0, 0, 0);
        const duration = new Date(driveMetric._source.timestamp).getTime() - baseTimestamp;

          return {
            date_time: driveMetric._source.data.timestamp,
            route_id: driveMetric._source.data.route_id,
            section_id: driveMetric._source.data.section_id,
            segment_id: driveMetric._source.data.segment_id,
            locations: {
              type: 'point',
              coordinates: driveMetric._source.data.location
            },
            locations_point: driveMetric._source.data.location,
            distance: driveMetric._source.data.distance,
            duration,
            drive_mode: driveMetric._source.data.drive_mode, // Assuming duration is the timestamp for simplicity
            section_name: driveMetric._source.data.section_name
          };
      }).filter(data => data !== undefined);

      // Index aggregated data into daily_collect_metrics
      const indexName = `${schema}.daily_etc_metrics`;
      try { 
        await this.opensearchService.bulkDataIngestion({ indexName, data: aggregatedData });
      } catch (error) {
        this.logger.error(`Error indexing aggregated data to ${indexName}`, error);
      }
    }
  }

  async createRollupJob() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const jobId = `${schema}_daily_etc_metrics_rollup`;
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
        "source_index": `${schema}.daily_etc_metrics`,
        "target_index": `${schema}.daily_etc_metrics_rollup`,
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
      const rollupIndex = `${schema}.daily_etc_metrics_rollup`;

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
                      total_distance: { sum: { field: 'distance' } },
                      total_duration: { sum: { field: 'duration' } }
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
            const totalDistance = segmentBucket.total_distance.value;
            const totalDuration = segmentBucket.total_duration.value;

            const query = `
              INSERT INTO daily_rollup_etc (routeId, sectionId, segmentId, distance, duration)
              VALUES ($1, $2, $3, $4, $5)
            `;
            const values = [routeId, sectionId, segmentId, totalDistance, totalDuration];

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
      const jobId = `${schema}_daily_etc_metrics_rollup`;
      await this.opensearchService.startJob(jobId)
    }
  }
}