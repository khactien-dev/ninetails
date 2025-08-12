import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyRollupETCService } from './services/daily-rollup-etc.service';
import { DailyEcoscoreMetricsService } from './services/daily-ecoscore-metrics.service';
import { DailyCollectMetricsService } from './services/daily-collect-metrics.service';

@Injectable()
export class DailyRollupService {
  constructor(
    private readonly dailyRollUpETCService: DailyRollupETCService,
    private readonly dailyEcoscoreMetricsService: DailyEcoscoreMetricsService,
    private readonly dailyCollectMetricsService: DailyCollectMetricsService,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyRollUpETC() {
    await this.dailyRollUpETCService.createIndex();
    await this.dailyRollUpETCService.aggregateData();
    await this.dailyRollUpETCService.createRollupJob();
    await this.dailyRollUpETCService.startJob();
    await this.dailyRollUpETCService.queryRollupData();
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyRollUpEcoScore() {
    await this.dailyEcoscoreMetricsService.createIndex();
    await this.dailyEcoscoreMetricsService.aggregateData();
    await this.dailyEcoscoreMetricsService.createRollupJob();
    await this.dailyEcoscoreMetricsService.startJob();
    await this.dailyEcoscoreMetricsService.queryRollupData();
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    await this.dailyCollectMetricsService.createIndex();
    await this.dailyCollectMetricsService.aggregateData();
    await this.dailyCollectMetricsService.createRollupJob();
    await this.dailyCollectMetricsService.startJob();
    await this.dailyCollectMetricsService.queryRollupData();
  }
}
