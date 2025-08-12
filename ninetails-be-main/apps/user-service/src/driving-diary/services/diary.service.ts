import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { IOpenSearchResult } from 'libs/common/constants/common.constant';
import * as moment from 'moment';
import { DiaryQueryDto } from '../dtos/diary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BackupEntity } from 'libs/entities/backup.entity';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { DrivingDiaryEntity } from 'libs/entities/driving-diary.entity';
import { ESORTDIARY } from 'libs/enums/common.enum';

@Injectable()
export class DiaryService {
  constructor(
    @Inject('OpenSearchClient') private readonly openSearch: Client,
    @InjectRepository(BackupEntity)
    private backupEntity: Repository<BackupEntity>,
    @Inject('DRIVING_DIARY_REPO')
    private drivingDiaryEntity: Repository<DrivingDiaryEntity>,
    private dataSource: DataSource,
  ) {}

  async getDataFix(criteria: DiaryQueryDto) {
    const { sortBy, sortField } = criteria;
    const backup = await this.backupEntity.findOne({
      where: {
        tenant_id: criteria.tenant_id,
        createdAt: MoreThanOrEqual(criteria.date),
      },
    });
    if (backup) {
      throw new BadRequestException(
        'Data from' +
          ` ${moment(backup.createdAt).subtract(1).format('YYYY-MM-DD')}` +
          ' and earlier is either unavailable or has been archived.' +
          'Please select a different time period.',
      );
    }
    const { schema, routeId, page, pageSize } = criteria;

    const startDay = moment(criteria.date)
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSS');
    const endDay = moment(criteria.date)
      .endOf('day')
      .format('YYYY-MM-DDTHH:mm:ss.SSS');

    if (
      moment(criteria.date).startOf('day').isBefore(moment().startOf('day'))
    ) {
      const [diaries, total] = await this.drivingDiaryEntity
        .createQueryBuilder('d')
        .where(
          `d.timestamp::timestamp between '${startDay}'::timestamp and '${endDay}'::timestamp 
          and d.route_id = ${routeId}`,
        )
        .take(pageSize)
        .skip((page - 1) * pageSize)
        .orderBy(
          [
            ESORTDIARY.DRIVE_MODE,
            ESORTDIARY.TIMESTAMP,
            ESORTDIARY.DURATION,
          ].includes(sortField as ESORTDIARY)
            ? sortField.split('.')[1]
            : sortField,
          sortBy,
        )
        .getManyAndCount();
      if (!total) {
        return {
          diaries: [],
          total: 0,
          total_trip_distance: 0,
          total_collect_amount: 0,
          total_weight: 0,
          totalDuration: 0,
        };
      }
      const totalCalculate = await this.dataSource.query(
        `select coalesce(sum(d.total_trip_distance), 0) as total_distance, 
          coalesce(sum(d.collect_amount), 0) as total_collect_amount,
          coalesce(sum(d.weight), 0) as total_weight from ${criteria.schema}.driving_diary d 
          where d.timestamp::timestamp between '${startDay}'::timestamp and '${endDay}'::timestamp 
          and d.route_id = ${routeId}`,
      );
      const last = await this.drivingDiaryEntity
        .createQueryBuilder('d')
        .where(
          `d.timestamp::timestamp between '${startDay}'::timestamp and '${endDay}'::timestamp 
          and d.route_id = ${routeId}`,
        )
        .orderBy('d.timestamp', 'DESC')
        .getOne();
      const totalDuration = moment(last.timestamp) as any;
      const formatTotalDuration = moment()
        .startOf('day')
        .milliseconds(totalDuration)
        .format('HH:mm:ss');
      return {
        diaries,
        total,
        total_trip_distance: totalCalculate[0].total_distance,
        total_collect_amount: +totalCalculate[0].total_collect_amount,
        total_weight: totalCalculate[0].total_weight,
        totalDuration: formatTotalDuration,
      };
    }
    const range = {
      'data.timestamp': {
        gte: startDay,
        lte: endDay,
        format: 'strict_date_optional_time',
      },
    };
    const queryBody = {
      bool: {
        filter: [
          {
            match_phrase: {
              'data.route_id': routeId,
            },
          },
          {
            match_phrase: {
              change_mode: true,
            },
          },
          { range },
        ],
      },
    };
    const timeFlag = moment(criteria.date).set({
      hour: 16,
      minute: 35,
      second: 0,
    });
    if (moment().isAfter(timeFlag)) {
      const checkEndOfDay: IOpenSearchResult = await this.openSearch.search({
        index: `${schema}.drive_metrics`,
        body: {
          query: {
            bool: {
              filter: [
                {
                  match_phrase: {
                    'data.route_id': routeId,
                  },
                },
                { range },
              ],
            },
          },
          sort: [{ 'data.timestamp': { order: 'desc' } }],
          size: 1,
        },
      });
      if (
        checkEndOfDay.body.hits.hits.length &&
        checkEndOfDay.body.hits.hits[0]._source.data.drive_mode !== 8
      ) {
        const data = checkEndOfDay.body.hits.hits[0]._source.data;
        let edgeTime = 10;
        const queryEdgeTime = await this.dataSource.query(
          `select operation_metrics from ${schema}.dispatches where route_id = ${routeId} 
          and date = '${criteria.date}'::timestamp`,
        );
        if (queryEdgeTime.length) edgeTime = queryEdgeTime[0].operation_metrics;
        if (
          moment(data.timestamp)
            .add(edgeTime * 10, 'seconds')
            .isBefore(moment())
        ) {
          const saveData = {
            timestamp: moment(data.timestamp)
              .add(10, 'seconds')
              .format('YYYY-MM-DDTHH:mm:ss.SSS'),
            drive_mode: 8,
            section_name: data.section_name,
            location: null,
            angle: 0,
            eco_score: 0,
            distance: 0,
            velocity: 0,
            speeding: 0,
            sudden_accel: 0,
            sudden_break: 0,
            segment_id: data.segment_id,
            route_id: data.route_id,
            section_id: data.section_id,
          };
          await this.openSearch.index({
            index: `${schema}.drive_metrics`,
            body: {
              customer_id: schema + '.exchange',
              topic: 'drive_metrics.key',
              data: saveData,
              change_mode: true,
            },
          });
          await this.drivingDiaryEntity.save(
            this.drivingDiaryEntity.create(saveData),
          );
        }
      }
    }
    const data: IOpenSearchResult = await this.openSearch.search({
      index: `${schema}.drive_metrics`,
      body: {
        query: queryBody,
        sort: [
          {
            [sortField]: {
              order: sortBy,
              missing: sortBy.toLowerCase() === 'asc' ? '_first' : '_last',
            },
          },
        ],
        size: pageSize,
        from: (page - 1) * pageSize,
        aggs: {
          total_trip_distance: {
            sum: {
              field: 'total_trip_distance',
            },
          },
        },
      },
    });
    if (!data.body.hits.hits.length) {
      return {
        diaries: [],
        total: 0,
        total_trip_distance: 0,
        total_collect_amount: 0,
        total_weight: 0,
        totalDuration: 0,
      };
    }
    const aggsCollect = {
      total_collect_amount: {
        sum: {
          script: {
            source: `def total = 0;
            if (
              params._source['data']['5L_gen'] instanceof List && 
              params._source['data']['5L_gen'] != null
            ) {
              total += params._source['data']['5L_gen'][0];
            }
            if (
              params._source['data']['10L_gen'] instanceof List && 
              params._source['data']['10L_gen'] != null
            ) {
              total += params._source['data']['10L_gen'][0];
            }
            if (
              params._source['data']['10L_reu'] instanceof List && 
              params._source['data']['10L_reu'] != null
            ) {
              total += params._source['data']['10L_reu'][0];
            }
            if (
              params._source['data']['20L_reu'] instanceof List && 
              params._source['data']['20L_reu'] != null
            ) {
              total += params._source['data']['20L_reu'][0];
            }
            if (
              params._source['data']['20L_gen'] instanceof List && 
              params._source['data']['20L_gen'] != null
            ) {
              total += params._source['data']['20L_gen'][0];
            }
            if (
              params._source['data']['30L_gen'] instanceof List && 
              params._source['data']['30L_gen'] != null
            ) {
              total += params._source['data']['30L_gen'][0];
            }
            if (
              params._source['data']['50L_gen'] instanceof List && 
              params._source['data']['50L_gen'] != null
            ) {
              total += params._source['data']['50L_gen'][0];
            }
            if (
              params._source['data']['50L_pub'] instanceof List && 
              params._source['data']['50L_pub'] != null
            ) {
              total += params._source['data']['50L_pub'][0];
            }
            if (
              params._source['data']['75L_gen'] instanceof List && 
              params._source['data']['75L_gen'] != null
            ) {
              total += params._source['data']['75L_gen'][0];
            }
            if (
              params._source['data']['75L_pub'] instanceof List && 
              params._source['data']['75L_pub'] != null
            ) {
              total += params._source['data']['75L_pub'][0];
            }
            if (
              params._source['data']['ext'] instanceof List && 
              params._source['data']['ext'] != null
            ) {
              total += params._source['data']['ext'][0];
            }
            if (
              params._source['data']['etc'] instanceof List && 
              params._source['data']['etc'] != null
            ) {
              total += params._source['data']['etc'][0];
            }
            return total;`,
            lang: 'painless',
          },
        },
      },
      total_weight: {
        sum: {
          script: {
            source: `def total = 0;
            if (
              params._source['data']['5L_gen'] instanceof List && 
              params._source['data']['5L_gen'] != null
            ) {
              total += params._source['data']['5L_gen'][2];
            }
            if (
              params._source['data']['10L_gen'] instanceof List && 
              params._source['data']['10L_gen'] != null
            ) {
              total += params._source['data']['10L_gen'][2];
            }
            if (
              params._source['data']['10L_reu'] instanceof List && 
              params._source['data']['10L_reu'] != null
            ) {
              total += params._source['data']['10L_reu'][2];
            }
            if (
              params._source['data']['20L_reu'] instanceof List && 
              params._source['data']['20L_reu'] != null
            ) {
              total += params._source['data']['20L_reu'][2];
            }
            if (
              params._source['data']['20L_gen'] instanceof List && 
              params._source['data']['20L_gen'] != null
            ) {
              total += params._source['data']['20L_gen'][2];
            }
            if (
              params._source['data']['30L_gen'] instanceof List && 
              params._source['data']['30L_gen'] != null
            ) {
              total += params._source['data']['30L_gen'][2];
            }
            if (
              params._source['data']['50L_gen'] instanceof List && 
              params._source['data']['50L_gen'] != null
            ) {
              total += params._source['data']['50L_gen'][2];
            }
            if (
              params._source['data']['50L_pub'] instanceof List && 
              params._source['data']['50L_pub'] != null
            ) {
              total += params._source['data']['50L_pub'][2];
            }
            if (
              params._source['data']['75L_gen'] instanceof List && 
              params._source['data']['75L_gen'] != null
            ) {
              total += params._source['data']['75L_gen'][2];
            }
            if (
              params._source['data']['75L_pub'] instanceof List && 
              params._source['data']['75L_pub'] != null
            ) {
              total += params._source['data']['75L_pub'][2];
            }
            if (
              params._source['data']['ext'] instanceof List && 
              params._source['data']['ext'] != null
            ) {
              total += params._source['data']['ext'][2];
            }
            if (
              params._source['data']['etc'] instanceof List && 
              params._source['data']['etc'] != null
            ) {
              total += params._source['data']['etc'][2];
            }
            return total;`,
            lang: 'painless',
          },
        },
      },
    };
    const sumCollect: IOpenSearchResult = await this.openSearch.search({
      index: `${schema}.collect_metrics`,
      body: {
        query: {
          bool: {
            filter: [
              {
                match_phrase: {
                  'data.route_id': routeId,
                },
              },
              { range },
            ],
          },
        },
        aggs: aggsCollect,
      },
    });
    const total = data.body.hits.total.value;
    const result = data.body.hits.hits;
    const length = result.length;

    const diaries = [];
    for (let i = 0; i < length; i++) {
      const res = result[i]._source.data;
      res['collect_amount'] = result[i]._source['collect_amount'] || null;
      res['weight'] = result[i]._source['weight'] || null;
      res['duration'] = result[i]._source['duration'] || null;
      res['total_trip_distance'] =
        result[i]._source['total_trip_distance'] || null;
      diaries.push(res);
    }
    const last: IOpenSearchResult = await this.openSearch.search({
      index: `${schema}.drive_metrics`,
      body: {
        query: queryBody,
        sort: [{ 'data.timestamp': { order: 'desc' } }],
        size: 1,
      },
    });
    const first: IOpenSearchResult = await this.openSearch.search({
      index: `${schema}.drive_metrics`,
      body: {
        query: queryBody,
        sort: [{ 'data.timestamp': { order: 'asc' } }],
        size: 1,
      },
    });
    const entryNext = moment(
      last.body.hits.hits[0]._source.data.timestamp,
    ) as any;
    const totalDuration =
      entryNext -
      (moment(first.body.hits.hits[0]._source.data.timestamp) as any);
    const formatTotalDuration = moment()
      .startOf('day')
      .milliseconds(totalDuration)
      .format('HH:mm:ss');
    return {
      diaries,
      total,
      total_trip_distance: data.body.aggregations.total_trip_distance.value,
      total_collect_amount:
        sumCollect.body.aggregations.total_collect_amount.value,
      total_weight: sumCollect.body.aggregations.total_weight.value,
      totalDuration: formatTotalDuration,
    };
  }
}
