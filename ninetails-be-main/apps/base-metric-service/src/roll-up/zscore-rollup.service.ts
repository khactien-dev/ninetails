import * as moment from 'moment';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OpensearchService } from '../opensearch/opensearch.service';
import { ZScoreService } from '../z-score/z-score.service';

@Injectable()
export class ZScoreRollupService {
  private isRunning = false;
  constructor(
    private readonly opensearchService: OpensearchService,
    private readonly zScoreService: ZScoreService,
  ) {}

  @Cron('59 59 23 * * *')
  async handleCronForAll() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
    for (const schemaObj of listSchema) {
      const customerId = schemaObj.schema.toUpperCase()
      const schema = customerId.toLowerCase();
      const currentDate = moment().format('YYYY-MM-DD');
      const data = await this.zScoreService.calculateZscoreRealtime(currentDate, schema);
      const total = await this.zScoreService.getTotalCollectAndOtherDistanceAndDuration(currentDate, schema);
      const EWM = await this.zScoreService.calculateEWMTotalDrivingRoute(currentDate, schema);
      const zscore = {
        latest: {
          distanceRatios: null,
          collectDistance: null,
          otherDistance: null,
          durationRatios: null,
          collectDuration: null,
          otherDuration: null,
          collectCount: null,
          manualCollectDistance: null,
          manualCollectTime: null,
        },
        total,
        EWM,
        ...data,
        rankScore: null,
        dispatch_no: null,
        segment_id: null,
        route_id: null,
        timestamp: currentDate
      }
      try {
        const indexName = schema + '.zscore_rollup';
        await this.opensearchService.singleDataIngestion1({ indexName, data: zscore });
        console.log('Data has been successfully saved to zscore_rollup.');
      } catch (error) {
        console.error('Error saving data to zscore_rollup:', error);
      }
    };
  }

  @Cron('59 59 23 * * *')
  async handleCronForOneVehicle() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
      for (const schemaObj of listSchema) {
        const customerId = schemaObj.schema.toUpperCase();
        const schema = customerId.toLowerCase();
        const currentDate = moment().format('YYYY-MM-DD');
        const allVehicleData = await this.zScoreService.getUniqueRouteIdAndSegmentIdWithOnlyDateDate(currentDate, schema);
        let otherVehicleMetrics = await Promise.all(
          allVehicleData.map(async (vehicleData) => {
            return this.zScoreService.calculateZscoreRealtimeOne(
              vehicleData.segment_id,
              vehicleData.route_id,
              currentDate,
              schema
            );
          }),
        );
      
      try {
        const indexName = schema + '.zscore_rollup';
        if (Array.isArray(otherVehicleMetrics)) {
          await this.opensearchService.bulkDataIngestion({
            indexName,
            data: otherVehicleMetrics,
          });
        }
          console.log('Data has been successfully saved to zscore_rollup.');
        } catch (error) {
          console.error('Error saving data to zscore_rollup:', error);
        }
      }
  }

  @Cron('59 59 23 * * *')
  async dailyRollupCoreData() {
    const listSchema = await this.opensearchService.listSchemaByTenant();
      for (const schemaObj of listSchema) {
        const customerId = schemaObj.schema.toUpperCase();
        console.log(`🚀 ~ ZScoreRollupService ~ dailyRollupCoreData ~ customerId: ${':))'}`, customerId)
        const schema = customerId.toLowerCase();
        const currentDate = moment().format('YYYY-MM-DD');
        const allVehicleData = await this.zScoreService.getUniqueRouteIdAndSegmentIdWithOnlyDateDate(currentDate, schema);
        let otherVehicleMetrics = await Promise.all(
          allVehicleData.map(async (vehicleData) => {
            return this.zScoreService.calculateCoreDataToSave(
              vehicleData.segment_id,
              vehicleData.route_id,
              currentDate,
              schema
            );
          }),
        );
        
      
      try {
        const indexName = schema + '.zscore_coredata_rollup';
        if (Array.isArray(otherVehicleMetrics)) {
          await this.opensearchService.bulkDataIngestion({
            indexName,
            data: otherVehicleMetrics,
          });
        }
          console.log('Data has been successfully saved to zscore_coredata_rollup.');
        } catch (error) {
          console.error('Error saving data to zscore_coredata_rollup:', error);
        }
      }
  }

  @Cron('59 59 23 * * *')
  async dailyRollupExpandData() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const listSchema = await this.opensearchService.listSchemaByTenant();
      for (const schemaObj of listSchema) {
        const customerId = schemaObj.schema.toUpperCase();
        const schema = customerId.toLowerCase();
        const currentDate = moment().format('YYYY-MM-DD');
        const allVehicleData = await this.zScoreService.getUniqueRouteIdAndSegmentIdWithOnlyDateDate(currentDate, schema);
        
        const indexNameCollect = schema + '.zscore_expand_collect_rollup';
        const indexNameOther = schema + '.zscore_expand_other_rollup';
        let otherVehicleMetrics = await Promise.all(
          allVehicleData.map(async (vehicleData) => {
            return this.zScoreService.getAllDataExpand(
              vehicleData.segment_id,
              vehicleData.route_id,
              currentDate,
              schema
            );
          }),
        );
        
        try {
          if (Array.isArray(otherVehicleMetrics)) {
            await this.opensearchService.bulkDataIngestion({
              indexName: indexNameOther,
              data: otherVehicleMetrics,
            });
          }
          // Lưu từng dữ liệu collect
          for (const vehicleData of allVehicleData) {
            const collectGenerator = this.zScoreService.getExpandedCollectDistanceAndDurationToSave(
              vehicleData.segment_id,
              vehicleData.route_id,
              vehicleData.section_id,
              currentDate,
              schema
            );

            for await (const collectData of await collectGenerator) {
              await this.opensearchService.bulkDataIngestion({
                indexName: indexNameCollect,
                data: [collectData], // Gửi từng object một
              });
            }
          }

          console.log('Data has been successfully saved to zscore_coredata_rollup.');
        } catch (error) {
          console.error('Error saving data to zscore_coredata_rollup:', error);
        }
      }
    } catch (error) {
      console.error('Error in dailyRollupExpandData:', error);
    } finally {
      this.isRunning = false;
    }
  }

  @Cron('59 59 23 * * *')
  async dailyRollupCollectAmount() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      const listSchema = await this.opensearchService.listSchemaByTenant();
      
      for (const schemaObj of listSchema) {
        const customerId = schemaObj.schema.toUpperCase();
        const schema = customerId.toLowerCase();
        const currentDate = moment().format('YYYY-MM-DD');
        
        const allVehicleData = await this.zScoreService.getUniqueRouteIdAndSegmentIdWithOnlyDateDate(currentDate, schema);
        const indexName = schema + '.zscore_trash_bags_type_rollup';
        const indexNameCollectAmount = schema + '.zscore_collect_amount_rollup';
        let otherVehicleMetrics = await Promise.all(
          allVehicleData.map(async (vehicleData) => {
            return this.zScoreService.formatCollectAmount(
              vehicleData.segment_id,
              vehicleData.route_id,
              currentDate,
              schema
            );
          }),
        );
        
        let otherVehicleMetrics1 = await Promise.all(
          allVehicleData.map(async (vehicleData) => {
            return this.zScoreService.calculateEWM7DaysForCollectAmount(
              vehicleData.segment_id,
              vehicleData.route_id,
              currentDate,
              schema
            );
          }),
        );

        try {
          await this.opensearchService.bulkDataIngestion({
            indexName,
            data: otherVehicleMetrics.flat(),
          });

          await this.opensearchService.bulkDataIngestion({
            indexName: indexNameCollectAmount,
            data: otherVehicleMetrics1.flat(),
          });
          
          console.log('Data has been successfully saved to zscore_coredata_rollup.');
        } catch (error) {
          console.error('Error saving data to zscore_coredata_rollup:', error);
        }
      }
    } catch (error) {
      console.error('Error in dailyRollupCollectAmount:', error);
    } finally {
      this.isRunning = false;
    }
  }

  @Cron('59 59 23 * * *')
  async handleCronSaveDataDashboard() {
    try {
      await this.opensearchService.saveDataCalculateTotalForDay();
      console.log(
        'Data has been successfully saved to data calculate dashboard.',
      );
    } catch (error) {
      console.error('Error saving data to data calculate dashboard.:', error);
    }
  }
}
