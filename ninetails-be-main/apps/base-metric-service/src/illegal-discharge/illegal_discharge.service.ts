import { Injectable, OnModuleInit } from '@nestjs/common';
import { IllegalDischargeOpensearch } from './illegal_discharge.opensearch';
import { IllegalDischargeSearchInput } from './illegal_discharge.dto';
const { subWeeks, format, differenceInHours } = require('date-fns');
import { faker } from '@faker-js/faker';
import * as moment from 'moment';
import amqp from 'amqp-connection-manager';
import {
  CreateIllegalDischargeData,
  IllegalDischargeData,
} from '../fake-metric/fake-metric.dto';
import axios from 'axios';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { formatISO, set, subDays } from 'date-fns';

@Injectable()
export class IllegalDischargeService implements OnModuleInit {
  constructor(
    private readonly illegalDischarge: IllegalDischargeOpensearch,
    @InjectRepository(TenantEntity)
    private tenantEntity: Repository<TenantEntity>,
  ) {}
  async onModuleInit() {
    const RABBITMQ_USER = process.env.RABBITMQ_USER;
    const RABBITMQ_PASS = process.env.RABBITMQ_PASS;
    const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
    const connection = amqp.connect([
      `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}`,
    ]);

    const tenants = await this.tenantEntity
      .createQueryBuilder('tenant')
      .where({ schema: Not(IsNull()) })
      .getMany();

    const schemaNames = tenants.map((a) => a.schema);

    for (const schemaName of schemaNames) {
      const onMessage = (data) => {
        if (!data) return;
        this.processMessage(data);
        channelWrapper.ack(data);
      };
      const exchangeName = `${schemaName.toLowerCase()}.exchange`;
      const nameQueue = `${schemaName.toLowerCase()}.illegal_discharges.que`;
      const routeKey = `illegal_discharges.key`;

      const channelWrapper = connection.createChannel({
        json: true,
        setup: async function (channel) {
          channel.assertExchange(exchangeName, 'direct', { durable: true });
          channel.assertQueue(nameQueue, { durable: true });
          await channel.bindQueue(nameQueue, exchangeName, routeKey);
          await channel.consume(nameQueue, onMessage);

          return channel;
        },
      });
      channelWrapper.waitForConnect();
    }
  }

  async processMessage(msg) {
    const input = JSON.parse(
      msg.content.toString(),
    ) as CreateIllegalDischargeData;
    const data = input.data as IllegalDischargeData;
    if (data.gps_x && data.gps_y) {
      const address = await this.searchAddress(data.gps_x, data.gps_y);
      data.address = address;
    }
    data.hour = null;
    if (data.collection && data.produce) {
      data.hour = differenceInHours(data.collection, data.produce);
    }

    input.data = data;
    await this.illegalDischarge.save(input);
  }

