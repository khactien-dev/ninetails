import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { EdgeStateQueryDto } from './dto/edge-state.dto';
import { Between, DataSource, MoreThan, Repository } from 'typeorm';
import {
  EdgeState1DayEntity,
  EdgeState1HourEntity,
  EdgeStateRawEntity,
} from 'libs/entities/edge-state.entity';
import * as moment from 'moment';

@Injectable()
export class EdgeStateService {
  constructor(
    @Inject('OpenSearchClient') private readonly openSearch: Client,
    @Inject('EDGE_STATE_REPO')
    private edgeStateRawEntity: Repository<EdgeStateRawEntity>,
    @Inject('EDGE_STATE_1HOUR_REPO')
    private edgeState1HourEntity: Repository<EdgeState1HourEntity>,
    @Inject('EDGE_STATE_1DAY_REPO')
    private edgeState1DayEntity: Repository<EdgeState1DayEntity>,
    private dataSource: DataSource,
  ) {}

  async getLastEdgeState(criteria: { routeId: number; date: Date }) {
    const { date, routeId } = criteria;
    const edgeState = await this.edgeStateRawEntity.findOne({
      where: {
        route_id: routeId,
        date: Between(
          moment(date).startOf('day') as any,
          moment(date).endOf('day') as any,
        ),
      },
      order: { id: 'DESC' },
    });
    return edgeState;
  }

  async getEdgeStateRaw(data: EdgeStateQueryDto) {
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const [edgeStates, total] = await this.edgeStateRawEntity.findAndCount({
      where: {
        route_id: data.routeId,
        date: Between(
          moment(data.date).startOf('day') as any,
          moment(data.date).endOf('day') as any,
        ),
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      order: { id: 'DESC' },
    });
    return { result: edgeStates, total };
  }

  async getEdgeState30Min(data: EdgeStateQueryDto) {
    const edgeRaws = await this.edgeStateRawEntity
      .createQueryBuilder('e')
      .select('MIN(e.date)', 'min')
      .addSelect('MAX(e.date)', 'max')
      .where('e.date::date = :day', { day: data.date })
      .getRawOne();
    if (!edgeRaws?.min || !edgeRaws?.max) return { result: [], total: 0 };
    const packs: { start: Date; end: Date }[] = [];
    const packSize = 30 * 60 * 1000; // 30 phút
    let cursor = new Date(edgeRaws?.min);
    cursor.setSeconds(0, 0);
    while (cursor < edgeRaws?.max) {
      const packStart = new Date(cursor);
      const packEnd = new Date(cursor.getTime() + packSize - 1000); // trừ 1s để không bị overlap
      packs.push({ start: packStart, end: packEnd });
      cursor = new Date(cursor.getTime() + packSize);
    }
    const result: EdgeStateRawEntity[] = [];
    for (const { start, end } of packs) {
      const edgeRaws = await this.edgeStateRawEntity.find({
        where: {
          date: Between(start, end),
          route_id: data.routeId,
        },
        order: { id: 'DESC' },
      });
      const edgeRawsLength = edgeRaws.length;
      const alpha = 0.3;
      const ewm = edgeRaws[0];
      for (let i = 1; i < edgeRawsLength; i++) {
        const edgeRaw = edgeRaws[i];
        for (const edgeRawItem in edgeRaw) {
          if (
            [
              'id',
              'createdAt',
              'updatedAt',
              'deletedAt',
              'route_id',
              'date',
            ].includes(edgeRawItem)
          ) {
            continue;
          }
          ewm[edgeRawItem] =
            alpha * edgeRaw[edgeRawItem] + (1 - alpha) * ewm[edgeRawItem];
        }
      }
      result.push(ewm);
    }
    return { result, total: result.length };
  }

  async getEdgeState1Hour(data: EdgeStateQueryDto) {
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const [edgeStates, total] = await this.edgeState1HourEntity.findAndCount({
      where: {
        route_id: data.routeId,
        date: Between(
          moment(data.date).startOf('day') as any,
          moment(data.date).endOf('day') as any,
        ),
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      order: { id: 'DESC' },
    });
    return { result: edgeStates, total };
  }

  async getEdgeState1Day(data: EdgeStateQueryDto) {
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const [edgeStates, total] = await this.edgeState1DayEntity.findAndCount({
      where: {
        route_id: data.routeId,
        date: Between(
          moment().startOf('day').subtract(1, 'month') as any,
          moment().endOf('day') as any,
        ),
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      order: { id: 'DESC' },
    });
    return { result: edgeStates, total };
  }
}
