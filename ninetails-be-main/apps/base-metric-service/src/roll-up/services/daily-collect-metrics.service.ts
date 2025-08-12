import { Injectable, Logger } from '@nestjs/common';
import { OpensearchService } from '../../opensearch/opensearch.service';
import { DataSource } from 'typeorm';
import { DailyCollectMetricsEntity } from '../../../../../libs/entities/daily-collect-metrics.entity';

@Injectable()
export class DailyCollectMetricsService {
  private readonly logger = new Logger(DailyCollectMetricsService.name);

  constructor(
    private readonly opensearchService: OpensearchService,
    private dataSource: DataSource
  ) {}

  async createIndex() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const indexName = `${schema}.daily_collect_metrics`;

      const mappings = {
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
          collect_count: {
            type: 'integer',
          },
          collect_volume: {
            type: 'integer',
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
      
      // Fetch data from collect_metrics
      const collectMetricsIndex = `${schema}.collect_metrics`;
      const collectMetricsQuery = {
        size: 10000,
        query: {
          match_all: {}
        }
      };

      let collectMetricsData;
      try {
        collectMetricsData = await this.opensearchService.search(collectMetricsIndex, collectMetricsQuery);
      } catch (error) {
        this.logger.error('Error fetching collect metrics data', error);
        continue;
      }
      
      // Aggregate data
      const aggregatedData = driveMetricsData.map(driveMetric => {
        const matchingCollectMetric = collectMetricsData.find(collectMetric => 
          collectMetric._source.data.route_id === driveMetric._source.data.route_id &&
          collectMetric._source.data.segment_id === driveMetric._source.data.segment_id
        );
        
        if (matchingCollectMetric) {
          const fields = ['5L_gen', '10L_gen', '10L_reu', '20L_gen', '20L_reu', '30L_gen', '50L_gen', '50L_pub', '75L_gen', '75L_pub', 'ext', 'etc'];
          let collect_count = 0;
          let collect_volume = 0;

          fields.forEach(field => {
            collect_count += matchingCollectMetric._source.data[field][1];
            collect_volume += matchingCollectMetric._source.data[field][0];
          });
          
          const baseTimestamp = new Date(driveMetric._source.data.timestamp).setHours(0, 0, 0, 0);
          const duration = new Date(driveMetric._source.data.timestamp).getTime() - baseTimestamp;

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
            duration, // Assuming duration is the timestamp for simplicity
            collect_count,
            collect_volume
          };
        }
      }).filter(data => data !== undefined);

      // Index aggregated data into daily_collect_metrics
      const indexName = `${schema}.daily_collect_metrics`;
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
      const jobId = `${schema}_daily_collect_metrics_rollup`;
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
        "description": "Daily rollup job for collect metrics",
        "source_index": `${schema}.daily_collect_metrics`,
        "target_index": `${schema}.daily_collect_metrics_rollup`,
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
            "source_field": "collect_count",
            "metrics": [
              {
                "sum": {}
              }
            ]
          },
          {
            "source_field": "collect_volume",
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

  async startJob(){
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const jobId = `${schema}_daily_collect_metrics_rollup`;
      await this.opensearchService.startJob(jobId)
    }
  }

  async queryRollupData() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase();
      const schema = customerId.toLowerCase();
      const rollupIndex = `${schema}.daily_collect_metrics_rollup`;

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
                      total_duration: { sum: { field: 'duration' } },
                      total_collect_count: { sum: { field: 'collect_count' } },
                      total_collect_volume: { sum: { field: 'collect_volume' } }
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
            const totalCollectCount = segmentBucket.total_collect_count.value;
            const totalCollectVolume = segmentBucket.total_collect_volume.value;
            const dailyCollectMetric = new DailyCollectMetricsEntity();
            dailyCollectMetric.routeId = routeId;
            dailyCollectMetric.sectionId = sectionId;
            dailyCollectMetric.segmentId = segmentId;
            dailyCollectMetric.distance = totalDistance;
            dailyCollectMetric.duration = totalDuration;
            dailyCollectMetric.collectCount = totalCollectCount;
            dailyCollectMetric.collectVolume = totalCollectVolume;
            const query = `
              INSERT INTO daily_collect_metrics (routeId, sectionId, segmentId, distance, duration, collectCount, collectVolume)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const values = [routeId, sectionId, segmentId, totalDistance, totalDuration, totalCollectCount, totalCollectVolume];
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
}