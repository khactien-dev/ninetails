import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CollectMetricOpensearch } from './collect_metric.opensearch';
import { RabbitmqService } from '../rabbitmq.service';
import { CollectMetricSearchInput } from './collect_metric.dto';
const { addDays, isBefore } = require('date-fns');

@Injectable()
export class CollectMetricService {
  constructor(
    private readonly collectMetric: CollectMetricOpensearch,
    private readonly rabbitmq: RabbitmqService,
  ) {}

  async search(input: CollectMetricSearchInput) {
    if (!(await this.collectMetric.exists())) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }

    let items = [];
    let date = input.start_date;
    do {
      const condition = { ...input };
      condition.start_date = date;
      condition.end_date = addDays(date, 1);
      const response = await this.collectMetric.search(condition);
      const data = response.body.hits.hits.map((x) => x._source);
      const aggregations = response.body.aggregations;
      let total = 0;
      aggregations.total_5L_gen = aggregations.total_5L_gen.value;
      aggregations.total_10L_reu = aggregations.total_10L_reu.value;
      aggregations.total_10L_gen = aggregations.total_10L_gen.value;
      aggregations.total_20L_gen = aggregations.total_20L_gen.value;
      aggregations.total_20L_reu = aggregations.total_20L_reu.value;
      aggregations.total_30L_gen = aggregations.total_30L_gen.value;
      aggregations.total_50L_gen = aggregations.total_50L_gen.value;
      aggregations.total_50L_pub = aggregations.total_50L_pub.value;
      aggregations.total_75L_gen = aggregations.total_75L_gen.value;
      aggregations.total_75L_pub = aggregations.total_75L_pub.value;
      aggregations.total_etc = aggregations.total_etc.value;
      aggregations.total_ext = aggregations.total_ext.value;
      total += aggregations.total_5L_gen;
      total += aggregations.total_10L_reu;
      total += aggregations.total_10L_gen;
      total += aggregations.total_20L_gen;
      total += aggregations.total_20L_reu;
      total += aggregations.total_30L_gen;
      total += aggregations.total_50L_gen;
      total += aggregations.total_50L_pub;
      total += aggregations.total_75L_gen;
      total += aggregations.total_75L_pub;
      total += aggregations.total_etc;
      total += aggregations.total_ext;

      const result = {
        date,
        aggregations,
        total,
        data,
      };
      items.push(result);
      date = addDays(date, 1);
    } while (isBefore(date, input.end_date));

    const response = await this.collectMetric.search(input);
    const data = response.body.hits.hits.map((x) => x._source);
    const aggregations = response.body.aggregations;
    let total = 0;
    aggregations.total_5L_gen = aggregations.total_5L_gen.value;
    aggregations.total_10L_reu = aggregations.total_10L_reu.value;
    aggregations.total_10L_gen = aggregations.total_10L_gen.value;
    aggregations.total_20L_gen = aggregations.total_20L_gen.value;
    aggregations.total_20L_reu = aggregations.total_20L_reu.value;
    aggregations.total_30L_gen = aggregations.total_30L_gen.value;
    aggregations.total_50L_gen = aggregations.total_50L_gen.value;
    aggregations.total_50L_pub = aggregations.total_50L_pub.value;
    aggregations.total_75L_gen = aggregations.total_75L_gen.value;
    aggregations.total_75L_pub = aggregations.total_75L_pub.value;
    aggregations.total_etc = aggregations.total_etc.value;
    aggregations.total_ext = aggregations.total_ext.value;
    total += aggregations.total_5L_gen;
    total += aggregations.total_10L_reu;
    total += aggregations.total_10L_gen;
    total += aggregations.total_20L_gen;
    total += aggregations.total_20L_reu;
    total += aggregations.total_30L_gen;
    total += aggregations.total_50L_gen;
    total += aggregations.total_50L_pub;
    total += aggregations.total_75L_gen;
    total += aggregations.total_75L_pub;
    total += aggregations.total_etc;
    total += aggregations.total_ext;
    const all = {
      aggregations,
      total,
    };

    return { all, items };
  }
}
