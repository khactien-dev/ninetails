import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq.service';
import { FakeMetricOpensearch } from './fake-metric.opensearch';
import {
  BaseData,
  CreateDriveMetricData,
  CreateDriveMetricData5,
  CreateEdgeStateData,
} from './fake-metric.dto';
import * as moment from 'moment';

@Injectable()
export class FakeMetricService {
  constructor(
    private readonly rabbitmq: RabbitmqService,
    private readonly opensearch: FakeMetricOpensearch,
  ) {}

  async create(input: BaseData) {
    try {
      if (input.topic == 'illegal_discharges') {
        const data = await this.rabbitmq.producer(input);
        return data;
      }
      if (input.topic == 'drive_metrics') {
        const data = await this.rabbitmq.producer(input);
        return data;
      }
      const index = `${input.customer_id}.${input.topic}`;
      const res = await this.opensearch.index(index, input);
      return res;
    } catch (error) {
      throw new BadRequestException('Something went wrong. Please try again!');
    }
  }

  async createDrive(input: CreateDriveMetricData) {
    if (input.data.drive_mode === 5) return;
    const data = await this.rabbitmq.producerDrive(input.data, {
      customer_id: input.customer_id,
      topic: 'drive_metrics',
    });
    return data;
  }

  async createDriveMode5(input: CreateDriveMetricData5) {
    // const index = `${input.customer_id}.collect_metrics`;
    input.collect.drive_mode = input.data.drive_mode = 5;
    input.collect.route_id = input.data.route_id;
    input.collect.timestamp = input.data.timestamp;
    // const body = {
    //   customer_id: input.customer_id,
    //   topic: 'collect_metrics',
    //   data: input.collect,
    // };
    // await this.opensearch.index(index, body);
    await this.rabbitmq.producerDrive(input.collect, {
      customer_id: input.customer_id,
      topic: 'collect_metrics',
    });
    await new Promise(resolve => setTimeout(resolve, 250));
    const data = await this.rabbitmq.producerDrive(input.data, {
      customer_id: input.customer_id,
      topic: 'drive_metrics',
    });
    return data;
  }

  async createEdgeState(input: CreateEdgeStateData) {
    const data = await this.rabbitmq.producerDrive(input.data, {
      customer_id: input.customer_id,
      topic: 'edge_state_metrics',
    });
    return data;
  }
}