  async search(schema: string, input: IllegalDischargeSearchInput) {
    if (!(await this.illegalDischarge.exists(schema))) {
      return {
        items: [],
        aggregate_hour: {
          max: null,
          min: null,
          avg: null,
        },
        count: {
          all: {
            within_1_week: null,
            within_2_week: null,
            more_than_2_week: null,
            classifications: [
              {
                key: 1,
                count: null,
              },
              {
                key: 2,
                count: null,
              },
              {
                key: 3,
                count: null,
              },
              {
                key: 4,
                count: null,
              },
            ],
          },
          collection: {
            within_1_week: null,
            within_2_week: null,
            more_than_2_week: null,
            classifications: [
              {
                key: 1,
                count: null,
              },
              {
                key: 2,
                count: null,
              },
              {
                key: 3,
                count: null,
              },
              {
                key: 4,
                count: null,
              },
            ],
          },
          produce: {
            within_1_week: null,
            within_2_week: null,
            more_than_2_week: null,
            classifications: [
              {
                key: 1,
                count: null,
              },
              {
                key: 2,
                count: null,
              },
              {
                key: 3,
                count: null,
              },
              {
                key: 4,
                count: null,
              },
            ],
          },
        },
        last_updated: null,
      };
    }

    try {
      const startDate = set(Date.now(), { hours: 0, minutes: 0, seconds: 0 });
      const endDate = set(Date.now(), { hours: 23, minutes: 59, seconds: 59 });

      const inputOneWeek = {
        start_date: formatISO(subWeeks(startDate, 1)),
        end_date: formatISO(endDate),
      };
      const inputTwoWeek = {
        start_date: formatISO(subWeeks(startDate, 2)),
        end_date: formatISO(subDays(subWeeks(endDate, 1), 1)),
      };
      const inputMoreTwoWeek = {
        start_date: null,
        end_date: formatISO(subDays(subWeeks(endDate, 2), 1)),
      };
      const collectionWithin1Week = await this.illegalDischarge.countCollection(
        schema,
        input,
        inputOneWeek,
      );
      const collectionTwoWeek = await this.illegalDischarge.countCollection(
        schema,
        input,
        inputTwoWeek,
      );
      const collectionMoreTwoWeek = await this.illegalDischarge.countCollection(
        schema,
        input,
        inputMoreTwoWeek,
      );

      const produceWithin1Week = await this.illegalDischarge.countProduce(
        schema,
        input,
        inputOneWeek,
      );
      const produceTwoWeek = await this.illegalDischarge.countProduce(
        schema,
        input,
        inputTwoWeek,
      );
      const produceMoreTwoWeek = await this.illegalDischarge.countProduce(
        schema,
        input,
        inputMoreTwoWeek,
      );

      const search = await this.illegalDischarge.search(schema, input);
      let items = search.body.hits.hits.map(function (item) {
        return item._source.data;
      });
      items = items.map(function (item) {
        item.diff_week = moment(format(Date.now(), 'yyyy-MM-dd'))
          .diff(item.produce, 'weeks', true)
          .toFixed(2);
        item.diff_week = item.diff_week * 1;
        return item;
      });
      const lastUpdated = await this.illegalDischarge.lastUpdated(
        schema,
        input,
      );
      let countClassificationProduce =
        await this.illegalDischarge.countClassificationProduce(schema, input);
      let countClassificationCollection =
        await this.illegalDischarge.countClassificationCollection(
          schema,
          input,
        );
      countClassificationProduce =
        countClassificationProduce.body.aggregations.classification_count.buckets.map(
          function (item) {
            return {
              key: item.key,
              count: item.doc_count,
            };
          },
        );

      countClassificationCollection =
        countClassificationCollection.body.aggregations.classification_count.buckets.map(
          function (item) {
            return {
              key: item.key,
              count: item.doc_count,
            };
          },
        );

      const allWithin1Week =
        collectionWithin1Week.body.count + produceWithin1Week.body.count;

      const allWithin2Week =
        collectionTwoWeek.body.count + produceTwoWeek.body.count;

      const allMoreThan2Week =
        collectionMoreTwoWeek.body.count + produceMoreTwoWeek.body.count;

      countClassificationCollection = [
        {
          key: 1,
          count:
            countClassificationCollection.find((i) => i.key == 1)?.count ?? 0,
        },
        {
          key: 2,
          count:
            countClassificationCollection.find((i) => i.key == 2)?.count ?? 0,
        },
        {
          key: 3,
          count:
            countClassificationCollection.find((i) => i.key == 3)?.count ?? 0,
        },
        {
          key: 4,
          count:
            countClassificationCollection.find((i) => i.key == 4)?.count ?? 0,
        },
      ];

      countClassificationProduce = [
        {
          key: 1,
          count: countClassificationProduce.find((i) => i.key == 1)?.count ?? 0,
        },
        {
          key: 2,
          count: countClassificationProduce.find((i) => i.key == 2)?.count ?? 0,
        },
        {
          key: 3,
          count: countClassificationProduce.find((i) => i.key == 3)?.count ?? 0,
        },
        {
          key: 4,
          count: countClassificationProduce.find((i) => i.key == 4)?.count ?? 0,
        },
      ];

      const allClassifications = [
        {
          key: 1,
          count:
            countClassificationProduce[0].count +
            countClassificationCollection[0].count,
        },
        {
          key: 2,
          count:
            countClassificationProduce[1].count +
            countClassificationCollection[1].count,
        },
        {
          key: 3,
          count:
            countClassificationProduce[2].count +
            countClassificationCollection[2].count,
        },
        {
          key: 4,
          count:
            countClassificationProduce[3].count +
            countClassificationCollection[3].count,
        },
      ];

      const result = {
        items: items,
        aggregate_hour: {
          max: search.body.aggregations.max.value ?? 0,
          min: search.body.aggregations.min.value ?? 0,
          avg: search.body.aggregations.avg.value ?? 0,
        },
        count: {
          all: {
            within_1_week: allWithin1Week,
            within_2_week: allWithin2Week,
            more_than_2_week: allMoreThan2Week,
            classifications: allClassifications,
          },
          collection: {
            within_1_week: collectionWithin1Week.body.count,
            within_2_week: collectionTwoWeek.body.count,
            more_than_2_week: collectionMoreTwoWeek.body.count,
            classifications: countClassificationCollection,
          },
          produce: {
            within_1_week: produceWithin1Week.body.count,
            within_2_week: produceTwoWeek.body.count,
            more_than_2_week: produceMoreTwoWeek.body.count,
            classifications: countClassificationProduce,
          },
        },
        last_updated: lastUpdated,
      };
      return result;
    } catch (error) {
      throw error;
    }
  }

