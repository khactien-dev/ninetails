import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IPaginate } from 'libs/common/common.interface';
import { StorageDataEntity } from 'libs/entities/storage-data.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { StorageQueryDto } from './revert.dto';
import { ETABLEROUTEMANAGE } from 'libs/common/constants/common.constant';
import { SectionEntity } from 'libs/entities/section.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { GuideEntity } from 'libs/entities/guide.entity';
import { PointEntity } from 'libs/entities/point.entity';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';

@Injectable()
export class RevertDataService {
  constructor(
    @Inject('STORAGE_DATA_REPO')
    private storageEntity: Repository<StorageDataEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
  ) {}

  async createWithTransaction(
    data: {
      table: string;
      old_data: object;
      new_data: object;
      type: string;
    },
    manage: EntityManager,
  ) {
    const saveData = {
      ...data,
      old_data: JSON.stringify(data.old_data),
      new_data: JSON.stringify(data.new_data),
    };
    return await manage.save(this.storageEntity.create(saveData));
  }

  async revertData(id: number, table?: ETABLEROUTEMANAGE) {
    if (!id) {
      if (!table) throw new BadRequestException('table field is missing');
      const check = await this.storageEntity.find({
        order: { id: 'DESC' },
        take: 1,
        where: { table },
      });
      id = check[0].id;
    }
    const storage = await this.storageEntity.findOne({
      where: { id },
    });
    if (!storage) {
      throw new BadRequestException('Storage Data not found');
    }
    if (storage.type === 'insert') {
      const data = JSON.parse(storage.new_data);
      if (storage.table === 'route') {
        const [section, coreSection, guide] = await Promise.all([
          this.dataSource.manager.findOne(SectionEntity, {
            where: { route_id: data.id },
          }),
          this.dataSource.manager.findOne(CoreSectionEntity, {
            where: { route_id: data.id },
          }),
          this.dataSource.manager.findOne(GuideEntity, {
            where: { route_id: data.id },
          }),
        ]);
        if (section) throw new BadRequestException('Route in use at Section');
        if (coreSection) {
          throw new BadRequestException('Route in use at Core Section');
        }
        if (guide) throw new BadRequestException('Route in use at Guide');
      } else if (storage.table === 'segment') {
        const [point, segmentRoute] = await Promise.all([
          this.dataSource.manager.findOne(PointEntity, {
            where: { segment_id: data.id },
          }),
          this.dataSource.manager.findOne(SegmentRouteMapEntity, {
            where: { segment_id: data.id },
          }),
        ]);
        if (point) {
          throw new BadRequestException('Segment in use at Point');
        }
        if (segmentRoute) {
          throw new BadRequestException('Segment in use at Segment Route');
        }
      } else if (storage.table === 'congestion_code') {
        const [segment, section] = await Promise.all([
          this.dataSource.manager.findOne(SegmentEntity, {
            where: { congestion: data.code },
          }),
          this.dataSource.manager.findOne(SectionEntity, {
            where: { congestion: data.code },
          }),
        ]);
        if (segment) {
          throw new BadRequestException('Congestion Code in use at Segment');
        }
        if (section) {
          throw new BadRequestException('Congestion Code in use at Section');
        }
      } else if (storage.table === 'guide_code') {
        const guide = await this.dataSource.manager.findOne(GuideEntity, {
          where: { type: data.code },
        });
        if (guide) throw new BadRequestException('Guide Code in use at Guide');
      }
      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(storage.table)
        .where(`id = ${data.id}`)
        .execute();
    } else if (storage.type === 'delete') {
      await this.dataSource
        .createQueryBuilder()
        .update(storage.table)
        .set({ deletedAt: null })
        .where(`id = ${JSON.parse(storage.old_data).id}`)
        .execute();
    } else {
      const data = JSON.parse(storage.old_data);
      data.deletedAt = null;
      if (
        storage.table === 'congestion_code' ||
        storage.table === 'guide_code'
      ) {
        await this.dataSource
          .createQueryBuilder()
          .update(storage.table)
          .set(data)
          .where(`code = ${data.code}`)
          .execute();
      } else {
        await this.dataSource
          .createQueryBuilder()
          .update(storage.table)
          .set(data)
          .where(`id = ${data.id}`)
          .execute();
      }
    }
    return;
  }

  async listRevert(criteria: StorageQueryDto, paginate: IPaginate) {
    const [list, total] = await this.storageEntity.findAndCount({
      ...paginate,
      where: { table: criteria.table },
    });
    return { list, total };
  }
}
