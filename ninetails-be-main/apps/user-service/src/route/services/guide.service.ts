import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RevertDataService } from '../../revert-data/revert.service';
import { GuideEntity } from 'libs/entities/guide.entity';
import { RouteEntity } from 'libs/entities/route.entity';
import {
  GUIDECODECOLUMN,
  GuideCodeCreateDto,
  GuideCodeQueryDto,
  GuideCodeUpdateDto,
  GUIDECOLUMN,
  GuideCreateDto,
  GuideQueryDto,
  GuideUpdateDto,
} from '../dtos/guide.dto';
import { IPaginate } from 'libs/common/common.interface';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { GuideCodeEntity } from 'libs/entities/guide-code.entity';

@Injectable()
export class GuideService {
  constructor(
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
    @Inject('GUIDE_REPO') private guideEntity: Repository<GuideEntity>,
    @Inject('GUIDE_CODE_REPO')
    private guideCodeEntity: Repository<GuideCodeEntity>,
  ) {}

  async create(datas: GuideCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const guides = [];
      for (const data of datas) {
        if (data.route_id > 0) {
          const route = await manage.findOne(RouteEntity, {
            where: { id: data.route_id },
          });
          if (!route) throw new BadRequestException('Route not found');
        }
        if (data.type) {
          const guideCode = await manage.findOne(GuideCodeEntity, {
            where: { code: data.type },
          });
          if (!guideCode) throw new BadRequestException('Guide Code not found');
        }
        if (data.bbox) {
          data.bbox = {
            type: 'Polygon',
            coordinates: data.bbox,
          };
        }
        const guide = await manage.save(this.guideEntity.create(data));
        await this.revertService.createWithTransaction(
          {
            table: 'guide',
            new_data: guide,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        guide.bbox = guide.bbox.coordinates || null;
        guides.push(guide);
      }
      await queryRunner.commitTransaction();
      return guides;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createGuideCode(datas: GuideCodeCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const guides = [];
      for (const data of datas) {
        const check = await manage.findOne(GuideCodeEntity, {
          where: { code: data.code },
        });
        if (check) throw new BadRequestException('Guide code is exists');
        const guide = await manage.save(this.guideCodeEntity.create(data));
        await this.revertService.createWithTransaction(
          {
            table: 'guide_code',
            new_data: guide,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        guides.push(guide);
      }
      await queryRunner.commitTransaction();
      return guides;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: GuideQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let { value } = obj;
        const logical = obj.logical || 'AND';
        if (column === GUIDECOLUMN.INSTRUCTIONS && typeof value !== 'string') {
          return { list: [], total: 0 };
        }
        if (column !== GUIDECOLUMN.INSTRUCTIONS) {
          if (isNaN(+value)) {
            return { list: [], total: 0 };
          } else {
            value = +value as any;
          }
        }
        if (operator === EOPERATOR.LIKE) {
          where +=
            (where ? ` ${logical} ` : '') +
            `${column} ${operator} '%${value}%'`;
        } else {
          if (
            operator === EOPERATOR.EQUALS &&
            column === GUIDECOLUMN.INSTRUCTIONS
          ) {
            where +=
              (where ? ` ${logical} ` : '') +
              `${column} ${operator} '${value}'`;
          } else {
            where +=
              (where ? ` ${logical} ` : '') + `${column} ${operator} ${value}`;
          }
        }
      }
    }
    const builder = this.guideEntity.createQueryBuilder();
    if (where) builder.where(where);
    const [list, total] = await builder
      .take(paginate.take)
      .skip(paginate.skip)
      .orderBy(
        Object.keys(paginate.order)[0],
        Object.values(paginate.order)[0] as any,
      )
      .getManyAndCount();
    return {
      list: list.map((l) => ({
        ...l,
        bbox: l.bbox?.coordinates || null,
        distance: +l.distance,
        duration: +l.duration,
      })),
      total,
    };
  }

  async findAndCountGuideCode(
    criteria: GuideCodeQueryDto[],
    paginate: IPaginate,
  ) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let { value } = obj;
        const logical = obj.logical || 'AND';
        if (
          column === GUIDECODECOLUMN.DESCRIPTION &&
          typeof value !== 'string'
        ) {
          return { list: [], total: 0 };
        }
        if (column !== GUIDECODECOLUMN.DESCRIPTION) {
          if (typeof value !== 'number') {
            return { list: [], total: 0 };
          } else {
            value = +value as any;
          }
        }
        if (operator === EOPERATOR.LIKE) {
          where +=
            (where ? `${logical} ` : '') + `${column} ${operator} '%${value}%'`;
        } else {
          where +=
            (where ? `${logical} ` : '') + `${column} ${operator} ${value}`;
        }
      }
    }
    const builder = this.guideCodeEntity.createQueryBuilder();
    if (where) builder.where(where);
    const [list, total] = await builder
      .take(paginate.take)
      .skip(paginate.skip)
      .orderBy(
        Object.keys(paginate.order)[0],
        Object.values(paginate.order)[0] as any,
      )
      .getManyAndCount();
    return { list, total };
  }

  async updateMany(datas: GuideUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const guide = await manage.findOne(GuideEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!guide) throw new BadRequestException('Guide Not Found');
        if (data.route_id > 0 && data.route_id !== guide.route_id) {
          const route = await manage.findOne(RouteEntity, {
            where: { id: data.route_id },
          });
          if (!route) throw new BadRequestException('Route Not Found');
        }
        if (data.type && data.type !== guide.type) {
          const guideCode = await manage.findOne(GuideCodeEntity, {
            where: { code: data.type },
          });
          if (!guideCode) throw new BadRequestException('Guide Code not found');
        }
        if (data.bbox) {
          data.bbox = {
            type: 'Polygon',
            coordinates: data.bbox,
          };
        }
        await manage.update(GuideEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'guide',
            new_data: data,
            old_data: guide,
            type: 'update',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateManyGuideCode(datas: GuideCodeUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const guideCode = await manage.findOne(GuideCodeEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!guideCode) throw new BadRequestException('Guide code Not Found');
        if (+data.code !== guideCode.code) {
          const check = await manage.findOne(GuideCodeEntity, {
            where: { code: data.code },
          });
          if (check) {
            throw new BadRequestException('Code is exists');
          }
        }
        await manage.update(GuideCodeEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'guide_code',
            new_data: data,
            old_data: guideCode,
            type: 'update',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMany(ids: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const id of ids) {
        const guide = await manage.findOne(GuideEntity, {
          where: { id },
        });
        if (!guide) throw new BadRequestException('Guide Not Found');
        await manage.softDelete(GuideEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'guide',
            new_data: null,
            old_data: guide,
            type: 'delete',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteManyGuideCode(ids: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const id of ids) {
        const guideCode = await manage.findOne(GuideCodeEntity, {
          where: { id },
        });
        if (!guideCode) throw new BadRequestException('Guide Not Found');
        const checkGuideUseCode = await manage.findOne(GuideEntity, {
          where: { type: guideCode.code },
        });
        if (checkGuideUseCode) {
          throw new BadRequestException('Guide Code in use at Guide table');
        }
        await manage.softDelete(GuideCodeEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'guide_code',
            new_data: null,
            old_data: guideCode,
            type: 'delete',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