  async searchDummy() {
    const count = faker.number.int({ min: 7, max: 12 });
    let items = [];
    for (let index = 0; index < count; index++) {
      const item = {
        address: faker.location.streetAddress(),
        gps_y: faker.location.latitude({ max: 36.5, min: 36, precision: 5 }),
        gps_x: faker.location.longitude({ max: 132, min: 130, precision: 5 }),
        classification: faker.number.int({ min: 1, max: 4 }),
        collection: faker.datatype.boolean()
          ? faker.date.between({ from: '2024-09-01', to: Date.now() })
          : null,
        produce: faker.date.between({ from: '2024-09-01', to: Date.now() }),
        route_name: faker.helpers.arrayElement([
          '002-강남구',
          '003-강남구',
          '005-강남구',
          '009-강남구',
        ]),
        hour: faker.datatype.boolean()
          ? faker.number.float({ min: 5, max: 10, fractionDigits: 2 })
          : null,
      };
      items.push(item);
    }

    items = items.map(function (item) {
      item.diff_week = moment(format(Date.now(), 'yyyy-MM-dd'))
        .diff(item.produce, 'weeks', true)
        .toFixed(2);
      item.diff_week = item.diff_week * 1;
      return item;
    }, this);

    return {
      items: items,
      aggregate_hour: {
        max: faker.number.float({ min: 5, max: 10, fractionDigits: 2 }),
        min: faker.number.float({ min: 5, max: 10, fractionDigits: 2 }),
        avg: faker.number.float({ min: 5, max: 10, fractionDigits: 2 }),
      },
      count: {
        all: {
          within_1_week: faker.number.int({ min: 5, max: 100 }),
          within_2_week: faker.number.int({ min: 5, max: 100 }),
          more_than_2_week: faker.number.int({ min: 5, max: 100 }),
          classifications: [
            {
              key: 1,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 2,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 3,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 4,
              count: faker.number.int({ min: 5, max: 100 }),
            },
          ],
        },
        collection: {
          within_1_week: faker.number.int({ min: 5, max: 100 }),
          within_2_week: faker.number.int({ min: 5, max: 100 }),
          more_than_2_week: faker.number.int({ min: 5, max: 100 }),
          classifications: [
            {
              key: 1,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 2,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 3,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 4,
              count: faker.number.int({ min: 5, max: 100 }),
            },
          ],
        },
        produce: {
          within_1_week: faker.number.int({ min: 5, max: 100 }),
          within_2_week: faker.number.int({ min: 5, max: 100 }),
          more_than_2_week: faker.number.int({ min: 5, max: 100 }),
          classifications: [
            {
              key: 1,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 2,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 3,
              count: faker.number.int({ min: 5, max: 100 }),
            },
            {
              key: 4,
              count: faker.number.int({ min: 5, max: 100 }),
            },
          ],
        },
      },
      last_updated: faker.date.anytime(),
    };
  }
  async searchAddress(gps_x: number, gps_y: number) {
    const baseUrl =
      'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc';
    const coords = `${gps_x},${gps_y}`;
    const params = new URLSearchParams([
      ['request', 'coordsToaddr'],
      ['coords', coords],
      ['sourcecrs', 'epsg:4326'],
      ['output', 'json'],
      ['orders', 'legalcode,roadaddr'],
    ]);
    const url = new URL(`${baseUrl}?${params}`);
    const headers = {
      'X-NCP-APIGW-API-KEY-ID': 'qqdzmppwz8',
      'X-NCP-APIGW-API-KEY': 'GCCe7f0i351vrDKDm3cm2tMv2HGJRQOKDDPTvzeD',
    };
    try {
      const response = await axios.get(url.href, { headers });
      const results = response.data.results;
      const legalcode = results.find((e) => e.name == 'legalcode');
      const roadaddr = results.find((e) => e.name == 'roadaddr');
      const region = roadaddr ? roadaddr.region : legalcode.region;
      let areas = [
        region.area1.name,
        region.area2.name,
        region.area3.name,
        region.area4.name,
      ];
      areas = areas.filter((e) => e);
      return areas.join(', ');
    } catch (error) {}
    return null;
  }
}
